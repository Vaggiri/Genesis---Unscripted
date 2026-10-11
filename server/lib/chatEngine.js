/**
 * server/lib/chatEngine.js
 * 
 * Multilingual, database-grounded conversational engine.
 * No heavy LLM required; uses Unicode script detection, slot/intent extraction,
 * and database grounding. Optional lightweight Gemini classification fallback.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSupabase } from './supabase.js';
import { findEarliestSlot } from './scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load templates
const templates = {
  en: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'en.json'), 'utf8')),
  ta: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'ta.json'), 'utf8')),
  hi: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'hi.json'), 'utf8')),
  ml: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'ml.json'), 'utf8'))
};

/**
 * Detect language from text via Unicode blocks.
 */
export function detectLanguage(text, defaultLang = 'en') {
  if (!text) return defaultLang;
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari / Hindi
  return defaultLang || 'en';
}

function renderTemplate(lang, key, params = {}) {
  const dict = templates[lang] || templates.en;
  let tpl = dict[key] || templates.en[key] || '';
  for (const [k, v] of Object.entries(params)) {
    tpl = tpl.replace(new RegExp(`{{${k}}}`, 'g'), v);
  }
  return tpl;
}

/**
 * Classifies intent and extracts slots from the message.
 */
function classifyIntent(text) {
  const lower = text.toLowerCase();

  if (/\b(help|commands|உதவி|मदद|സഹായം|what can you do)\b/.test(lower)) {
    return { intent: 'help' };
  }

  if (/\b(person|human|incharge|in-charge|faculty|contact|phone|helpdesk|தொடர்பு|நேரடி|संपर्क|ഫോൺ)\b/.test(lower)) {
    return { intent: 'human_handoff' };
  }

  if (/\b(free|empty|vacant|classroom|lecture hall|வகுப்பறை|காலி|कक्षा|ക്ലാസ്)\b/.test(lower)) {
    return { intent: 'free_rooms' };
  }

  if (/\b(job|queue|status|file|3d print file|submission|வேலை|நிலை|स्थिति|സ്റ്റാറ്റസ്)\b/.test(lower) && !/\b(book|reserve)\b/.test(lower)) {
    return { intent: 'job_status' };
  }

  if (/\b(book|slot|reserve|schedule|machine|workstation|printer|வேண்டுகோள்|முன்பதிவு|நேரம்|स्लॉट|സ്ലോട്ട്)\b/.test(lower)) {
    return { intent: 'suggest_slot' };
  }

  if (/\b(stock|component|resistor|capacitor|ic|esp32|arduino|jetson|filament|wire|breadboard|இருப்பு|உள்ளதா|இருக்கிறதா|स्टॉक|ലഭ്യമാണോ)\b/.test(lower)) {
    // Extract component keywords
    const match = lower.match(/(10k\s*resistor|220\s*resistor|resistor|capacitor|esp32|jetson|pico|filament|fr4|pla|petg|sensor)/i);
    return { 
      intent: 'inventory_check', 
      query: match ? match[0] : lower.replace(/do you have|is there|any|stock|in stock|உள்ளதா|இருக்கிறதா/g, '').trim() 
    };
  }

  if (/\b(lab|fablab|hpc|robotics|eda|workshop|ஆய்வகம்|प्रयोगशाला|ലാബ്)\b/.test(lower)) {
    return { intent: 'lab_info' };
  }

  return { intent: 'unknown' };
}

export const ALLOWED_INTENTS = [
  'inventory_check',
  'lab_info',
  'suggest_slot',
  'job_status',
  'free_rooms',
  'help',
  'human_handoff'
];

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Classifies an unknown message using Gemini API with header-based key authentication.
 */
export async function classifyWithGemini(message, apiKey = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL) {
  if (!apiKey) return 'unknown';

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: `You are an intent classifier for a campus innovation facility portal. Classify the user input into EXACTLY ONE of the following intents: ${ALLOWED_INTENTS.join(', ')}. If none match, respond with unknown. Output ONLY the intent string with no quotes or extra text.`
          }]
        },
        contents: [{
          parts: [{
            text: message
          }]
        }]
      }),
      signal: AbortSignal.timeout(4000)
    });

    if (!geminiRes.ok) {
      console.warn(`Gemini classification failed (status ${geminiRes.status})`);
      return 'unknown';
    }

    const data = await geminiRes.json();
    const detected = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
    if (ALLOWED_INTENTS.includes(detected)) {
      return detected;
    }
    return 'unknown';
  } catch {
    console.warn('Gemini classification network error');
    return 'unknown';
  }
}

/**
 * Main chat engine pipeline.
 */
export async function processChatMessage({ message, preferredLanguage = 'en', userProfile: _userProfile = null }) {
  const lang = detectLanguage(message, preferredLanguage);
  let { intent, query } = classifyIntent(message);
  const supabase = getSupabase();

  // Optional Gemini fallback if intent is unknown and GEMINI_API_KEY is configured
  if (intent === 'unknown' && process.env.GEMINI_API_KEY) {
    const geminiIntent = await classifyWithGemini(message);
    if (ALLOWED_INTENTS.includes(geminiIntent)) {
      intent = geminiIntent;
    }
  }

  // Handle Intent Grounding with DB
  if (intent === 'help') {
    return {
      reply: renderTemplate(lang, 'help'),
      intent,
      lang
    };
  }

  if (intent === 'human_handoff') {
    return {
      reply: renderTemplate(lang, 'human_handoff'),
      intent,
      lang
    };
  }

  if (intent === 'inventory_check') {
    const searchTerm = query || 'resistor';
    let items = [];

    if (supabase) {
      const { data } = await supabase
        .from('inventory_items')
        .select('*, labs(name)')
        .ilike('name', `%${searchTerm.split(' ')[0]}%`)
        .limit(3);
      items = data || [];
    } else {
      // Fallback sample check
      items = [{
        name: '10k Ohm 1/4W Metal Film Resistors (Pack of 50)',
        quantity: 120,
        location: 'Drawer D-04 / Bin 12',
        updated_at: new Date().toISOString(),
        labs: { name: 'PCB Prototyping & EDA Fab' }
      }];
    }

    if (items.length > 0) {
      const item = items[0];
      const updatedDate = item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recently';
      return {
        reply: renderTemplate(lang, 'inventory_found', {
          name: item.name,
          lab: item.labs?.name || 'Central Lab',
          quantity: item.quantity,
          location: item.location || 'Storage Bin',
          updatedAt: updatedDate
        }),
        intent,
        lang
      };
    } else {
      return {
        reply: renderTemplate(lang, 'inventory_not_found', { query: searchTerm }),
        intent,
        lang
      };
    }
  }

  if (intent === 'free_rooms') {
    let freeRoomsList = 'AB1-101, AB1-102, AB2-105, AB3-301';
    if (supabase) {
      const { data } = await supabase.from('classrooms').select('id, room_number').limit(4);
      if (data && data.length > 0) {
        freeRoomsList = data.map(r => r.id).join(', ');
      }
    }
    return {
      reply: renderTemplate(lang, 'free_rooms', { rooms: freeRoomsList }),
      intent,
      lang
    };
  }

  if (intent === 'suggest_slot' || intent === 'lab_info') {
    // Ground with actual resources & scheduler
    let candidates = [
      { id: 'res-3d-bambu-x1', name: 'Bambu Lab X1-Carbon', kind: 'printer_3d', status: 'ok' },
      { id: 'res-ws-rtx4090-01', name: 'Dell Precision RTX 4090', kind: 'workstation', status: 'ok' }
    ];
    let existingBookings = [];

    if (supabase) {
      const [resData, bData] = await Promise.all([
        supabase.from('resources').select('*').eq('status', 'ok').limit(6),
        supabase.from('facility_bookings').select('*').in('status', ['pending', 'approved'])
      ]);
      if (resData.data && resData.data.length > 0) candidates = resData.data;
      if (bData.data) existingBookings = bData.data;
    }

    const slotResult = findEarliestSlot({
      candidates,
      durationMin: 90,
      notBefore: new Date(),
      existingBookings
    });

    const best = slotResult.best || {
      resourceId: 'res-3d-bambu-x1',
      resourceName: 'Bambu Lab X1-Carbon',
      start: new Date(Date.now() + 3600000).toISOString(),
      end: new Date(Date.now() + 9000000).toISOString()
    };

    const startTimeFormatted = new Date(best.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeFormatted = new Date(best.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const actionCard = {
      recommendedLabId: 'lab-fablab',
      recommendedLabName: 'Digital Fabrication & Prototyping Hub',
      recommendedSlot: `${startTimeFormatted} - ${endTimeFormatted}`,
      detectedSpecs: [best.resourceName, 'High-Precision FDM', 'PLA / PETG Capable'],
      resourceId: best.resourceId,
      start: best.start,
      end: best.end,
      readyToBook: true
    };

    return {
      reply: renderTemplate(lang, 'slot_suggested', {
        resourceName: best.resourceName,
        labName: 'Digital Fabrication Hub',
        start: startTimeFormatted,
        end: endTimeFormatted
      }),
      intent: 'suggest_slot',
      lang,
      actionCard
    };
  }

  // Default fallback
  return {
    reply: renderTemplate(lang, 'unknown'),
    intent: 'unknown',
    lang
  };
}

export const DEFAULT_OMNIROUTE_URL = 'http://localhost:20128/v1';
export const DEFAULT_OMNIROUTE_MODEL = 'vag';

/**
 * Queries the OmniRoute OpenAI-compatible gateway (e.g. http://localhost:20128/v1)
 * using the configured combo model (default: 'vag').
 */
export async function queryOmniRoute({
  message,
  history = [],
  baseUrl = process.env.OMNIROUTE_BASE_URL || DEFAULT_OMNIROUTE_URL,
  model = process.env.OMNIROUTE_MODEL || DEFAULT_OMNIROUTE_MODEL,
  apiKey = process.env.OMNIROUTE_API_KEY || 'sk-4cb24d557b65cf2e-fe47d8-c76f2729'
}) {
  const systemPrompt = `You are Amrita Yukti AI, an intelligent, helpful campus innovation and engineering assistant for Amrita Vishwa Vidyapeetham.
You assist students, faculty, and lab managers with:
1. Digital Fabrication & Prototyping (FabLab): 3D printing (Bambu Lab X1-Carbon, Prusa MK4), PCB prototyping (LPKF ProtoMat), CNC machining, laser cutting, and slicer/CAD recommendations.
2. Drawer Component Stock: Electronic components such as 10k and 220Ω resistors, electrolytic and ceramic capacitors, ESP32, Arduino Uno, Raspberry Pi, Jetson Nano, sensors, and ICs located in campus drawer bins.
3. Classroom & Lab Space Radar: Checking open lecture halls (AB1, AB2, AB3) and reserving workstations.
4. Institutional ICTS Hardware Requisitions: Laptop and monitor allocation requests for academic/research use.
5. Multilingual capability: Support English, Tamil (தமிழ்), Hindi (हिन्दी), and Malayalam (മലയാളം). If the user asks in an Indian language, respond in that language.
Be clear, accurate, friendly, and concise.`;

  const messagesPayload = [
    { role: 'system', content: systemPrompt }
  ];

  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      const role = h.sender === 'user' || h.role === 'user' ? 'user' : 'assistant';
      const text = h.text || h.content;
      if (text) {
        messagesPayload.push({ role, content: text });
      }
    }
  }

  messagesPayload.push({ role: 'user', content: message });

  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: messagesPayload,
      temperature: 0.7,
      max_tokens: 800
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    throw new Error(`OmniRoute error: HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || 'I have processed your query through OmniRoute.';

  // Check if an action card for slot booking should be attached
  let actionCard = null;
  const lowerMsg = message.toLowerCase();
  if (/\b(book|slot|reserve|schedule|printer|bambu)\b/.test(lowerMsg)) {
    const best = {
      resourceId: 'res-3d-bambu-x1',
      resourceName: 'Bambu Lab X1-Carbon',
      start: new Date(Date.now() + 3600000).toISOString(),
      end: new Date(Date.now() + 9000000).toISOString()
    };
    const startTimeFormatted = new Date(best.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeFormatted = new Date(best.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    actionCard = {
      recommendedLabId: 'lab-fablab',
      recommendedLabName: 'Digital Fabrication & Prototyping Hub',
      recommendedSlot: `${startTimeFormatted} - ${endTimeFormatted}`,
      detectedSpecs: [best.resourceName, 'High-Precision FDM', 'PLA / PETG Capable'],
      resourceId: best.resourceId,
      start: best.start,
      end: best.end,
      readyToBook: true
    };
  }

  return {
    reply,
    model,
    provider: 'omniroute',
    mode: 'cloud',
    actionCard
  };
}

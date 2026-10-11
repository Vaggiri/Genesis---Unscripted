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

// Load templates with in-memory fallback for bundled serverless runtimes
const defaultTemplates = {
  en: {
    greeting: "Hello! I am Amrita Yukti, your campus innovation and space assistant. How can I help you today?",
    help: "I can help you check component drawer stock, find lab equipment, schedule workstation & 3D print slots, verify free lecture halls, or connect you with lab in-charges.",
    inventory_found: "Found {{name}} in {{lab}}: {{quantity}} units available at {{location}} (Last updated: {{updatedAt}}).",
    inventory_not_found: "We currently do not have \"{{query}}\" listed in the drawer inventory. You can request stock from the lab in-charge.",
    lab_info: "{{name}} is located at {{block}}, Floor {{floor}} (Capacity: {{capacity}} students). In-charge: {{incharge}}.",
    labs_list: "Available campus innovation hubs:\n• AI & High Performance Computing Lab (AB-3, Floor 3)\n• Digital Fabrication Hub (AB-1, Floor 1)\n• IoT, Robotics & Automation Centre (AB-2, Floor 2)\n• PCB Prototyping & EDA Fab (AB-1, Floor 2)\n• Mechanical Workshop (AB-2, Floor 0)",
    slot_suggested: "Recommended slot for {{resourceName}} in {{labName}}: {{start}} to {{end}}.",
    free_rooms: "Currently available rooms on campus: {{rooms}}.",
    human_handoff: "For immediate in-person assistance, contact:\n• FabLab In-charge: Er. Rajesh V. (FAB-01)\n• AI & HPC Lab: Dr. K. Swaminathan (AMR-FAC-209)\n• Campus Helpdesk: Ext 4022",
    unknown: "I am not certain about that request. You can ask me to check components (e.g. 'do you have 10k resistors'), book a lab slot, or type 'help'."
  },
  ta: {
    greeting: "வணக்கம்! நான் அம்ரிதா யுக்தி, உங்களின் வளாகக் கண்டுபிடிப்பு மற்றும் இட ஒதுக்கீட்டு உதவியாளர். உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?",
    help: "கூறு பொருட்களின் இருப்பு (component stock), ஆய்வக இயந்திரங்கள், கணினி பணிநிலைய முன்பதிவு, காலி வகுப்பறைகள் ஆகியவற்றை நான் சரிபார்க்க உதவ முடியும்.",
    inventory_found: "{{name}} பொருள் {{lab}} ஆய்வகத்தில் உள்ளது: {{quantity}} இருப்பு உள்ளன (இடம்: {{location}}, புதுப்பிக்கப்பட்டது: {{updatedAt}}).",
    inventory_not_found: "\"{{query}}\" என்ற கூறு பொருள் தற்போது இருப்பில் இல்லை. ஆய்வகப் பொறுப்பாளரிடம் கோரிக்கை வைக்கலாம்.",
    lab_info: "{{name}} ஆய்வகம் {{block}}, தளம் {{floor}}-ல் அமைந்துள்ளது (கொள்ளளவு: {{capacity}} மாணவர்கள்).",
    labs_list: "வளாக கண்டுபிடிப்பு மையங்கள்:\n• செயற்கை நுண்ணறிவு மற்றும் HPC ஆய்வகம் (AB-3)\n• டிஜிட்டல் ஃபேப்லாப் (AB-1)\n• ஐஓடி மற்றும் ரோபோடிக்ஸ் மையம் (AB-2)\n• பிசிபி வடிவமைப்பு ஆய்வகம் (AB-1)",
    slot_suggested: "{{resourceName}} இயந்திரத்திற்கான பரிந்துரைக்கப்பட்ட நேரம்: {{start}} முதல் {{end}} வரை.",
    free_rooms: "தற்போது காலியாக உள்ள வகுப்பறைகள்: {{rooms}}.",
    human_handoff: "நேரடி உதவிக்கு தொடர்பு கொள்ளவும்:\n• ஃபேப்லாப் பொறுப்பாளர்: Er. ராஜேஷ் வி.\n• AI ஆய்வகம்: Dr. K. சுவாமிநாதன்\n• உதவி மையம்: Ext 4022",
    unknown: "மன்னிக்கவும், உங்கள் கோரிக்கை புரியவில்லை. 'resistors இருக்கிறதா' அல்லது 'help' என்று கேட்கலாம்."
  },
  te: {
    greeting: "నమస్కారం! నేను అమృత యుక్తి, మీ క్యాంపస్ ఆవిష్కరణ మరియు స్థల సహాయకుడిని. మీకు నేను ఎలా సహాయపడగలను?",
    help: "కాంపోనెంట్ డ్రాయర్ స్టాక్, ల్యాబ్ మెషీన్లు, 3D ప్రింటర్ స్లాట్లు, ఖాళీ తరగతి గదులను తనిఖీ చేయడానికి నేను సహాయపడగలను.",
    inventory_found: "{{name}} కాంపోనెంట్ {{lab}} ల్యాబ్‌లో అందుబాటులో ఉంది: {{quantity}} యూనిట్లు ఉన్నాయి (స్థానం: {{location}}, నవీకరించబడింది: {{updatedAt}}).",
    inventory_not_found: "\"{{query}}\" ప్రస్తుతం డ్రాయర్ స్టాక్‌లో అందుబాటులో లేదు. మీరు ల్యాబ్ ఇన్‌చార్జ్‌ని సంప్రదించవచ్చు.",
    lab_info: "{{name}} ల్యాబ్ {{block}}, ఫ్లోర్ {{floor}} లో ఉంది (సామర్థ్యం: {{capacity}} విద్యార్థులు).",
    labs_list: "క్యాంపస్ ఇన్నోవేషన్ ల్యాబ్‌లు:\n• AI & హై పెర్ఫార్మెన్స్ కంప్యూటింగ్ ల్యాబ్ (AB-3)\n• డిజిటల్ ఫ్యాబ్‌ల్యాబ్ (AB-1)\n• IoT & రోబోటిక్స్ సెంటర్ (AB-2)\n• PCB ప్రోటోటైపింగ్ ల్యాబ్ (AB-1)",
    slot_suggested: "{{resourceName}} యంత్రం కోసం కేటాయించిన సమయం: {{start}} నుండి {{end}} వరకు.",
    free_rooms: "ప్రస్తుతం ఖాళీగా ఉన్న తరగతి గదులు: {{rooms}}.",
    human_handoff: "సహాయం కోసం సంప్రదించండి:\n• ఫ్యాబ్‌ల్యాబ్ ఇన్‌చార్జ్: Er. రాజేష్ V.\n• AI ల్యాబ్: Dr. K. స్వామినాథన్\n• హెల్ప్‌డెస్క్: Ext 4022",
    unknown: "క్షమించండి, మీ అభ్యర్థన అర్థం కాలేదు. '10k resistors ఉందా' లేదా 'help' అని అడగండి."
  },
  hi: {},
  ml: {}
};

let templates = defaultTemplates;
try {
  templates = {
    en: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'en.json'), 'utf8')),
    ta: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'ta.json'), 'utf8')),
    te: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'te.json'), 'utf8')),
    hi: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'hi.json'), 'utf8')),
    ml: JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'ml.json'), 'utf8'))
  };
} catch (err) {
  console.warn('Notice: Using embedded chat templates in serverless environment:', err.message);
}

/**
 * Detect language from text via Unicode blocks and colloquial scripts.
 */
export function detectLanguage(text, defaultLang = 'en') {
  if (!text) return defaultLang;
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil script
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu script
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam script
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari / Hindi script

  // Code-mixed detection for Tanglish (Tamil in Latin script)
  const lower = text.toLowerCase();
  if (/\b(vanakkam|enga|irukku|irukka|venum|aayvagam|udhavi|solunga|eppadi|endha|ennanna|thevai)\b/.test(lower)) return 'ta';
  // Code-mixed detection for Tenglish (Telugu in Latin script)
  if (/\b(namaskaram|ekkada|undi|unda|kavali|prayogasala|sahayam|cheppandi|ela|emundi|emundhi|taragathi)\b/.test(lower)) return 'te';

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
 * Helper to match either ASCII words with word boundaries or Unicode substring tokens.
 */
function matchesAny(text, latinWords = [], unicodeTokens = []) {
  const lower = text.toLowerCase();
  for (const token of unicodeTokens) {
    if (lower.includes(token.toLowerCase())) return true;
  }
  if (latinWords.length > 0) {
    const rx = new RegExp(`(^|\\s|[^\\w])(${latinWords.join('|')})($|\\s|[^\\w])`, 'i');
    if (rx.test(lower)) return true;
  }
  return false;
}

/**
 * Normalizes multi-lingual component search queries (Tamil, Telugu, English) to match DB inventory records.
 */
export function normalizeComponentSearch(text) {
  if (!text) return 'resistor';
  let t = text.toLowerCase();
  // Map Indic hardware terms to standard English keywords
  t = t.replace(/(ரெசிஸ்டர்|ரெசிஸ்டர்கள்|రెసిస్టర్|రెసిస్టర్లు)/g, 'resistor');
  t = t.replace(/(கெபாசிட்டர்|కెపాసిటర్)/g, 'capacitor');
  t = t.replace(/(சென்சார்|సెన్సార్)/g, 'sensor');
  t = t.replace(/(பிலமென்ட்|ఫిలమెంట్)/g, 'filament');
  t = t.replace(/(போர்டு|బోర్డు)/g, 'board');
  t = t.replace(/(பிரிண்டர்|ప్రింటర్)/g, 'printer');

  const match = t.match(/(10k\s*resistor|220\s*resistor|resistor|capacitor|esp32|jetson|pico|arduino|filament|fr4|pla|petg|sensor)/i);
  if (match) return match[0];

  const cleaned = t.replace(/do you have|is there|any|stock|in stock|உள்ளதா|இருக்கிறதா|இருக்கா|இருப்பு|கிடைக்குமா|ఉందా|ఉన్నాయా|స్టాక్|లభ్యత|దొరుకుతుందా|irukka|irukku|unda|unnaya/g, '').trim();
  return cleaned || 'resistor';
}

/**
 * Classifies intent and extracts slots from the message across English, Tamil, Telugu, Hindi, and Malayalam.
 */
export function classifyIntent(text) {
  const lower = text.toLowerCase();

  // 1. Help intent
  if (matchesAny(
    lower,
    ['help', 'commands', 'udhavi', 'sahayam', 'madad', 'what can you do', 'enni cheyagalaru', 'enna seiya mudiyum'],
    ['உதவி', 'உதவுங்கள்', 'मदद', 'സഹായം', 'సహాయం', 'సహాయపడగలరు']
  )) {
    return { intent: 'help' };
  }

  // 2. Human handoff / contact
  if (matchesAny(
    lower,
    ['person', 'human', 'incharge', 'in-charge', 'faculty', 'contact', 'phone', 'helpdesk', 'thodarbu', 'samparkam', 'help desk'],
    ['தொடர்பு', 'நேரடி', 'ஆசிரியர்', 'இன்சார்ஜ்', 'संपर्क', 'ഫോൺ', 'సంప్రదించండి', 'సంప్రదించు', 'ఫోన్', 'హెల్ప్‌డెస్క్']
  )) {
    return { intent: 'human_handoff' };
  }

  // 3. Free classrooms
  if (matchesAny(
    lower,
    ['free', 'empty', 'vacant', 'classroom', 'lecture hall', 'taragathi', 'khali', 'kaali', 'gadi', 'gadulu'],
    ['வகுப்பறை', 'காலி', 'कक्षा', 'ക്ലാസ്', 'తరగతి', 'ఖాళీ', 'గదులు']
  )) {
    return { intent: 'free_rooms' };
  }

  // 4. Job status
  if (matchesAny(
    lower,
    ['job', 'queue', 'status', 'submission', 'sthiti', 'velai'],
    ['வேலை', 'நிலை', 'स्थिति', 'സ്റ്റാറ്റസ്', 'ఉద్యోగం', 'స్థితి']
  ) && !matchesAny(lower, ['book', 'reserve', 'munpadhivu', 'kavali', 'venum'], ['முன்பதிவு', 'బుకింగ్'])) {
    return { intent: 'job_status' };
  }

  // 5. Suggest slot / machine booking
  if (matchesAny(
    lower,
    ['book', 'slot', 'reserve', 'schedule', 'machine', 'workstation', 'printer', 'kavali', 'venum', 'thevai', 'munpadhivu', 'booking'],
    ['வேண்டுகோள்', 'முன்பதிவு', 'நேரம்', 'ஸ்லாட்', 'स्लॉट', 'സ്ലോട്ട്', 'బుకింగ్', 'స్లాట్', 'కేటాయింపు', 'కావాలి', 'ప్రింటర్']
  )) {
    return { intent: 'suggest_slot' };
  }

  // 6. Inventory / component check
  if (matchesAny(
    lower,
    ['stock', 'component', 'resistor', 'capacitor', 'ic', 'esp32', 'arduino', 'jetson', 'filament', 'wire', 'breadboard', 'irukka', 'irukku', 'unda', 'unnaya', 'kedaikuma', 'dorukutunda'],
    ['இருப்பு', 'உள்ளதா', 'இருக்கிறதா', 'இருக்கா', 'ரெசிஸ்டர்', 'கெபாசிட்டர்', 'சென்சார்', 'பிலமென்ட்', 'स्टॉक', 'ലഭ്യമാണോ', 'స్టాక్', 'ఉందా', 'ఉన్నాయా', 'లభ్యత', 'దొరుకుతుందా', 'రెసిస్టర్', 'కెపాసిటర్', 'సెన్సార్']
  )) {
    const query = normalizeComponentSearch(lower);
    return { intent: 'inventory_check', query };
  }

  // 7. Lab info
  if (matchesAny(
    lower,
    ['lab', 'fablab', 'hpc', 'robotics', 'eda', 'workshop', 'aayvagam', 'prayogasala'],
    ['ஆய்வகம்', 'ஆய்வகங்கள்', 'प्रयोगशाला', 'ലാബ്', 'ప్రయోగశాల', 'ప్రయోగశాలలు', 'ల్యాబ్']
  )) {
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
    const searchTerm = normalizeComponentSearch(query || message);
    let items = [];

    if (supabase) {
      const keyword = searchTerm.split(' ')[0] || 'resistor';
      const { data } = await supabase
        .from('inventory_items')
        .select('*, labs(name)')
        .ilike('name', `%${keyword}%`)
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
5. Multilingual Native Fluency: Fully fluent in English, Tamil (தமிழ்), Telugu (తెలుగు), Hindi (हिन्दी), and Malayalam (മലയാളം). You effortlessly comprehend colloquial speech and phonetic spellings (Tanglish such as 'enga irukku / venum', Tenglish such as 'ekkada undi / kavali', Hinglish). Always reply warmly, accurately, and naturally in the user's spoken or preferred language.
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
  if (matchesAny(
    lowerMsg,
    ['book', 'slot', 'reserve', 'schedule', 'printer', 'bambu', 'munpadhivu', 'kavali', 'venum'],
    ['முன்பதிவு', 'ஸ்லாட்', 'బుకింగ్', 'స్లాట్', 'కేటాయింపు', 'ప్రింటర్']
  )) {
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

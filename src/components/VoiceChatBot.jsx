import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight,
  Cloud,
  Zap,
  Languages
} from 'lucide-react';
import { api } from '../services/api';

let msgCounter = 0;
function createMessageId() {
  msgCounter += 1;
  return `msg-${Date.now()}-${msgCounter}`;
}

const SUPPORTED_LANGUAGES = [
  { code: 'ta', bcp47: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳', label: 'Tamil' },
  { code: 'te', bcp47: 'te-IN', name: 'తెలుగు', flag: '🇮🇳', label: 'Telugu' },
  { code: 'en', bcp47: 'en-IN', name: 'English', flag: '🌐', label: 'English' },
  { code: 'hi', bcp47: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳', label: 'Hindi' },
  { code: 'ml', bcp47: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳', label: 'Malayalam' },
];

const langCodes = {
  ta: 'ta-IN',
  te: 'te-IN',
  en: 'en-IN',
  hi: 'hi-IN',
  ml: 'ml-IN'
};

const placeholders = {
  ta: 'தமிழில் பேசுங்கள் அல்லது தட்டச்சு செய்யுங்கள் (எ.கா: 10k resistor உள்ளதா?)...',
  te: 'తెలుగులో మాట్లాడండి లేదా టైప్ చేయండి (ఉదా: 10k resistors ఉందా?)...',
  en: 'Ask in English or speak into mic (e.g. 10k resistors in stock?)...',
  hi: 'हिन्दी में बोलें या टाइप करें (उदा: 10k resistor उपलब्ध है?)...',
  ml: 'മലയാളത്തിൽ ചോദിക്കൂ (ഉദാ: 10k resistor ഉണ്ടോ?)...'
};

export default function VoiceChatBot({ onBookSlot, currentUser: _currentUser }) {
  const [modelMode, setModelMode] = useState('cloud'); // 'cloud' | 'local'
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Vanakkam & Namaskaram! I am Amrita Yukti AI, your multilingual campus innovation assistant.\n\n🎙️ You can speak or chat in English, தமிழ் (Tamil), or తెలుగు (Telugu)!\n• Component drawers (10k resistors / 10k ரெசிஸ்டர் / 10k రెసిస్టర్లు)\n• 3D printer slots & FabLab reservations\n• Vacant classrooms & ICTS hardware allocation\n\nChoose your voice language below and click the microphone to speak naturally!',
      mode: 'cloud',
      model: 'vag'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('ta'); // Default to Tamil so Tamil speech recognition is active right away
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() => Boolean(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)));
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [actionCardData, setActionCardData] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    // Detect Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ta-IN';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, actionCardData]);

  const handleSelectLanguage = (newLang) => {
    setLanguage(newLang);
    const targetBcp = langCodes[newLang] || 'en-IN';
    if (recognitionRef.current) {
      recognitionRef.current.lang = targetBcp;
      if (isListening) {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.lang = targetBcp;
              recognitionRef.current.start();
              setIsListening(true);
            }
          }, 150);
        } catch {
          // Handled gracefully
        }
      }
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const targetBcp = langCodes[language] || 'ta-IN';
      recognitionRef.current.lang = targetBcp;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  const speakText = (text, forcedLang = null) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const currentLangCode = forcedLang || language;
    const targetBcp47 = langCodes[currentLangCode] || 'en-IN';
    utterance.lang = targetBcp47;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matched = voices.find(v => v.lang === targetBcp47 || v.lang.replace('_', '-') === targetBcp47) ||
                      voices.find(v => v.lang.startsWith(targetBcp47.split('-')[0]));
      if (matched) {
        utterance.voice = matched;
      }
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend = null, explicitLang = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const currentLang = explicitLang || language;
    if (explicitLang && explicitLang !== language) {
      handleSelectLanguage(explicitLang);
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = {
      id: createMessageId(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setActionCardData(null);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));

      const response = await api.sendChatMessage(query, currentLang, modelMode, historyPayload);
      const botText = response.reply || 'I have checked our campus records.';

      const botMsg = {
        id: createMessageId(),
        sender: 'bot',
        text: botText,
        mode: response.mode || modelMode,
        model: response.model || (modelMode === 'cloud' ? 'vag' : 'local'),
        fallbackNotice: response.fallbackNotice
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(botText, response.lang || currentLang);

      if (response.actionCard) {
        setActionCardData(response.actionCard);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: createMessageId(),
          sender: 'bot',
          text: `⚠️ Engine error: ${err.message}. Please check connection or switch to the Local Model toggle above.`,
          mode: modelMode
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmActionCard = () => {
    if (actionCardData && onBookSlot) {
      onBookSlot(actionCardData);
    }
  };

  const quickPrompts = [
    { label: '🇮🇳 தமிழ்: 10k resistor உள்ளதா?', query: '10k resistor ஆய்வகத்தில் உள்ளதா?', lang: 'ta' },
    { label: '🇮🇳 தமிழ்: 3D பிரிண்டர் முன்பதிவு', query: '3D பிரிண்டர் முன்பதிவு செய்ய வேண்டும்', lang: 'ta' },
    { label: '🇮🇳 తెలుగు: 10k resistors ఉందా?', query: '10k resistors స్టాక్ ఉందా?', lang: 'te' },
    { label: '🇮🇳 తెలుగు: 3D ప్రింటర్ స్లాట్ కావాలి', query: '3D ప్రింటర్ స్లాట్ కావాలి', lang: 'te' },
    { label: '🔍 10k Resistors', query: 'Do we have 10k resistors in stock?', lang: 'en' },
    { label: '🖨️ Bambu Lab Slot', query: 'Suggest an open slot for 3D printer today', lang: 'en' },
    { label: '🏫 Free Classrooms', query: 'Which lecture halls are currently free?', lang: 'en' }
  ];

  return (
    <div className="card-amrita flex flex-col h-[600px] overflow-hidden shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-amrita-maroon text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: '#ffffff', margin: 0 }}>
              Amrita Yukti AI
              <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse" />
            </h3>
            <p className="text-xs text-white/80" style={{ color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              {modelMode === 'cloud' 
                ? '☁️ OmniRoute Cloud Model (vag @ localhost:20128)' 
                : '⚡ Local Model (Campus Database & Rule Grounded)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* AI Model Toggle Switch */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.28)',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              gap: '2px'
            }}
          >
            <button
              type="button"
              onClick={() => setModelMode('cloud')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '7px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: modelMode === 'cloud' ? '#ffffff' : 'transparent',
                color: modelMode === 'cloud' ? 'var(--amrita-maroon)' : '#ffffff',
                boxShadow: modelMode === 'cloud' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Cloud Model via OmniRoute (combo: vag at http://localhost:20128/v1)"
            >
              <Cloud size={13} />
              <span>Cloud (vag)</span>
            </button>
            <button
              type="button"
              onClick={() => setModelMode('local')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '7px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: modelMode === 'local' ? '#ffffff' : 'transparent',
                color: modelMode === 'local' ? 'var(--amrita-maroon)' : '#ffffff',
                boxShadow: modelMode === 'local' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Local Model (Campus Grounded & Regex Pattern Engine)"
            >
              <Zap size={13} />
              <span>Local Model</span>
            </button>
          </div>

          {/* TTS Toggle */}
          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-1.5 rounded-lg border transition ${
              ttsEnabled ? 'bg-white text-amrita-maroon border-white' : 'border-white/30 text-white hover:bg-white/10'
            }`}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}
            title={ttsEnabled ? 'Mute voice response' : 'Enable spoken voice response'}
          >
            {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Language Selector in Header */}
          <select
            value={language}
            onChange={(e) => handleSelectLanguage(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              cursor: 'pointer'
            }}
            title="Active Assistant Language"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} style={{ color: '#0f172a', background: '#ffffff' }}>
                {l.flag} {l.name} ({l.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Model & Language Status Strip */}
      <div style={{
        padding: '0.45rem 1rem',
        backgroundColor: modelMode === 'cloud' ? '#fbf8ff' : '#fffbeb',
        borderBottom: `1px solid ${modelMode === 'cloud' ? '#e9d5ff' : '#fef3c7'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>Active AI Model:</span>
          {modelMode === 'cloud' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#7e22ce', fontWeight: 800 }}>
              <Cloud size={13} /> OmniRoute Gateway • Combo: <code>vag</code>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#b45309', fontWeight: 800 }}>
              <Zap size={13} /> Campus Local Grounded Model
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--amrita-maroon)', fontWeight: 700 }}>
          <span>Voice Acoustic Mode:</span>
          <span style={{ 
            backgroundColor: '#ffffff', 
            padding: '1px 6px', 
            borderRadius: '6px', 
            border: '1px solid #e2e8f0', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '3px' 
          }}>
            {activeLangObj.flag} {activeLangObj.name} ({activeLangObj.bcp47})
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-amrita-maroon text-white' : 'bg-white border border-gray-200 text-amrita-maroon'
              }`}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className={`p-3.5 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                isUser
                  ? 'bg-amrita-maroon text-white rounded-tr-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}>
                {!isUser && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: m.mode === 'cloud' ? '#f3e8ff' : '#fef3c7',
                      color: m.mode === 'cloud' ? '#6b21a8' : '#92400e',
                      border: `1px solid ${m.mode === 'cloud' ? '#d8b4fe' : '#fde68a'}`
                    }}>
                      {m.mode === 'cloud' ? '☁️ OmniRoute (vag)' : '⚡ Local Engine'}
                    </span>
                    {m.fallbackNotice && (
                      <span style={{ fontSize: '0.65rem', color: '#d97706', fontStyle: 'italic' }}>
                        (Fallback to Local)
                      </span>
                    )}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          );
        })}

        {/* Action Confirmation Card (Proceed to Book UI) */}
        {actionCardData && (
          <div className="bg-white border-2 border-amrita-maroon/30 rounded-2xl p-4 shadow-md space-y-3 max-w-[85%] ml-11">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold uppercase text-amrita-maroon tracking-wider flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" />
                Recommended Machine Slot
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Earliest Grid Match
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-gray-900 text-sm">{actionCardData.recommendedLabName}</h4>
              <p className="text-gray-600 font-semibold">Slot Window: {actionCardData.recommendedSlot}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(actionCardData.detectedSpecs || []).map((spec, i) => (
                  <span key={i} className="badge-amrita text-[10px]">{spec}</span>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmActionCard}
              className="w-full btn-amrita py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
              style={{ cursor: 'pointer' }}
            >
              <span>Proceed to Book Machine</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-xs italic ml-11">
            <span className="animate-spin w-3 h-3 border-2 border-amrita-maroon border-t-transparent rounded-full" />
            Amrita Yukti is scanning live campus database...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 bg-gray-100/70 border-t border-gray-200 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-2 shrink-0">Quick:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p.query, p.lang)}
            className="bg-white hover:bg-gray-200 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition shadow-2xs"
            style={{ cursor: 'pointer' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Multilingual Voice Bar */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-wider shrink-0">
          <Languages size={13} className="text-amrita-maroon" />
          <span>Voice Language:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {SUPPORTED_LANGUAGES.map((langItem) => {
            const isActive = language === langItem.code;
            return (
              <button
                key={langItem.code}
                type="button"
                onClick={() => handleSelectLanguage(langItem.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-amrita-maroon text-white shadow-sm ring-1 ring-amrita-maroon'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
                style={{ cursor: 'pointer' }}
                title={`Set Voice & Input Recognition to ${langItem.name} (${langItem.bcp47})`}
              >
                <span>{langItem.flag}</span>
                <span>{langItem.name}</span>
                <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  ({langItem.bcp47})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Listening Pulse Indicator */}
      {isListening && (
        <div className="px-3 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between gap-2 text-xs text-rose-800 shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
            <span>🎙️ Listening in {activeLangObj.flag} {activeLangObj.name} ({activeLangObj.bcp47})... Speak clearly now!</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (recognitionRef.current) recognitionRef.current.stop();
              setIsListening(false);
              if (input.trim()) handleSend();
            }}
            className="px-2.5 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition"
            style={{ cursor: 'pointer' }}
          >
            Done & Send
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-gray-200 shrink-0 space-y-1.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {speechSupported && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`rounded-xl border transition shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                }`}
                style={{
                  width: '42px',
                  height: '42px',
                  minWidth: '42px',
                  minHeight: '42px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isListening ? `Stop listening in ${activeLangObj.name}` : `Speak into mic in ${activeLangObj.name} (${activeLangObj.bcp47})`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <span style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                fontSize: '9px',
                fontWeight: 800,
                backgroundColor: isListening ? '#e11d48' : '#0f172a',
                color: '#ffffff',
                padding: '0 3px',
                borderRadius: '4px',
                lineHeight: '12px'
              }}>
                {activeLangObj.code.toUpperCase()}
              </span>
            </div>
          )}

          <input
            type="text"
            id="voice-chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? `Listening in ${activeLangObj.name} (${activeLangObj.bcp47})...` : (placeholders[language] || placeholders.en)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amrita-maroon"
            style={{ minHeight: '42px', backgroundColor: '#ffffff', color: 'var(--text-main)' }}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-amrita rounded-xl disabled:opacity-40 shrink-0"
            style={{
              width: '42px',
              height: '42px',
              minWidth: '42px',
              minHeight: '42px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={18} />
          </button>
        </form>

        {speechSupported && (
          <p className="text-[10px] text-gray-400 text-center">
            🔒 Web Speech recognition runs natively in browser using acoustic model ({activeLangObj.bcp47}). No audio data is uploaded.
          </p>
        )}
      </div>
    </div>
  );
}

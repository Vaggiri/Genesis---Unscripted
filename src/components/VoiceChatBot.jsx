import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function VoiceChatBot({ onBookSlot, currentUser: _currentUser }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Vanakkam! I am Amrita Yukti AI, your campus innovation assistant. Ask me about drawer stock (e.g. 10k resistors), 3D printer slots, vacant classrooms, or speak in Tamil, Hindi, or Malayalam!'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() => Boolean(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)));
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [actionCardData, setActionCardData] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Detect Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

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

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const langCodes = {
        en: 'en-IN',
        ta: 'ta-IN',
        hi: 'hi-IN',
        ml: 'ml-IN'
      };
      recognitionRef.current.lang = langCodes[language] || 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCodes = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN' };
    utterance.lang = langCodes[language] || 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setActionCardData(null);

    try {
      const response = await api.sendChatMessage(query, language);
      const botText = response.reply || 'I have checked our campus records.';

      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: botText
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(botText);

      if (response.actionCard) {
        setActionCardData(response.actionCard);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: `⚠️ Engine error: ${err.message}. Please check connection or ask in standard keywords.`
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
    { label: '🔍 10k Resistors', query: 'Do we have 10k resistors in stock?' },
    { label: '🖨️ Bambu Lab Slot', query: 'Suggest an open slot for 3D printer today' },
    { label: '🏫 Free Classrooms', query: 'Which lecture halls are currently free?' },
    { label: '🇮🇳 தமிழ் உதவி', query: 'வளாகத்தில் உள்ள ஆய்வகங்கள் என்னென்ன?' }
  ];

  return (
    <div className="card-amrita flex flex-col h-[600px] overflow-hidden shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-amrita-maroon text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: '#ffffff' }}>
              Amrita Yukti AI
              <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse" />
            </h3>
            <p className="text-xs text-white/80" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Multilingual Database-Grounded Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TTS Toggle */}
          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-1.5 rounded-lg border transition ${
              ttsEnabled ? 'bg-white text-amrita-maroon border-white' : 'border-white/30 text-white hover:bg-white/10'
            }`}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '34px', minHeight: '34px' }}
            title={ttsEnabled ? 'Mute voice response' : 'Enable spoken voice response'}
          >
            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="en" style={{ color: '#0f172a', background: '#ffffff' }}>English</option>
            <option value="ta" style={{ color: '#0f172a', background: '#ffffff' }}>தமிழ் (Tamil)</option>
            <option value="hi" style={{ color: '#0f172a', background: '#ffffff' }}>हिन्दी (Hindi)</option>
            <option value="ml" style={{ color: '#0f172a', background: '#ffffff' }}>മലയാളം (Malayalam)</option>
          </select>
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
            onClick={() => handleSend(p.query)}
            className="bg-white hover:bg-gray-200 border border-gray-300 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition shadow-2xs"
            style={{ cursor: 'pointer' }}
          >
            {p.label}
          </button>
        ))}
      </div>

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
              title={isListening ? 'Stop listening' : 'Speak into microphone'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <input
            type="text"
            id="voice-chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening to speech...' : 'Ask about component drawers, machine slots, or free rooms...'}
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
            🔒 Web Speech recognition runs directly inside your browser. No voice audio is transmitted to our servers.
          </p>
        )}
      </div>
    </div>
  );
}

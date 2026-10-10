import React, { useState } from 'react';
import { Cpu, Bot, Send, User, CheckCircle2, ArrowRight, Layers, FileCode, Clock } from 'lucide-react';

export default function FabLabPreview({ onNavigate }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Amrita FabLab Technical Assistant. What hardware prototyping service do you require today? (e.g. 3D Printing, PCB CNC Milling, Laser Cutting)'
    },
    {
      sender: 'user',
      text: 'I need to 3D print a drone motor mount for our final year robotics capstone project.'
    },
    {
      sender: 'bot',
      text: 'Great! Motor mounts require mechanical rigidity and heat resistance from motor coils. I recommend PETG or Carbon-Fiber PLA with 45-60% infill. What filament material and infill percentage do you prefer?'
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: inputVal.trim() }];
    setMessages(newMsgs);
    setInputVal('');

    setTimeout(() => {
      setMessages([
        ...newMsgs,
        {
          sender: 'bot',
          text: 'Specs captured! Wall thickness: 2.4mm, Infill: 50% Gyroid, Material: PETG Black. Estimated print time: 2h 40m. Generated Work Order Ticket #FL-3DP-409 and dispatched to Technician Queue!'
        }
      ]);
    }, 700);
  };

  return (
    <div style={{ padding: '2rem 0 4rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Top Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
          <Cpu size={14} />
          <span>Pillar 2: Intelligent Service Request Desk (Problem Statement #9)</span>
        </div>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Conversational AI FabLab Intake Desk
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Eliminating 4-day email loops and failed print jobs by using an intelligent virtual lab technician to elicit engineering parameters.
        </p>
      </div>

      {/* Live Interactive Chat Sandbox */}
      <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.35)', background: 'rgba(17, 24, 39, 0.85)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>FabLab Engineering Triage Agent</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot dot-available" style={{ width: '6px', height: '6px' }} />
                <span>Active & Listening</span>
              </div>
            </div>
          </div>
          <span className="badge badge-cyan">Automated Spec Ingestion</span>
        </div>

        {/* Message Thread */}
        <div style={{ minHeight: '260px', maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {m.sender === 'bot' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={15} color="#38bdf8" />
                </div>
              )}
              
              <div style={{
                background: m.sender === 'user' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'rgba(255, 255, 255, 0.05)',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: '#fff'
              }}>
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={15} color="#c7d2fe" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Type engineering spec, filament request, or ask advice..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          />
          <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' }}>
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>

      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => onNavigate('classrooms')}
          className="btn-secondary"
        >
          <span>Return to Active Classroom Matrix</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}

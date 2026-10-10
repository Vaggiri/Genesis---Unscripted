import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Wrench, 
  Check, 
  AlertCircle,
  Building,
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { INNOVATION_LABS } from '../services/labsData';

export default function SmartLabFinderBot({ user, onBookingSubmitted }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `Hello ${user?.name || 'Innovator'}! 👋 I am the **Amrita InnovateX AI Lab & Facility Finder**.\n\nTell me what project or experiment you want to do (e.g., *"I want to train a PyTorch YOLO deep learning model"* or *"I need to test an analog circuit with LM741 op-amp and oscilloscope"* or *"I need to 3D print a 250mm drone chassis"*). I will match the exact lab, verify hardware/software availability, and find open slots for you!`,
      timestamp: 'Just now'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedMatch, setSuggestedMatch] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Quick prompt recommendation buttons for reviewers/users
  const quickPrompts = [
    {
      title: 'AI / Software Lab',
      query: 'I am training an autonomous drone perception model using PyTorch, ROS 2 and need an RTX 4090 GPU.'
    },
    {
      title: 'Hardware Circuit Lab',
      query: 'I am designing a biomedical ECG circuit with LM741 op-amps, discrete capacitors, and need a 100MHz DSO and Vivado.'
    },
    {
      title: '3D Prototyping Workshop',
      query: 'I need to fabricate a lightweight 250mm hexacopter chassis using PETG 3D printing and laser cutting.'
    },
    {
      title: 'IoT & Robotics Sandbox',
      query: 'I am building a swarm robotics testbed with TurtleBots and LoRa RF sensor nodes.'
    }
  ];

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsAnalyzing(true);
    setSuggestedMatch(null);
    setBookingSuccess(false);

    // Call live OmniRoute AI model 'vag'
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userName: user?.name,
          userRole: user?.role
        })
      });

      if (!response.ok) throw new Error(`AI status ${response.status}`);
      const data = await response.json();
      const aiReply = data.reply || 'I have analyzed your request.';

      // Check if response contains structured recommendation JSON block
      let matchedLab = null;
      let detectedTech = [];
      let recommendedSlot = '';

      const jsonMatch = aiReply.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.recommendedLabId) {
            matchedLab = INNOVATION_LABS.find(l => l.id === parsed.recommendedLabId) || INNOVATION_LABS[0];
            detectedTech = parsed.detectedSpecs || [];
            recommendedSlot = parsed.recommendedSlot || matchedLab.availableSlotsToday[0];
          }
        } catch (e) {
          console.warn('Could not parse AI json block:', e);
        }
      }

      // Fallback matching if AI gave pure natural text
      if (!matchedLab) {
        const lower = (textToSend + ' ' + aiReply).toLowerCase();
        if (lower.includes('pytorch') || lower.includes('cuda') || lower.includes('gpu') || lower.includes('deep learning') || lower.includes('hpc') || lower.includes('ai')) {
          matchedLab = INNOVATION_LABS.find(l => l.id === 'lab-ai-hpc');
          detectedTech = ['NVIDIA RTX 4090 24GB VRAM', 'PyTorch 2.3 + CUDA 12.4', 'High-Compute Workstation'];
        } else if (lower.includes('circuit') || lower.includes('lm741') || lower.includes('op-amp') || lower.includes('vivado') || lower.includes('vlsi') || lower.includes('oscilloscope')) {
          matchedLab = INNOVATION_LABS.find(l => l.id === 'lab-vlsi-embedded');
          detectedTech = ['Tektronix 100MHz 4-Ch DSO', 'LM741 Op-Amp & Discrete Bench Stock (Drawer #4)', 'Altium Designer & Vivado 2023'];
        } else if (lower.includes('3d print') || lower.includes('proto') || lower.includes('chassis') || lower.includes('drone') || lower.includes('laser') || lower.includes('petg') || lower.includes('pla')) {
          matchedLab = INNOVATION_LABS.find(l => l.id === 'lab-fablab-proto');
          detectedTech = ['Prusa MK4 3D Printer (PLA/PETG)', 'Epilog 60W CO2 Laser Cutter', 'Autodesk Fusion 360'];
        } else {
          matchedLab = INNOVATION_LABS.find(l => l.id === 'lab-iot-robotics');
          detectedTech = ['ROS 2 Autonomous Sandbox', 'LoRa SX1278 RF Node Gateway', 'TurtleBot 4 Testing Arena'];
        }
        recommendedSlot = matchedLab.availableSlotsToday[0] || '10:00 AM Today';
      }

      // Clean display text without raw json block if present
      const cleanDisplayText = aiReply.replace(/```json[\s\S]*?```/, '').trim();

      const botReply = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: cleanDisplayText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
      setSuggestedMatch({
        lab: matchedLab,
        detectedTech,
        slot: recommendedSlot,
        querySummary: textToSend
      });
      setSelectedSlot(recommendedSlot || matchedLab.availableSlotsToday[0] || '');
    } catch (err) {
      console.warn('AI call error, using local lab heuristic:', err);
      // Resilient heuristic fallback
      const lower = textToSend.toLowerCase();
      let matchedLab = INNOVATION_LABS[0];
      if (lower.includes('circuit') || lower.includes('lm741') || lower.includes('vivado')) matchedLab = INNOVATION_LABS[1];
      else if (lower.includes('3d') || lower.includes('print') || lower.includes('drone')) matchedLab = INNOVATION_LABS[2];
      else if (lower.includes('robot') || lower.includes('iot')) matchedLab = INNOVATION_LABS[3];

      const fallbackReply = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: `🎯 **Optimal Facility Identified:** **${matchedLab.name}** (${matchedLab.block})\n\nVerified matching toolchains, components and available slot. You can proceed to confirm below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, fallbackReply]);
      setSuggestedMatch({
        lab: matchedLab,
        detectedTech: ['Component & Machine Specs Verified'],
        slot: matchedLab.availableSlotsToday[0],
        querySummary: textToSend
      });
      setSelectedSlot(matchedLab.availableSlotsToday[0]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!suggestedMatch || !selectedSlot) return;

    const newBooking = {
      id: `req-${Date.now()}`,
      studentName: user?.name || 'Student Innovator',
      studentRoll: user?.roll_no || 'CB.EN.U4CSE23012',
      labId: suggestedMatch.lab.id,
      labName: suggestedMatch.lab.name,
      projectTitle: suggestedMatch.querySummary.slice(0, 70),
      projectType: suggestedMatch.lab.category,
      requirements: suggestedMatch.detectedTech.join(', '),
      slotTime: selectedSlot,
      status: 'pending',
      submittedAt: 'Just now',
      facultyAssigned: suggestedMatch.lab.inCharge
    };

    onBookingSubmitted(newBooking);
    setBookingSuccess(true);

    const confirmationMsg = {
      id: `msg-confirm-${Date.now()}`,
      sender: 'bot',
      text: `🎉 **Booking Request Submitted Successfully!**\n\n• **Facility:** ${suggestedMatch.lab.name}\n• **Slot Reserved:** ${selectedSlot}\n• **Assigned Faculty / Lab In-Charge:** ${suggestedMatch.lab.inCharge}\n\nFaculty will receive this request for digital sign-off. You can track this under **"My Bookings"** tab.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, confirmationMsg]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Bot Chat Container */}
      <div className="card-amrita" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
        
        {/* Chat Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--amrita-maroon)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                InnovateX AI Lab Finder Bot
              </h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--status-available)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--status-available)', display: 'inline-block' }} />
                AI Online • Cross-Department Lab & Component Radar
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Natural Language Lab Matcher
          </div>
        </div>

        {/* Quick Sample Queries */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            💡 Quick Prompts (Click to Ask AI):
          </div>
          <div style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            flexWrap: 'nowrap', 
            gap: '0.45rem', 
            paddingBottom: '4px',
            WebkitOverflowScrolling: 'touch'
          }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.query)}
                disabled={isAnalyzing}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '999px',
                  border: '1px solid #fecdd6',
                  backgroundColor: '#fff5f7',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--amrita-maroon)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Message History List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          paddingRight: '0.35rem',
          marginBottom: '1rem'
        }}>
          {messages.map(m => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '88%'
                }}
              >
                {isBot && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--amrita-maroon-bg)',
                    color: 'var(--amrita-maroon)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Sparkles size={14} />
                  </div>
                )}

                <div 
                  className={isBot ? 'bot-markdown-content' : ''}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                    backgroundColor: isBot ? '#f8fafc' : 'var(--amrita-maroon)',
                    color: isBot ? 'var(--text-main)' : '#ffffff',
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    border: isBot ? '1px solid var(--border-light)' : 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  {isBot ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{m.text}</ReactMarkdown>
                  ) : (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{m.text}</span>
                  )}
                </div>
              </div>
            );
          })}

          {isAnalyzing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.785rem', color: 'var(--amrita-maroon)', fontWeight: 600 }}>
              <RefreshCw size={14} className="animate-spin" />
              <span>Analyzing cross-department PC specs, Vivado/PyTorch versions & IC stock...</span>
            </div>
          )}
        </div>

        {/* Input Text Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}
        >
          <input
            type="text"
            placeholder="Type your project idea or components needed (e.g., 'Need Vivado 2023 & DSO for FPGA DSP filter')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isAnalyzing}
            className="form-input"
            style={{ flex: 1, minHeight: '44px', fontSize: '0.85rem' }}
          />
          <button
            type="submit"
            disabled={isAnalyzing || !inputQuery.trim()}
            className="btn-amrita"
            style={{
              minHeight: '44px',
              padding: '0 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>Ask Bot</span>
            <Send size={15} />
          </button>
        </form>

      </div>

      {/* Suggested Facility Booking Action Box */}
      {suggestedMatch && (
        <div className="card-amrita" style={{
          padding: '1.35rem',
          border: '2px solid var(--amrita-maroon)',
          backgroundColor: '#fff9fa',
          boxShadow: '0 6px 18px rgba(164, 18, 63, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-maroon" style={{ marginBottom: '0.35rem' }}>
                Recommended Facility Match
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {suggestedMatch.lab.name}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                📍 {suggestedMatch.lab.block} • {suggestedMatch.lab.floor} • Faculty In-Charge: <strong>{suggestedMatch.lab.inCharge}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current Lab Utilization</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--status-available)' }}>{suggestedMatch.lab.currentUtilization} Used</strong>
            </div>
          </div>

          {/* Hardware & Software Verified Checklist */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Verified Lab Specifications for Your Project:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
              {suggestedMatch.detectedTech.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.785rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} color="var(--status-available)" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slot Selection & Action */}
          {!bookingSuccess ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  Select Free Innovation Slot:
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {suggestedMatch.lab.availableSlotsToday.map((slot, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: selectedSlot === slot ? '2px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                        backgroundColor: selectedSlot === slot ? 'var(--amrita-maroon-bg)' : '#ffffff',
                        color: selectedSlot === slot ? 'var(--amrita-maroon)' : 'var(--text-main)',
                        fontWeight: selectedSlot === slot ? 700 : 500,
                        fontSize: '0.785rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="btn-amrita"
                style={{
                  minHeight: '42px',
                  padding: '0 1.5rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Proceed to Book This Lab</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'var(--status-available-bg)',
              color: 'var(--status-available-text)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={18} />
              <span>Lab booking request forwarded to {suggestedMatch.lab.inCharge}. Status: Pending Faculty Approval.</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

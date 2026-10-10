import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Settings2, 
  Sparkles, 
  HardDrive, 
  FileCode, 
  Wrench,
  Check,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FABLAB_MACHINES, INITIAL_WORK_ORDERS } from '../utils/mockData';
import { playMessagePop, playSuccessSound } from '../utils/audio';

export default function Pillar2FabLab() {
  const [machines] = useState(FABLAB_MACHINES);
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [activePreset, setActivePreset] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Welcome to the Amrita FabLab Intelligent Intake Desk! I'm your virtual lab assistant. Tell me what prototype or hardware part you're fabricating today (3D Printing, PCB Milling, Laser Cutting, or SLA Resin)?",
      time: "Just now"
    }
  ]);
  const [inputText, setInputText] = useState("");

  // Extracted Technical Specifications (Dynamic JSON)
  const [ticketSpec, setTicketSpec] = useState({
    technology: "3D Printing (FDM)",
    projectTitle: "Autonomous Drone Motor Mount (Genesis '26)",
    student: "Adithya Ramachandran (CB.EN.U4CSE23108)",
    material: "PETG High-Tensile",
    infill: "40% Gyroid",
    layerHeight: "0.20 mm",
    wallLoops: "4 Perimeters",
    machine: "Bambu Lab X1-Carbon #01",
    estimatedWeight: "48 grams",
    estimatedTime: "2 hrs 15 mins",
    estimatedCost: "₹190",
    priority: "HIGH (Hackathon Expedited)",
    isComplete: true
  });

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    playMessagePop();
    setIsTyping(true);

    // AI Simulated Triage Response
    setTimeout(() => {
      setIsTyping(false);
      let aiReply = "";
      
      const lower = textToSend.toLowerCase();
      if (lower.includes('drone') || lower.includes('motor') || lower.includes('3d') || lower.includes('petg')) {
        aiReply = "✅ Excellent! For a drone motor mount, I strongly recommend PETG or Carbon Fiber over standard PLA due to thermal motor dissipation and motor vibration stress. I've set infill to 40% Gyroid with 4 wall loops for maximum rigidity. Your estimated print time is 2h 15m on Bambu Lab X1-Carbon #01. Would you like me to dispatch the job ticket to the lab queue?";
        setTicketSpec(prev => ({
          ...prev,
          technology: "3D Printing (FDM)",
          projectTitle: "Drone Motor Mount Rigidity Arm",
          material: "PETG High-Tensile",
          infill: "40% Gyroid",
          layerHeight: "0.20 mm",
          estimatedTime: "2 hrs 15 mins",
          estimatedCost: "₹190",
          isComplete: true
        }));
      } else if (lower.includes('pcb') || lower.includes('circuit') || lower.includes('gerber')) {
        aiReply = "⚡ Great choice! For CNC PCB Prototyping on the Bantam Mill, please ensure your Gerber files include top copper, bottom copper, and Excellon drill files (.xln). Recommended isolation trace width is 0.15mm with a 1/64\" flat end mill. Dispatched specification to PCB queue!";
        setTicketSpec(prev => ({
          ...prev,
          technology: "CNC PCB Milling",
          projectTitle: "Custom IoT Sensor Board",
          material: "FR-1 Double Sided Blank",
          infill: "N/A (Isolation Traces)",
          layerHeight: "0.15 mm Isolation",
          machine: "Bantam Desktop PCB Mill",
          estimatedWeight: "22 grams",
          estimatedTime: "50 mins",
          estimatedCost: "₹130",
          isComplete: true
        }));
      } else {
        aiReply = `I've analyzed your requirements for "${textToSend}". I will verify standard tolerances, check material availability in the Amrita inventory, and package your engineering parameters for technician fulfillment.`;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      playMessagePop();
    }, 1100);
  };

  const runDemoPreset = (presetType) => {
    setActivePreset(presetType);
    if (presetType === 'drone') {
      handleSendMessage("I need to 3D print a high-stress drone motor mount for our GENESIS hackathon quadcopter. Must withstand 2207 brushless motor vibration.");
    } else if (presetType === 'pcb') {
      handleSendMessage("I have an IoT telemetry board and need 2-layer PCB CNC isolation milling with 0.15mm trace width.");
    } else if (presetType === 'sla') {
      handleSendMessage("Need high-detail optical sensor lens casing using Clear SLA Resin on Formlabs Form 3+.");
    }
  };

  const handleSubmitTicketToKanban = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });
    playSuccessSound();

    const newWO = {
      id: `FAB-WO-${Math.floor(404 + Math.random() * 50)}`,
      studentName: "Adithya Ramachandran",
      rollNumber: "CB.EN.U4CSE23108",
      projectTitle: ticketSpec.projectTitle,
      technology: ticketSpec.technology,
      material: ticketSpec.material,
      infill: ticketSpec.infill,
      layerHeight: ticketSpec.layerHeight,
      estimatedTime: ticketSpec.estimatedTime,
      estimatedCost: ticketSpec.estimatedCost,
      status: "IN_QUEUE",
      submittedAt: "Just now",
      machine: ticketSpec.machine,
      priority: ticketSpec.priority
    };

    setWorkOrders(prev => [newWO, ...prev]);
  };

  const advanceOrderStatus = (orderId) => {
    setWorkOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const nextStatus = order.status === 'IN_QUEUE' ? 'IN_PRODUCTION' : 'READY_FOR_PICKUP';
        return { ...order, status: nextStatus };
      }
      return order;
    }));
    playSuccessSound();
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 30px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.08, pointerEvents: 'none' }}>
          <Cpu size={240} color="#8B5CF6" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-violet">PILLAR 2: SERVICE DESK</span>
              <span className="badge badge-cyan">AI ENGINEERING TRIAGE</span>
            </div>
            <h1 style={{ fontSize: 28, color: '#FFFFFF', marginBottom: 6 }}>
              AI-Powered FabLab Prototyping Intake Desk
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 740, lineHeight: 1.5 }}>
              Replaces chaotic emails and missing print parameters with a multi-turn conversational AI agent that interviews students, locks down engineering specs (infill %, materials, layer heights), and automatically dispatches structured work orders to lab technicians.
            </p>
          </div>

          {/* Quick Demo Scenario Trigger Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>1-CLICK DEMO SCENARIOS:</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button 
                onClick={() => runDemoPreset('drone')}
                className="btn-secondary" 
                style={{ fontSize: 12, padding: '7px 12px', border: activePreset === 'drone' ? '1px solid #8B5CF6' : undefined }}
              >
                <Sparkles size={14} color="#A78BFA" />
                <span>Drone Motor Arm (FDM)</span>
              </button>
              <button 
                onClick={() => runDemoPreset('pcb')}
                className="btn-secondary" 
                style={{ fontSize: 12, padding: '7px 12px', border: activePreset === 'pcb' ? '1px solid #06B6D4' : undefined }}
              >
                <Zap size={14} color="#38BDF8" />
                <span>IoT CNC PCB Milling</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Fleet Status Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
        marginBottom: 24
      }}>
        {machines.map(m => (
          <div 
            key={m.id}
            className="glass-panel"
            style={{ padding: '14px 18px', borderLeft: m.status.includes('Active') ? '3px solid #8B5CF6' : '3px solid #10B981' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{m.name}</span>
              <span className={m.status.includes('Active') ? 'badge badge-violet' : 'badge badge-emerald'} style={{ fontSize: 9 }}>
                {m.status}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{m.type} • {m.material}</div>
            <div className="mono-font" style={{ fontSize: 10, color: 'var(--text-dim)' }}>Bed: {m.bedSize}</div>
          </div>
        ))}
      </div>

      {/* Main Interactive Grid: Left (Chatbot), Right (Generated Structured Work Order) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 24, marginBottom: 32 }}>
        
        {/* Left: Conversational Intake Agent */}
        <div className="glass-panel" style={{ padding: 22, display: 'flex', flexDirection: 'column', height: 530 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A78BFA'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, color: '#FFFFFF' }}>FabLab Virtual Intake Agent</h3>
                <span style={{ fontSize: 11, color: '#34D399', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="pulsing-dot" style={{ width: 5, height: 5 }}></span>
                  Engineering Triage Online
                </span>
              </div>
            </div>

            <span className="badge badge-cyan" style={{ fontSize: 10 }}>
              GPT-4 / GEMINI PRO ENGINES
            </span>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 6 }}>
            {messages.map(msg => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {msg.sender === 'ai' && (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A78BFA',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <Bot size={16} />
                  </div>
                )}

                <div style={{
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #06B6D4, #2563EB)' : 'var(--bg-surface-elevated)',
                  color: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: varRadius(msg.sender),
                  fontSize: 13,
                  lineHeight: 1.5,
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  {msg.text}
                  <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, textAlign: 'right' }}>
                    {msg.time}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'rgba(6, 182, 212, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12, padding: '8px 12px' }}>
                <Bot size={16} color="#A78BFA" />
                <span>Analyzing engineering parameters & print slicer limits...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <input 
              type="text" 
              className="input-field" 
              placeholder="E.g. I need 40% infill PETG drone mount or 2-layer PCB mill..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 18px', flexShrink: 0 }}>
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Right: Dynamic Work Order JSON & Production Spec Card */}
        <div className="glass-panel glass-panel-glow" style={{ padding: 22, display: 'flex', flexDirection: 'column', height: 530 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCode size={20} color="#38BDF8" />
              <h3 style={{ fontSize: 16, color: '#FFFFFF' }}>Validated Work Order Ticket</h3>
            </div>
            <span className="badge badge-emerald">
              <CheckCircle2 size={12} />
              SLICER READY
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{
              background: 'rgba(11, 15, 23, 0.95)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{ticketSpec.projectTitle}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Requester: {ticketSpec.student}</div>
                </div>
                <span className="badge badge-amber" style={{ fontSize: 10 }}>
                  {ticketSpec.priority}
                </span>
              </div>

              {/* Grid of Verified Engineering Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 12, borderTop: '1px dashed var(--border-subtle)', paddingTop: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Process / Tech:</span>
                  <strong style={{ color: '#38BDF8' }}>{ticketSpec.technology}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Assigned Rig:</span>
                  <strong style={{ color: '#FFFFFF' }}>{ticketSpec.machine}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Material Selected:</span>
                  <strong style={{ color: '#A78BFA' }}>{ticketSpec.material}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Infill & Pattern:</span>
                  <strong style={{ color: '#34D399' }}>{ticketSpec.infill}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Layer Resolution:</span>
                  <strong className="mono-font" style={{ color: '#FFFFFF' }}>{ticketSpec.layerHeight}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Estimated Filament:</span>
                  <strong className="mono-font" style={{ color: '#FFFFFF' }}>{ticketSpec.estimatedWeight}</strong>
                </div>
              </div>

              {/* Cost and Time Pill */}
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                background: 'rgba(6, 182, 212, 0.08)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="#38BDF8" />
                  <span style={{ fontSize: 12, color: 'var(--text-main)' }}>Machine Time: <strong>{ticketSpec.estimatedTime}</strong></span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#34D399' }}>
                  Raw Cost: {ticketSpec.estimatedCost}
                </div>
              </div>
            </div>

            {/* Structured JSON Work-Order Preview */}
            <div style={{
              background: '#04060A',
              padding: 12,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#94A3B8',
              maxHeight: 110,
              overflowY: 'auto'
            }}>
              <span style={{ color: '#A78BFA' }}>// Auto-Generated Lab Technician JSON Work-Order</span>
              <pre>{JSON.stringify({
                order_id: "FAB-WO-404",
                technology: ticketSpec.technology,
                material: ticketSpec.material,
                infill_percentage: ticketSpec.infill,
                target_machine: ticketSpec.machine,
                slicer_passed: true,
                est_time_seconds: 8100
              }, null, 2)}</pre>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitTicketToKanban}
            className="btn-primary"
            style={{ marginTop: 14, justifyContent: 'center', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}
          >
            <Sparkles size={16} />
            <span>Dispatch Work-Order to Technician Kanban Queue</span>
          </button>
        </div>

      </div>

      {/* Technician Kanban Board */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wrench size={20} color="#38BDF8" />
            <h3 style={{ fontSize: 18, color: '#FFFFFF' }}>FabLab Live Technician Kanban Fulfillment Board</h3>
          </div>
          <span className="badge badge-emerald">
            {workOrders.length} JOBS MONITORED
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          
          {/* Column 1: Intake Queue */}
          <div style={{ background: 'rgba(14, 19, 31, 0.6)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24' }}>1. INCOMING QUEUE</span>
              <span className="badge badge-amber">{workOrders.filter(w => w.status === 'IN_QUEUE').length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workOrders.filter(w => w.status === 'IN_QUEUE').map(wo => (
                <div key={wo.id} style={{ background: 'var(--bg-surface-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="mono-font" style={{ fontSize: 11, color: '#38BDF8' }}>{wo.id}</span>
                    <span className="badge badge-amber" style={{ fontSize: 9 }}>{wo.priority}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 2 }}>{wo.projectTitle}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{wo.material} • {wo.infill}</div>
                  <button 
                    onClick={() => advanceOrderStatus(wo.id)}
                    className="btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center', fontSize: 11, padding: '5px' }}
                  >
                    Start Print on {wo.machine.split(' ')[0]} →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Production */}
          <div style={{ background: 'rgba(14, 19, 31, 0.6)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8' }}>2. IN PRODUCTION (PRINTING)</span>
              <span className="badge badge-cyan">{workOrders.filter(w => w.status === 'IN_PRODUCTION').length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workOrders.filter(w => w.status === 'IN_PRODUCTION').map(wo => (
                <div key={wo.id} style={{ background: 'var(--bg-surface-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="mono-font" style={{ fontSize: 11, color: '#38BDF8' }}>{wo.id}</span>
                    <span className="badge badge-cyan" style={{ fontSize: 9 }}>RUNNING</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 2 }}>{wo.projectTitle}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{wo.machine} • Time: {wo.estimatedTime}</div>
                  <button 
                    onClick={() => advanceOrderStatus(wo.id)}
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', fontSize: 11, padding: '5px', background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    Mark Fabrication Complete ✓
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Ready for Pickup */}
          <div style={{ background: 'rgba(14, 19, 31, 0.6)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#34D399' }}>3. READY FOR PICKUP</span>
              <span className="badge badge-emerald">{workOrders.filter(w => w.status === 'READY_FOR_PICKUP').length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workOrders.filter(w => w.status === 'READY_FOR_PICKUP').map(wo => (
                <div key={wo.id} style={{ background: 'var(--bg-surface-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="mono-font" style={{ fontSize: 11, color: '#34D399' }}>{wo.id}</span>
                    <span className="badge badge-emerald" style={{ fontSize: 9 }}>SHELF A-4</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 2 }}>{wo.projectTitle}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student: {wo.studentName}</div>
                  <div style={{ fontSize: 10, color: '#34D399', marginTop: 4 }}>SMS notification dispatched to student ✓</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function varRadius(sender) {
  return sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px';
}

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Car, 
  User, 
  Building, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Volume2
} from 'lucide-react';
import { INITIAL_PASSES } from '../utils/mockData';
import { playScanBeep, playSuccessSound } from '../utils/audio';

export default function Pillar1Pass() {
  const [activeSubTab, setActiveSubTab] = useState('parent'); // 'parent' or 'guard'
  const [passes, setPasses] = useState(INITIAL_PASSES);
  const [currentPass, setCurrentPass] = useState(INITIAL_PASSES[0]);
  
  // Dynamic QR anti-screenshot security ticker
  const [securitySalt, setSecuritySalt] = useState(Math.floor(1000 + Math.random() * 9000));
  const [remainingSeconds, setRemainingSeconds] = useState(11640); // ~3h 14m
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
  // Gate activity audit log
  const [gateLogs, setGateLogs] = useState([
    {
      id: "LOG-108",
      time: "2:42 PM",
      lane: "Lane 2 (Inbound)",
      vehicle: "KL-09-AX-9912",
      student: "Ananya S. Kumar (Mythreyi Hostel)",
      action: "ENTRY_LOGGED",
      status: "VERIFIED"
    },
    {
      id: "LOG-107",
      time: "1:48 PM",
      lane: "Lane 2 (Outbound)",
      vehicle: "TN-37-CK-5520",
      student: "Karthik Raja M. (Vashishta Hostel)",
      action: "EXIT_LOGGED",
      status: "VERIFIED"
    },
    {
      id: "LOG-106",
      time: "11:15 AM",
      lane: "Lane 1 (Inbound)",
      vehicle: "TN-37-CK-5520",
      student: "Karthik Raja M. (Vashishta Hostel)",
      action: "ENTRY_LOGGED",
      status: "VERIFIED"
    }
  ]);

  // Form state for creating new pass
  const [formData, setFormData] = useState({
    studentName: "Adithya Ramachandran",
    rollNumber: "CB.EN.U4CSE23108",
    hostel: "D-Block Men's Hostel (Room 312)",
    parentName: "Smt. V. Lakshmi & Sri. Ramachandran",
    parentPhone: "+91 98412 84920",
    vehicleNumber: "TN-38-BZ-4102",
    vehicleType: "Four Wheeler (Sedan)",
    purpose: "Hostel Pickup & Medical Checkup Weekend",
    requestedSlot: "Today, 4:00 PM – 7:30 PM"
  });

  // Ticking anti-screenshot security hash every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSecuritySalt(Math.floor(1000 + Math.random() * 9000));
      setRemainingSeconds(prev => (prev > 1 ? prev - 1 : 11640));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const handleCreatePass = (e) => {
    e.preventDefault();
    const newPass = {
      id: `PASS-2026-${Math.floor(9045 + Math.random() * 900)}`,
      ...formData,
      department: "Computer Science & Engineering",
      warden: "Dr. K. S. Narayanan (Warden - D Block)",
      status: "APPROVED",
      approvedAt: "Just now (Digital Auto-Cleared)",
      qrHash: `CS-AUTH-${Math.floor(1000 + Math.random() * 9000)}-TOKEN`,
      gateStatus: "READY_FOR_ENTRY",
      entryTime: null,
      exitTime: null
    };
    setCurrentPass(newPass);
    setPasses([newPass, ...passes]);
    playSuccessSound();
  };

  const simulateGateScan = (targetPass, actionType = 'ENTRY') => {
    setScanning(true);
    setScanResult(null);
    playScanBeep();

    setTimeout(() => {
      setScanning(false);
      playSuccessSound();

      const isEntry = actionType === 'ENTRY';
      const updatedPass = {
        ...targetPass,
        gateStatus: isEntry ? 'INSIDE_CAMPUS' : 'EXITED',
        entryTime: isEntry ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Main Gate Lane 1)" : targetPass.entryTime,
        exitTime: !isEntry ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Main Gate Lane 2)" : null
      };

      setCurrentPass(updatedPass);
      setScanResult({
        success: true,
        pass: updatedPass,
        action: isEntry ? "ENTRY_APPROVED" : "EXIT_CLEARED",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      const newLog = {
        id: `LOG-${Math.floor(109 + Math.random() * 900)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lane: isEntry ? "Lane 1 (Inbound Fast-Lane)" : "Lane 2 (Outbound)",
        vehicle: targetPass.vehicleNumber,
        student: `${targetPass.studentName} (${targetPass.hostel.split(' ')[0]})`,
        action: isEntry ? "ENTRY_LOGGED" : "EXIT_LOGGED",
        status: "VERIFIED"
      };
      setGateLogs(prev => [newLog, ...prev]);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 30px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.08, pointerEvents: 'none' }}>
          <ShieldCheck size={240} color="#06B6D4" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-cyan">PILLAR 1: E-GOVERNANCE</span>
              <span className="badge badge-emerald">ZERO PAPER PASS</span>
            </div>
            <h1 style={{ fontSize: 28, color: '#FFFFFF', marginBottom: 6 }}>
              Parent Hostel Visit & Gate E-Pass System
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 740, lineHeight: 1.5 }}>
              Replaces manual paper visitor slips, warden hunting, and slow main-gate logbooks with time-bound encrypted QR passes, instant warden clearance, and sub-second gatekeeper verification.
            </p>
          </div>

          {/* Sub Tab View Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setActiveSubTab('parent')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'parent' ? 'linear-gradient(135deg, #06B6D4, #3B82F6)' : 'transparent',
                color: activeSubTab === 'parent' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              <QrCode size={16} />
              <span>Parent Pass & Dynamic QR</span>
            </button>

            <button
              onClick={() => setActiveSubTab('guard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeSubTab === 'guard' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
                color: activeSubTab === 'guard' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              <Camera size={16} />
              <span>Gatekeeper Fast-Lane Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      {activeSubTab === 'parent' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
          
          {/* Left Column: Parent Induction Form */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-glow)'
                }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, color: '#FFFFFF' }}>Visitor Pre-Authorization</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Amrita Parent Digital Clearance Portal</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setFormData({
                    studentName: "Adithya Ramachandran",
                    rollNumber: "CB.EN.U4CSE23108",
                    hostel: "D-Block Men's Hostel (Room 312)",
                    parentName: "Smt. V. Lakshmi & Sri. Ramachandran",
                    parentPhone: "+91 98412 84920",
                    vehicleNumber: "TN-38-BZ-4102",
                    vehicleType: "Four Wheeler (Sedan)",
                    purpose: "Hostel Pickup & Medical Checkup Weekend",
                    requestedSlot: "Today, 4:00 PM – 7:30 PM"
                  });
                  playSuccessSound();
                }}
                className="btn-secondary" 
                style={{ fontSize: 11, padding: '5px 10px' }}
              >
                <Sparkles size={13} color="#FBBF24" />
                Fill Amrita Demo Data
              </button>
            </div>

            <form onSubmit={handleCreatePass} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                    Student Roll Number
                  </label>
                  <input 
                    type="text" 
                    className="input-field mono-font" 
                    value={formData.rollNumber} 
                    onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                    Student Name
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.studentName} 
                    onChange={e => setFormData({...formData, studentName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                  Assigned Hostel & Room
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.hostel} 
                  onChange={e => setFormData({...formData, hostel: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                    Visiting Parent / Guardian
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.parentName} 
                    onChange={e => setFormData({...formData, parentName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                    Emergency Mobile
                  </label>
                  <input 
                    type="text" 
                    className="input-field mono-font" 
                    value={formData.parentPhone} 
                    onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                    Vehicle Registration Number
                  </label>
                  <input 
                    type="text" 
                    className="input-field mono-font" 
                    value={formData.vehicleNumber} 
                    onChange={e => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                    Vehicle Type
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.vehicleType} 
                    onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                  Visit Purpose & Clearance Slot
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.purpose} 
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 8, justifyContent: 'center' }}>
                <ShieldCheck size={18} />
                <span>Submit & Generate Dynamic QR E-Pass</span>
              </button>
            </form>
          </div>

          {/* Right Column: The Dynamic E-Pass Display Card */}
          <div className="glass-panel glass-panel-glow" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-emerald">
                  <Check size={12} />
                  WARDEN CLEARED
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {currentPass.id}</span>
              </div>
              <div className="mono-font" style={{ fontSize: 11, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} />
                <span>Expires in: {formatCountdown(remainingSeconds)}</span>
              </div>
            </div>

            {/* Dynamic QR Container with rotating holographic security border */}
            <div style={{ position: 'relative', margin: '14px 0 20px 0' }}>
              <div className="dynamic-security-ring"></div>
              
              <div className="dynamic-qr-box">
                {/* SVG High-Contrast QR Simulation with dynamic data pattern */}
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                  {/* Background */}
                  <rect width="180" height="180" fill="#FFFFFF" rx="8" />
                  
                  {/* Corner Finders */}
                  {/* Top Left */}
                  <rect x="15" y="15" width="40" height="40" fill="#0B0F17" rx="6" />
                  <rect x="23" y="23" width="24" height="24" fill="#FFFFFF" rx="4" />
                  <rect x="29" y="29" width="12" height="12" fill="#06B6D4" rx="2" />
                  
                  {/* Top Right */}
                  <rect x="125" y="15" width="40" height="40" fill="#0B0F17" rx="6" />
                  <rect x="133" y="23" width="24" height="24" fill="#FFFFFF" rx="4" />
                  <rect x="139" y="29" width="12" height="12" fill="#06B6D4" rx="2" />

                  {/* Bottom Left */}
                  <rect x="15" y="125" width="40" height="40" fill="#0B0F17" rx="6" />
                  <rect x="23" y="133" width="24" height="24" fill="#FFFFFF" rx="4" />
                  <rect x="29" y="139" width="12" height="12" fill="#06B6D4" rx="2" />

                  {/* Center Data Matrix dots */}
                  <rect x="65" y="20" width="8" height="16" fill="#0B0F17" />
                  <rect x="80" y="25" width="12" height="8" fill="#0B0F17" />
                  <rect x="100" y="20" width="8" height="8" fill="#0B0F17" />
                  
                  <rect x="20" y="65" width="16" height="8" fill="#0B0F17" />
                  <rect x="45" y="75" width="8" height="16" fill="#0B0F17" />
                  <rect x="65" y="65" width="50" height="50" fill="#0B0F17" rx="8" />
                  {/* Emblem inside center */}
                  <circle cx="90" cy="90" r="14" fill="#06B6D4" />
                  <text x="90" y="94" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">AMR</text>

                  <rect x="125" y="70" width="10" height="18" fill="#0B0F17" />
                  <rect x="145" y="80" width="15" height="10" fill="#0B0F17" />

                  <rect x="65" y="125" width="15" height="10" fill="#0B0F17" />
                  <rect x="90" y="130" width="20" height="12" fill="#0B0F17" />
                  <rect x="120" y="125" width="12" height="18" fill="#0B0F17" />
                  <rect x="140" y="140" width="20" height="15" fill="#0B0F17" />
                </svg>

                {/* Anti-screenshot Watermark */}
                <div style={{
                  position: 'absolute',
                  bottom: 4,
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  color: '#64748B',
                  letterSpacing: '0.05em'
                }}>
                  SYNC HASH: #{securitySalt} • LIVE
                </div>
              </div>
            </div>

            {/* Pass Metadata Card */}
            <div style={{
              width: '100%',
              background: 'rgba(14, 19, 31, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{currentPass.studentName}</div>
                  <div className="mono-font" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{currentPass.rollNumber}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono-font" style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8' }}>{currentPass.vehicleNumber}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{currentPass.vehicleType}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Hostel:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{currentPass.hostel}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Clearance Warden:</span>
                  <span style={{ color: '#34D399', fontWeight: 600 }}>{currentPass.warden}</span>
                </div>
              </div>

              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                  STATUS: {currentPass.gateStatus}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('guard');
                    simulateGateScan(currentPass, 'ENTRY');
                  }}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  <Zap size={13} />
                  Simulate Gate Scan at Main Gate
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Gatekeeper Scanner View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
          
          {/* Left Column: Fast-Lane Optical Scanner Console */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399'
                }}>
                  <Camera size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, color: '#FFFFFF' }}>Main Security Gate Console</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Optical Fast-Lane Scanner (Lane 1 & 2)</p>
                </div>
              </div>

              <span className="badge badge-emerald">
                <span className="pulsing-dot"></span>
                CAMERA SENSOR ONLINE
              </span>
            </div>

            {/* Simulated Live Scanner Frame */}
            <div className="scanner-viewport" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="scanner-laser"></div>
              
              {/* Camera Aim Crosshairs */}
              <div style={{
                width: 190,
                height: 190,
                border: '2px solid rgba(6, 182, 212, 0.6)',
                borderRadius: 12,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(6, 182, 212, 0.04)'
              }}>
                <div style={{ position: 'absolute', top: -6, left: -6, width: 14, height: 14, borderTop: '3px solid #22D3EE', borderLeft: '3px solid #22D3EE' }}></div>
                <div style={{ position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderTop: '3px solid #22D3EE', borderRight: '3px solid #22D3EE' }}></div>
                <div style={{ position: 'absolute', bottom: -6, left: -6, width: 14, height: 14, borderBottom: '3px solid #22D3EE', borderLeft: '3px solid #22D3EE' }}></div>
                <div style={{ position: 'absolute', bottom: -6, right: -6, width: 14, height: 14, borderBottom: '3px solid #22D3EE', borderRight: '3px solid #22D3EE' }}></div>

                {scanning ? (
                  <div style={{ textAlign: 'center', color: '#22D3EE', animation: 'pulseGlow 1s infinite' }}>
                    <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: 12, fontWeight: 600 }}>DECRYPTING TOKEN...</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                    <QrCode size={48} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                    <div style={{ fontSize: 11 }}>ALIGN VISITOR E-PASS</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Scanner Action Trigger Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
              <button
                type="button"
                disabled={scanning}
                onClick={() => simulateGateScan(currentPass, 'ENTRY')}
                className="btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <Zap size={16} />
                <span>Simulate Inbound Scan</span>
              </button>

              <button
                type="button"
                disabled={scanning}
                onClick={() => simulateGateScan(currentPass, 'EXIT')}
                className="btn-secondary"
                style={{ justifyContent: 'center' }}
              >
                <ArrowRight size={16} />
                <span>Simulate Outbound Exit</span>
              </button>
            </div>

            {/* Verification Result Toast/Card */}
            {scanResult && (
              <div style={{
                marginTop: 18,
                background: scanResult.action === 'ENTRY_APPROVED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                border: scanResult.action === 'ENTRY_APPROVED' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                animation: 'floatSoft 3s ease-in-out infinite'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <CheckCircle2 size={22} color={scanResult.action === 'ENTRY_APPROVED' ? '#34D399' : '#38BDF8'} />
                  <div>
                    <h4 style={{ fontSize: 15, color: '#FFFFFF' }}>
                      {scanResult.action === 'ENTRY_APPROVED' ? 'VALID PASS • ENTRY APPROVED' : 'VALID PASS • CAMPUS EXIT RECORDED'}
                    </h4>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Verified at {scanResult.time} via Gate Fast-Lane</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12, marginTop: 8 }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Vehicle</span>
                    <strong className="mono-font" style={{ color: '#FFFFFF' }}>{scanResult.pass.vehicleNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Student</span>
                    <strong style={{ color: '#FFFFFF' }}>{scanResult.pass.studentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Clearance</span>
                    <strong style={{ color: '#34D399' }}>Warden Confirmed</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Gate Audit Trail Table */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="#38BDF8" />
                <h3 style={{ fontSize: 17, color: '#FFFFFF' }}>Live Gate Security Log Feed</h3>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                {gateLogs.length} LOGS TODAY
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 440, overflowY: 'auto' }}>
              {gateLogs.map(log => (
                <div 
                  key={log.id}
                  style={{
                    background: 'rgba(14, 19, 31, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="mono-font" style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                        {log.vehicle}
                      </span>
                      <span className={log.action === 'ENTRY_LOGGED' ? 'badge badge-emerald' : 'badge badge-cyan'} style={{ fontSize: 9, padding: '2px 6px' }}>
                        {log.action}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {log.student}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="mono-font" style={{ fontSize: 11, color: '#38BDF8' }}>{log.time}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{log.lane}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

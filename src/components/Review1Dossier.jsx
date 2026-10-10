import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  MapPin, 
  Sparkles, 
  Users, 
  ChevronRight, 
  Layers,
  ArrowRight
} from 'lucide-react';

export default function Review1Dossier({ onNavigateTab }) {
  // 3-Minute Verbal Pitch Timer
  const [pitchTimer, setPitchTimer] = useState(180); // 3 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pitchTimer > 0) {
      interval = setInterval(() => setPitchTimer(t => t - 1), 1000);
    } else if (pitchTimer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pitchTimer]);

  const formatTimer = (t) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '26px 32px', marginBottom: 24, borderLeft: '4px solid #F59E0B' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-amber">GENESIS 2026 • REVIEW 1</span>
              <span className="badge badge-cyan">PROBLEM STATEMENT #9</span>
              <span className="badge badge-emerald">RESEARCH & FRICTION DOSSIER</span>
            </div>
            <h1 style={{ fontSize: 28, color: '#FFFFFF', marginBottom: 6 }}>
              Review 1: Research Rigor & Problem Statement Understanding
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 780, lineHeight: 1.5 }}>
              Evaluation Window: <strong>8:00 PM – 11:00 PM, 10th October 2026</strong>. This deck compiles the field research, stakeholder friction matrices, competitor ERP gap analysis, and 24-hour hackathon execution roadmap for the evaluation panel.
            </p>
          </div>

          {/* Interactive Pitch Timer Widget for the team */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>3-MIN VERBAL PITCH CLOCK</div>
            <div className="mono-font" style={{ fontSize: 26, fontWeight: 800, color: pitchTimer <= 30 ? '#FB7185' : '#34D399' }}>
              {formatTimer(pitchTimer)}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="btn-primary" 
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
                <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button 
                onClick={() => { setIsTimerRunning(false); setPitchTimer(180); }}
                className="btn-secondary" 
                style={{ fontSize: 11, padding: '4px 8px' }}
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Minute Verbal Pitch Script Card */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Sparkles size={20} color="#FBBF24" />
          <h3 style={{ fontSize: 18, color: '#FFFFFF' }}>Live Verbal Pitch Teleprompter (For Panel Presentation)</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          
          <div style={{ background: 'rgba(14, 19, 31, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <span className="badge badge-amber" style={{ marginBottom: 8 }}>0:00 - 0:30 • THE HOOK</span>
            <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
              "Good evening, respected evaluators. Amrita operates as a 10,000+ resident micro-city. Yet, on any given weekend, visiting parents spend 45 minutes standing in lines at the Main Gate filling paper slips and hunting for wardens. Meanwhile, student innovators wander AB-1 and AB-3 hunting for empty rooms, and FabLab technicians waste days in email loops because students forgot to specify 3D print infill percentage."
            </p>
          </div>

          <div style={{ background: 'rgba(14, 19, 31, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <span className="badge badge-cyan" style={{ marginBottom: 8 }}>0:30 - 1:15 • PROBLEM #9 DECONSTRUCTION</span>
            <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
              "Under Problem Statement #9, we discovered that campus software like AUMS is built for static academic records (grades, fees, attendance). But operational campus life is real-time, physical, and cross-stakeholder. There is currently zero unified digital bridge connecting Gate Security, Hostel Wardens, Technical Labs, and Student Innovators."
            </p>
          </div>

          <div style={{ background: 'rgba(14, 19, 31, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <span className="badge badge-emerald" style={{ marginBottom: 8 }}>1:15 - 2:15 • CAMPUSSYNC 3 PILLARS</span>
            <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
              "CampusSync unites these three high-friction workflows:
              1. <strong>Administrative E-Governance:</strong> Verified Parent E-Pass with dynamic, anti-screenshot QR codes for gatekeepers.
              2. <strong>Intelligent Service Desk:</strong> Conversational AI FabLab agent that interviews students for engineering specs.
              3. <strong>Resource Utility:</strong> Real-time classroom locator indexing block timetables."
            </p>
          </div>

          <div style={{ background: 'rgba(14, 19, 31, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <span className="badge badge-violet" style={{ marginBottom: 8 }}>2:15 - 3:00 • 24-HR EXECUTION PROMISE</span>
            <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
              "For Review 1, we have validated all stakeholder workflows and data models. Over the next 24 hours, following the GENESIS agenda, our next reviews will wire the full-stack architecture and AI engine, arriving at Review 4 tomorrow morning with a live, testable end-to-end prototype."
            </p>
          </div>

        </div>
      </div>

      {/* Stakeholder Friction Analysis Matrix */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} color="#FB7185" />
            <h3 style={{ fontSize: 18, color: '#FFFFFF' }}>Primary Research & Operational Friction Analysis</h3>
          </div>
          <span className="badge badge-rose">5 STAKEHOLDER GROUPS SURVEYED</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Stakeholder</th>
                <th style={{ padding: '12px 14px' }}>Current Broken Status Quo</th>
                <th style={{ padding: '12px 14px' }}>Operational Friction</th>
                <th style={{ padding: '12px 14px' }}>Quantified Impact</th>
                <th style={{ padding: '12px 14px' }}>CampusSync Fix</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px', fontWeight: 600, color: '#FFFFFF' }}>Visiting Parents</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Physical paper visitor slips; warden search at hostel desk.</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>No advance clearance; paper forgery risk; long lines in the sun.</td>
                <td style={{ padding: '14px', color: '#FB7185', fontWeight: 700 }}>45 to 90 mins wasted</td>
                <td style={{ padding: '14px', color: '#34D399' }}>Pre-authorized dynamic QR E-Pass</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px', fontWeight: 600, color: '#FFFFFF' }}>Gate Security</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Paper logbooks; manual handwriting verification.</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Traffic choke point at main gate; no digital warden clearance check.</td>
                <td style={{ padding: '14px', color: '#FB7185', fontWeight: 700 }}>3-5 mins per car bottleneck</td>
                <td style={{ padding: '14px', color: '#34D399' }}>Sub-second optical camera verification</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px', fontWeight: 600, color: '#FFFFFF' }}>Hostel Wardens</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Manual physical pen-and-paper signatures at hostel office.</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Disrupted at odd hours; zero audit log of vehicle entry/exit.</td>
                <td style={{ padding: '14px', color: '#FB7185', fontWeight: 700 }}>High administrative overhead</td>
                <td style={{ padding: '14px', color: '#34D399' }}>1-click asynchronous digital queue</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px', fontWeight: 600, color: '#FFFFFF' }}>FabLab Techs & Students</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Unstructured ad-hoc emails or WhatsApp messages.</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Students omit infill %, material, layer height, or drill files.</td>
                <td style={{ padding: '14px', color: '#FB7185', fontWeight: 700 }}>3 to 5 days delayed per job</td>
                <td style={{ padding: '14px', color: '#34D399' }}>Conversational AI engineering triage</td>
              </tr>
              <tr>
                <td style={{ padding: '14px', fontWeight: 600, color: '#FFFFFF' }}>Hackathon / Project Teams</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Wandering corridors peeking through classroom door glasses.</td>
                <td style={{ padding: '14px', color: 'var(--text-muted)' }}>Disrupted 15 minutes into group discussion when a class begins.</td>
                <td style={{ padding: '14px', color: '#FB7185', fontWeight: 700 }}>20-30 mins wasted per session</td>
                <td style={{ padding: '14px', color: '#34D399' }}>Timetable-aware live vacancy locator</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 24-Hour Hackathon Delivery Roadmap Mapped to GENESIS Agenda */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={20} color="#06B6D4" />
            <h3 style={{ fontSize: 18, color: '#FFFFFF' }}>24-Hour Hackathon Execution Roadmap (GENESIS '26 Agenda)</h3>
          </div>
          <span className="badge badge-emerald">4-PHASE ALIGNMENT</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="mono-font" style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24' }}>REVIEW 1 (8-11 PM)</span>
              <span className="badge badge-emerald" style={{ fontSize: 9 }}>CURRENT</span>
            </div>
            <h4 style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 6 }}>Research & Problem Understanding</h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Validation of Problem Statement #9, stakeholder friction matrices, design architecture, and user journey flows.
            </p>
          </div>

          <div style={{ background: 'rgba(14, 19, 31, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="mono-font" style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8' }}>REVIEW 2 (11 PM - 2 AM)</span>
              <span className="badge badge-cyan" style={{ fontSize: 9 }}>NEXT</span>
            </div>
            <h4 style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 6 }}>Tech Stack & AI Usage</h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Full-stack integration, dynamic QR token cryptographic hashing, prompt engineering for AI spec triage agent.
            </p>
          </div>

          <div style={{ background: 'rgba(14, 19, 31, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="mono-font" style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA' }}>REVIEW 3 (2 AM - 5 AM)</span>
              <span className="badge badge-violet" style={{ fontSize: 9 }}>UPCOMING</span>
            </div>
            <h4 style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 6 }}>Methodologies & Data Systems</h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Database relational integrity, timetable slot collision algorithm, high-speed camera scanner optimization.
            </p>
          </div>

          <div style={{ background: 'rgba(14, 19, 31, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="mono-font" style={{ fontSize: 12, fontWeight: 700, color: '#34D399' }}>REVIEW 4 (5 AM - 8 AM)</span>
              <span className="badge badge-emerald" style={{ fontSize: 9 }}>UPCOMING</span>
            </div>
            <h4 style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 6 }}>Live Functional Prototype Demo</h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              End-to-end live testing across mobile & desktop with mock gate entry, real AI work order generation, and classroom booking.
            </p>
          </div>

        </div>
      </div>

      {/* Jump to Interactive Demos */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10 }}>
        <button 
          onClick={() => onNavigateTab('pillar1')}
          className="btn-primary" 
          style={{ fontSize: 13, padding: '10px 20px' }}
        >
          <ShieldAlert size={16} />
          <span>Launch Pillar 1: Parent E-Pass & Gate Demo →</span>
        </button>

        <button 
          onClick={() => onNavigateTab('pillar2')}
          className="btn-secondary" 
          style={{ fontSize: 13, padding: '10px 20px' }}
        >
          <Cpu size={16} />
          <span>Launch Pillar 2: AI FabLab Intake Demo →</span>
        </button>

        <button 
          onClick={() => onNavigateTab('pillar3')}
          className="btn-secondary" 
          style={{ fontSize: 13, padding: '10px 20px' }}
        >
          <MapPin size={16} />
          <span>Launch Pillar 3: Classroom Space Locator →</span>
        </button>
      </div>

    </div>
  );
}

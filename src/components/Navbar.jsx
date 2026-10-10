import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  FileText, 
  Clock, 
  Sparkles, 
  Building2, 
  Radio
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand & Amrita Hackathon Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Building2 size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="brand-font" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Campus<span style={{ color: 'var(--primary-glow)' }}>Sync</span>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: 10, padding: '2px 8px' }}>
                <span className="pulsing-dot" style={{ width: 6, height: 6 }}></span>
                GENESIS '26 DEMO
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span>Amrita Vishwa Vidyapeetham</span>
              <span>•</span>
              <span style={{ color: '#38BDF8', fontWeight: 600 }}>Problem Statement #9</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(14, 19, 31, 0.9)',
          padding: '4px 6px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('pillar1')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'pillar1' ? 'linear-gradient(135deg, #06B6D4, #2563EB)' : 'transparent',
              color: activeTab === 'pillar1' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={16} />
            <span>Pillar 1: Parent E-Pass & Gate</span>
          </button>

          <button
            onClick={() => setActiveTab('pillar2')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'pillar2' ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : 'transparent',
              color: activeTab === 'pillar2' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Cpu size={16} />
            <span>Pillar 2: AI FabLab Intake</span>
          </button>

          <button
            onClick={() => setActiveTab('pillar3')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'pillar3' ? 'linear-gradient(135deg, #10B981, #059669)' : 'transparent',
              color: activeTab === 'pillar3' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <MapPin size={16} />
            <span>Pillar 3: Live Classroom Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'dossier' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'transparent',
              color: activeTab === 'dossier' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={16} />
            <span>Review 1 Pitch Deck</span>
            <span className="badge badge-amber" style={{ fontSize: 9, padding: '1px 5px' }}>8-11 PM</span>
          </button>
        </nav>

        {/* Live Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-surface-elevated)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-main)'
          }}>
            <Clock size={14} color="#38BDF8" />
            <span>10 OCT 2026</span>
            <span style={{ color: 'var(--text-dim)' }}>|</span>
            <span style={{ color: '#34D399', fontWeight: 600 }}>{formattedTime}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: 11,
            color: '#34D399',
            fontWeight: 600
          }}>
            <Radio size={14} className="pulsing-dot" />
            <span>CAMPUS GATE ACTIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

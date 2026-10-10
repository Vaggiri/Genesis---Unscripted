import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  FileText, 
  Zap, 
  Sparkles,
  Presentation
} from 'lucide-react';

export default function DemoControls({ activeTab, setActiveTab }) {
  return (
    <aside aria-label="Review 1 Judge Demo Quick-Action Bar" style={{
      position: 'fixed',
      bottom: 18,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999,
      background: 'rgba(11, 15, 23, 0.92)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-glow)',
      borderRadius: 'var(--radius-xl)',
      padding: '8px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8, borderRight: '1px solid var(--border-subtle)' }}>
        <span className="badge badge-amber" style={{ fontSize: 10 }}>
          <Zap size={11} />
          JUDGE DEMO HOTBAR
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => setActiveTab('pillar1')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeTab === 'pillar1' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
            color: activeTab === 'pillar1' ? '#38BDF8' : 'var(--text-muted)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={14} />
          <span>1. Parent Pass & Gate</span>
        </button>

        <button
          onClick={() => setActiveTab('pillar2')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeTab === 'pillar2' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
            color: activeTab === 'pillar2' ? '#A78BFA' : 'var(--text-muted)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Cpu size={14} />
          <span>2. AI FabLab Triage</span>
        </button>

        <button
          onClick={() => setActiveTab('pillar3')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeTab === 'pillar3' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
            color: activeTab === 'pillar3' ? '#34D399' : 'var(--text-muted)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <MapPin size={14} />
          <span>3. Free Rooms</span>
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeTab === 'dossier' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
            color: activeTab === 'dossier' ? '#FBBF24' : 'var(--text-muted)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Presentation size={14} />
          <span>4. Review 1 Deck</span>
        </button>
      </div>
    </aside>
  );
}

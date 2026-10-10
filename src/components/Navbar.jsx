import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Compass, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  Database, 
  Clock, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { getSupabaseConfig } from '../services/supabaseClient';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenSupabaseModal, 
  simulatedContext, 
  setSimulatedContext 
}) {
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [liveClock, setLiveClock] = useState('');

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseConnected(Boolean(config.url && config.key));

    const updateClock = () => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const timePresets = [
    { label: 'Real System Clock', day: 'Monday', time: '' },
    { label: 'Morning Slot 1 (09:15 AM)', day: 'Monday', time: '09:15' },
    { label: 'Morning Slot 3 (11:00 AM)', day: 'Monday', time: '11:00' },
    { label: 'Afternoon Lab Slot (02:00 PM)', day: 'Monday', time: '14:00' },
    { label: 'Evening Free Period (04:30 PM)', day: 'Monday', time: '16:30' }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
          }}>
            <Building2 size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#fff' }}>
                Campus<span style={{ color: '#818cf8' }}>Sync</span>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                AMRITA PS#9
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1 }}>
              Unified E-Governance & Intelligent Space Matrix
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              background: activeTab === 'home' ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
              color: activeTab === 'home' ? '#c7d2fe' : 'var(--text-secondary)',
              border: activeTab === 'home' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Hub
          </button>

          <button
            onClick={() => setActiveTab('classrooms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              background: activeTab === 'classrooms' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              color: activeTab === 'classrooms' ? '#6ee7b7' : 'var(--text-secondary)',
              border: activeTab === 'classrooms' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <Compass size={15} />
            <span>Classroom Occupancy</span>
            <span className="pulse-dot dot-available" style={{ marginLeft: '2px' }} />
          </button>

          <button
            onClick={() => setActiveTab('parent-epass')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              background: activeTab === 'parent-epass' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'parent-epass' ? '#c7d2fe' : 'var(--text-secondary)',
              border: activeTab === 'parent-epass' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <ShieldCheck size={15} />
            <span>Parent E-Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('fablab')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              background: activeTab === 'fablab' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'fablab' ? '#7dd3fc' : 'var(--text-secondary)',
              border: activeTab === 'fablab' ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <Cpu size={15} />
            <span>AI FabLab Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              background: activeTab === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'admin' ? '#fcd34d' : 'var(--text-secondary)',
              border: activeTab === 'admin' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <Sliders size={15} />
            <span>Admin Portal</span>
          </button>
        </nav>

        {/* Right Tools: Time Simulator & Supabase Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Time Simulator Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.775rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
              title="Change simulated time slot to test classroom occupancy"
            >
              <Clock size={14} color="#818cf8" />
              <span>{simulatedContext.time ? `${simulatedContext.time} (${simulatedContext.day})` : `${liveClock || 'Live'}`}</span>
              <ChevronDown size={13} color="var(--text-muted)" />
            </button>

            {showTimeDropdown && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '240px',
                background: '#111827',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 200,
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                  SIMULATE CAMPUS TIME SLOT
                </div>
                {timePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSimulatedContext({ day: preset.day, time: preset.time });
                      setShowTimeDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem',
                      background: (simulatedContext.time === preset.time) ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: (simulatedContext.time === preset.time) ? '#a5b4fc' : '#e5e7eb',
                      fontSize: '0.775rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{preset.label}</span>
                    {preset.time && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{preset.time}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: supabaseConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${supabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              color: supabaseConnected ? '#34d399' : 'var(--text-secondary)',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Configure Supabase Cloud Database"
          >
            <Database size={14} color={supabaseConnected ? '#10b981' : '#9ca3af'} />
            <span>{supabaseConnected ? 'Cloud DB Active' : 'Configure DB'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { 
  Compass, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';

export default function MainPortalHome({ 
  onNavigate, 
  stats, 
  settings, 
  pagesConfig = [] 
}) {
  // Find custom titles from dynamic pages config if set by admin
  const getPageInfo = (slug, fallbackTitle, fallbackSubtitle) => {
    const page = pagesConfig.find(p => p.slug === slug);
    if (!page) return { title: fallbackTitle, subtitle: fallbackSubtitle };
    return {
      title: page.title || fallbackTitle,
      subtitle: page.subtitle || fallbackSubtitle,
      badge: page.badge
    };
  };

  const roomModuleInfo = getPageInfo(
    'classroom-occupancy',
    'Classroom & Lab Occupancy Locator',
    'Live timetable cross-indexing, vacancy detection, and crowdsourced occupancy reporting'
  );

  const parentModuleInfo = getPageInfo(
    'parent-epass',
    'Parent Hostel Visit & Gate E-Pass',
    'Pre-clearance QR fast lane, warden 1-click approvals, and secure digital gate logs'
  );

  const fablabModuleInfo = getPageInfo(
    'fablab-desk',
    'AI FabLab Intake Desk',
    'Multi-turn conversational triage for 3D printing & PCB CNC fabrication work orders'
  );

  const adminModuleInfo = getPageInfo(
    'admin-portal',
    'CampusSync Administrative Console',
    'Zero-hardcode dynamic page configuration, timetable management, and report moderation'
  );

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      {/* Dynamic Announcement Banner (Admin Editable) */}
      {settings?.banner_active && settings?.banner_message && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          fontSize: '0.875rem',
          color: '#e0e7ff'
        }}>
          <Sparkles size={18} color="#818cf8" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{settings.banner_message}</span>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
            {settings?.active_semester || 'Active Semester'}
          </span>
        </div>
      )}

      {/* Hero Welcome */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }} className="badge badge-indigo">
          <Layers size={13} />
          <span>Problem Statement #9: Unified Campus E-Governance</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
          Smart Campus Operations, <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #818cf8 0%, #34d399 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Zero Paperwork. Zero Guesswork.
          </span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {settings?.campus_name || 'Amrita Vishwa Vidyapeetham'}. Seamlessly bridging physical security checkpoints, makerspace prototyping requests, and real-time academic classroom availability.
        </p>
      </div>

      {/* Live Campus Telemetry Badges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>INDEXED ROOMS</span>
            <Compass size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalRooms || 10}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across AB-1, AB-2, AB-3, CIR</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>AVAILABLE RIGHT NOW</span>
            <span className="pulse-dot dot-available" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>{stats.availableRooms || 6}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Free for project teams & study</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>FLAGGED ROOMS</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>{stats.flaggedRooms || 1}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reported occupied ≥2x unscheduled</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CROWD REPORTS</span>
            <Info size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalReports || 3}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live crowdsourced status updates</div>
        </div>
      </div>

      {/* Main Navigation Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Module 1: Classroom Occupancy (ACTIVE & EXPANDED) */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.75rem', 
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(180deg, rgba(19, 27, 46, 0.85) 0%, rgba(16, 185, 129, 0.05) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(16, 185, 129, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Compass size={24} color="#10b981" />
              </div>
              <span className="badge badge-emerald">Active Module</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {roomModuleInfo.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {roomModuleInfo.subtitle}. View occupancy, batch/department details, lab tags, and student crowd reporting with automated multi-report flagging.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#6ee7b7' }}>
              <CheckCircle2 size={16} />
              <span>Timetable collision detection + Crowdsource reporting live</span>
            </div>
            <button 
              onClick={() => onNavigate('classrooms')}
              className="btn-primary" 
              style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <span>Explore Classroom Locator</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Module 2: Parent E-Pass */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(99, 102, 241, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ShieldCheck size={24} color="#818cf8" />
              </div>
              <span className="badge badge-indigo">Pillar 1: E-Governance</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {parentModuleInfo.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {parentModuleInfo.subtitle}. Replaces paper slips with anti-screenshot dynamic QR passes and sub-second gate security verification.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('parent-epass')}
            className="btn-secondary" 
            style={{ width: '100%' }}
          >
            <span>View E-Pass Workflow</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Module 3: AI FabLab Intake */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(6, 182, 212, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Cpu size={24} color="#38bdf8" />
              </div>
              <span className="badge badge-cyan">Pillar 2: AI Service Desk</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {fablabModuleInfo.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {fablabModuleInfo.subtitle}. Conversational AI agent acting as a virtual lab technician to elicit complete engineering parameters.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('fablab')}
            className="btn-secondary" 
            style={{ width: '100%' }}
          >
            <span>View AI Service Desk</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Module 4: Administrative Console (Dynamic CMS) */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.75rem',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(245, 158, 11, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Sliders size={24} color="#f59e0b" />
              </div>
              <span className="badge badge-amber">Admin Control Desk</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {adminModuleInfo.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {adminModuleInfo.subtitle}. Add/edit classrooms, update weekly timetables, moderate crowd reports, and dynamically edit portal text without touching code.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('admin')}
            className="btn-secondary" 
            style={{ width: '100%', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fcd34d' }}
          >
            <span>Launch Admin Portal</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}

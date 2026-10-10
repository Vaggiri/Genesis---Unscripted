import React, { useState } from 'react';
import { 
  Building2, 
  Compass, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  Menu, 
  X, 
  Database,
  Clock,
  Sparkles
} from 'lucide-react';
import { getSupabaseConfig } from '../services/supabaseClient';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenSupabaseModal 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const config = getSupabaseConfig();
  const isSupabaseActive = Boolean(config.url && config.key);

  const navItems = [
    { id: 'home', label: 'Home', icon: Building2 },
    { id: 'classrooms', label: 'Classroom Occupancy', icon: Compass, badge: 'Live' },
    { id: 'parent-epass', label: 'Parent Gate Pass', icon: ShieldCheck },
    { id: 'fablab', label: 'FabLab Request', icon: Cpu },
    { id: 'admin', label: 'Admin Desk', icon: Sliders }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="amrita-header">
        {/* Official Amrita Maroon Top Strip */}
        <div className="amrita-top-strip">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>AMRITA VISHWA VIDYAPEETHAM • COIMBATORE CAMPUS</span>
            <span style={{ display: 'none', md: 'inline' }}>E-GOVERNANCE & SERVICE PORTAL</span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          
          {/* Logo & Portal Title */}
          <div 
            onClick={() => handleNavClick('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--amrita-maroon)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}>
              A
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Campus<span style={{ color: 'var(--amrita-maroon)' }}>Sync</span>
                </span>
                <span className="badge badge-maroon" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  Amrita Portal
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                Unified Campus E-Services
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'none', gap: '0.35rem', alignItems: 'center' }} className="desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    minHeight: '40px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--amrita-maroon-bg)' : 'transparent',
                    color: isActive ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="badge badge-available" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Tools: Database Status & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={onOpenSupabaseModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSupabaseActive ? 'var(--status-available-bg)' : 'var(--bg-surface-alt)',
                border: `1px solid ${isSupabaseActive ? 'var(--status-available-border)' : 'var(--border-light)'}`,
                color: isSupabaseActive ? 'var(--status-available-text)' : 'var(--text-secondary)',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Cloud Database Status"
            >
              <Database size={14} color={isSupabaseActive ? 'var(--status-available)' : 'var(--text-muted)'} />
              <span className="db-label">{isSupabaseActive ? 'Cloud Sync' : 'Database'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
              className="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-light)',
            padding: '1rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      minHeight: '46px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--amrita-maroon-bg)' : 'transparent',
                      color: isActive ? 'var(--amrita-maroon)' : 'var(--text-main)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Icon size={18} color={isActive ? 'var(--amrita-maroon)' : 'var(--text-muted)'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Style overrides for responsive header layout */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

import React from 'react';
import { 
  Building2, 
  LogOut, 
  Database, 
  User, 
  Sliders,
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  Wrench,
  Lock,
  Zap
} from 'lucide-react';
import { getSupabaseConfig } from '../services/supabaseClient';

export default function Navbar({ 
  currentUser, 
  onLogout, 
  onOpenSupabaseModal,
  onOpenAiModal
}) {
  const config = getSupabaseConfig();
  const isSupabaseActive = Boolean(config.url && config.key);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return GraduationCap;
      case 'faculty': return BookOpen;
      case 'admin': return Lock;
      default: return User;
    }
  };

  const RoleIcon = currentUser ? getRoleIcon(currentUser.role) : User;

  return (
    <header className="amrita-header">
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        minHeight: '60px',
        paddingTop: '0.35rem',
        paddingBottom: '0.35rem'
      }}>
        
        {/* Logo & Portal Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--amrita-maroon)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.15rem',
            boxShadow: '0 3px 10px rgba(164, 18, 63, 0.25)',
            flexShrink: 0
          }}>
            Y
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
              <span style={{ 
                fontSize: '1.15rem', 
                fontWeight: 900, 
                color: 'var(--text-main)', 
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap'
              }}>
                Amrita <span style={{ color: 'var(--amrita-maroon)' }}>Yukti</span>
              </span>
              <span className="badge badge-maroon hide-mobile" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                Portal
              </span>
            </div>
            <div className="desktop-subtitle" style={{ fontSize: '0.675rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              Centralized Innovation Facility Booking & Utilization
            </div>
            <div className="mobile-subtitle" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.2, fontWeight: 500 }}>
              Campus Innovation Facility Radar
            </div>
          </div>
        </div>

        {/* Right Tools: Cloud DB, AI Bridge, & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>

          {/* Cloud Database Indicator */}
          <button
            onClick={onOpenSupabaseModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.38rem 0.55rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isSupabaseActive ? 'var(--status-available-bg)' : 'var(--bg-surface-alt)',
              border: `1px solid ${isSupabaseActive ? 'var(--status-available-border)' : 'var(--border-light)'}`,
              color: isSupabaseActive ? 'var(--status-available-text)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Supabase Database Status"
          >
            <Database size={15} color={isSupabaseActive ? 'var(--status-available)' : 'var(--text-muted)'} />
            <span className="hide-mobile">{isSupabaseActive ? 'DB Connected' : 'DB'}</span>
          </button>

          {/* AI Engine & ngrok Bridge Indicator */}
          <button
            onClick={onOpenAiModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.38rem 0.55rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="OmniRoute AI & ngrok Bridge Settings"
          >
            <Zap size={15} color="#d97706" />
            <span className="hide-mobile">AI Bridge</span>
          </button>

          {/* User Session Profile & Logout */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div
                className="hide-mobile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.775rem'
                }}>
                <RoleIcon size={14} color="var(--amrita-maroon)" />
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {currentUser.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.38rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#fff5f5',
                  color: '#b91c1c',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Log Out of Session"
              >
                <LogOut size={13} color="#b91c1c" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <span className="hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Authentication Required
            </span>
          )}

        </div>

      </div>
    </header>
  );
}

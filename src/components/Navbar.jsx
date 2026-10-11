import React from 'react';
import { 
  LogOut, 
  Database, 
  User, 
  GraduationCap,
  BookOpen,
  Wrench,
  Lock,
  Globe,
  Bell
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSupabaseConfig } from '../services/supabaseClient';
import YuktiLogo from './YuktiLogo';

export default function Navbar({ 
  currentUser, 
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount = 0
}) {
  const { i18n } = useTranslation();
  const config = getSupabaseConfig();
  const isSupabaseActive = Boolean(config.url && config.key);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return GraduationCap;
      case 'faculty': return BookOpen;
      case 'lab_incharge': return Wrench;
      case 'admin': return Lock;
      default: return User;
    }
  };

  const RoleIcon = currentUser ? getRoleIcon(currentUser.role) : User;

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('amrita_yukti_lang', lang);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <YuktiLogo size={38} />
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

        {/* Right Tools: Language Switcher, Database Status, Notifications, & Session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-surface-alt)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <Globe size={13} color="var(--amrita-maroon)" />
            <select
              value={i18n.language || 'en'}
              onChange={handleLanguageChange}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
              <option value="ml">മലയാളം</option>
            </select>
          </div>

          {/* Database Status (Clean Read-Only Indicator, No Edit Modal) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isSupabaseActive ? 'var(--status-available-bg)' : 'var(--bg-surface-alt)',
              border: `1px solid ${isSupabaseActive ? 'var(--status-available-border)' : 'var(--border-light)'}`,
              color: isSupabaseActive ? 'var(--status-available-text)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title={isSupabaseActive ? 'Database Connected & Synced' : 'Database Offline'}
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isSupabaseActive ? 'var(--status-available)' : '#94a3b8',
              boxShadow: isSupabaseActive ? '0 0 0 2px rgba(22, 163, 74, 0.25)' : 'none'
            }} />
            <Database size={13} color={isSupabaseActive ? 'var(--status-available)' : 'var(--text-muted)'} />
            <span className="hide-mobile">{isSupabaseActive ? 'DB Connected' : 'DB Offline'}</span>
          </div>

          {/* User Session Profile, Notifications & Logout */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              
              {/* Notification Bell Trigger */}
              <button
                type="button"
                onClick={onOpenNotifications}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-light)',
                  color: unreadNotificationsCount > 0 ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread notifications` : 'Notifications Radar'}
              >
                <Bell size={16} />
                {unreadNotificationsCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: 'var(--amrita-maroon)',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '2px solid #ffffff'
                  }}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* User Profile Pill */}
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
                  {currentUser.full_name || currentUser.name || 'User'}
                </span>
                <span className="badge badge-maroon" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem', textTransform: 'capitalize' }}>
                  {currentUser.role?.replace('_', ' ')}
                </span>
              </div>

              {/* Log Out Button */}
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

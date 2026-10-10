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
  Lock
} from 'lucide-react';
import { getSupabaseConfig } from '../services/supabaseClient';

export default function Navbar({ 
  currentUser, 
  onLogout, 
  onOpenSupabaseModal 
}) {
  const config = getSupabaseConfig();
  const isSupabaseActive = Boolean(config.url && config.key);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return GraduationCap;
      case 'parent': return Users;
      case 'faculty': return BookOpen;
      case 'warden': return ShieldCheck;
      case 'workers_manager': return Wrench;
      case 'admin': return Lock;
      default: return User;
    }
  };

  const RoleIcon = currentUser ? getRoleIcon(currentUser.role) : User;

  return (
    <header className="amrita-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '62px' }}>
        
        {/* Logo & Portal Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
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
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Campus <span style={{ color: 'var(--amrita-maroon)' }}>Setu</span>
              </span>
              <span className="badge badge-maroon" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                Portal
              </span>
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', lineHeight: 1 }}>
              Innovation Facility Booking & Utilization
            </div>
          </div>
        </div>

        {/* Right Tools: User Session Info & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          
          {/* Cloud Database Indicator */}
          <button
            onClick={onOpenSupabaseModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.65rem',
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
            <Database size={13} color={isSupabaseActive ? 'var(--status-available)' : 'var(--text-muted)'} />
            <span style={{ display: 'none', sm: 'inline' }}>{isSupabaseActive ? 'DB Connected' : 'DB'}</span>
          </button>

          {/* User Session Profile & Logout */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
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
                <span className="badge badge-maroon" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', textTransform: 'capitalize' }}>
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-secondary)',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Switch Role or Log Out"
              >
                <LogOut size={13} />
                <span>Switch Role</span>
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Authentication Required
            </span>
          )}

        </div>

      </div>
    </header>
  );
}

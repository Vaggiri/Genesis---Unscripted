import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Wrench, 
  Lock, 
  ArrowRight, 
  Key, 
  CheckCircle2 
} from 'lucide-react';
import { DEMO_USERS, setStoredUser } from '../services/auth';

export default function LoginPage({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [identifier, setIdentifier] = useState('CB.EN.U4CSE23012');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap, defaultId: 'CB.EN.U4CSE23012' },
    { id: 'parent', label: 'Parent', icon: Users, defaultId: '9840123456' },
    { id: 'faculty', label: 'Faculty', icon: BookOpen, defaultId: 'AMR-FAC-209' },
    { id: 'warden', label: 'Warden', icon: ShieldCheck, defaultId: 'AMR-WRD-044' },
    { id: 'workers_manager', label: 'Workers Mgr', icon: Wrench, defaultId: 'AMR-MTN-301' },
    { id: 'admin', label: 'Admin', icon: Lock, defaultId: 'sysadmin@amrita.edu' }
  ];

  const handleRoleTabClick = (roleId) => {
    setSelectedRole(roleId);
    const target = roles.find(r => r.id === roleId);
    if (target) setIdentifier(target.defaultId);
    setError('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const user = DEMO_USERS[selectedRole];
    if (user) {
      setStoredUser(user);
      onLoginSuccess(user);
    } else {
      setError('Invalid credentials for selected role.');
    }
  };

  const handleQuickDemoLogin = (roleId) => {
    const user = DEMO_USERS[roleId];
    if (user) {
      setStoredUser(user);
      onLoginSuccess(user);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem'
    }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--amrita-maroon)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.4rem',
            margin: '0 auto 0.75rem',
            boxShadow: '0 4px 10px rgba(164, 18, 63, 0.25)'
          }}>
            A
          </div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.65rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Campus<span style={{ color: 'var(--amrita-maroon)' }}>Sync</span> Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Centralized Innovation Facility Booking & Utilization Portal
          </p>
        </div>

        {/* Role Selector Card */}
        <div className="card-amrita" style={{ padding: '1.5rem' }}>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Select Your Campus Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleTabClick(r.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '0.65rem 0.25rem',
                      minHeight: '56px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--amrita-maroon-bg)' : '#ffffff',
                      color: isSelected ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Icon size={18} color={isSelected ? 'var(--amrita-maroon)' : 'var(--text-muted)'} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {error && (
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-occupied-bg)', color: 'var(--status-occupied-text)', fontSize: '0.75rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {selectedRole === 'student' ? 'Student Roll Number' : selectedRole === 'parent' ? 'Registered Mobile Number' : selectedRole === 'admin' ? 'Admin Username' : 'Employee ID'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="form-input"
                style={{ minHeight: '42px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Password / Passcode
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                style={{ minHeight: '42px' }}
              />
            </div>

            <button
              type="submit"
              className="btn-amrita"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <span>Sign In to {roles.find(r => r.id === selectedRole)?.label} Portal</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Switcher (Judges / Hackathon Evaluators 1-Click Access) */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              ⚡ 1-Click Demo Profiles (For Reviewers)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {roles.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(r.id)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface-alt)',
                    color: 'var(--text-main)',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

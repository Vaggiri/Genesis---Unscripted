import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Wrench, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ROLE_CREDENTIALS, verifyAndAuthenticate, setStoredUser } from '../services/auth';

export default function LoginPage({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { 
      id: 'student', 
      label: 'Student', 
      icon: GraduationCap, 
      fieldLabel: 'Student Roll Number', 
      placeholder: 'e.g. CB.EN.U4CSE23012' 
    },
    { 
      id: 'parent', 
      label: 'Parent', 
      icon: Users, 
      fieldLabel: 'Registered Mobile Number', 
      placeholder: 'e.g. 9840123456' 
    },
    { 
      id: 'faculty', 
      label: 'Faculty', 
      icon: BookOpen, 
      fieldLabel: 'Faculty Employee ID', 
      placeholder: 'e.g. AMR-FAC-209' 
    },
    { 
      id: 'warden', 
      label: 'Warden', 
      icon: ShieldCheck, 
      fieldLabel: 'Warden ID', 
      placeholder: 'e.g. AMR-WRD-044' 
    },
    { 
      id: 'workers_manager', 
      label: 'Workers Mgr', 
      icon: Wrench, 
      fieldLabel: 'Worker / Maintenance ID', 
      placeholder: 'e.g. AMR-MTN-301' 
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      icon: Lock, 
      fieldLabel: 'Administrator Username', 
      placeholder: 'e.g. admin' 
    }
  ];

  const currentRoleConfig = roles.find(r => r.id === selectedRole) || roles[0];
  const roleCreds = ROLE_CREDENTIALS[selectedRole] || ROLE_CREDENTIALS.student;

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    // Clear inputs when role is switched so the user enters credentials specifically for that role
    setIdentifier('');
    setPassword('');
  };

  const handleAutoFill = () => {
    const cred = ROLE_CREDENTIALS[selectedRole];
    if (cred) {
      setIdentifier(cred.exampleId);
      setPassword(cred.examplePass);
      setError('');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Strict credential verification based solely on selected role and entered credentials
    const result = verifyAndAuthenticate(selectedRole, identifier, password);
    if (!result.success) {
      setError(result.error);
      return;
    }

    // Success: store user and navigate strictly to the respective authenticated role's portal
    setStoredUser(result.user);
    onLoginSuccess(result.user);
  };

  return (
    <div style={{
      minHeight: '82vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '490px', width: '100%' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: 'var(--amrita-maroon)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.5rem',
            margin: '0 auto 0.75rem',
            boxShadow: '0 6px 16px rgba(164, 18, 63, 0.3)'
          }}>
            A
          </div>
          <h1 style={{ 
            fontSize: '1.85rem', 
            fontWeight: 800, 
            color: 'var(--text-main)', 
            marginBottom: '0.25rem',
            letterSpacing: '-0.02em'
          }}>
            Campus <span style={{ color: 'var(--amrita-maroon)' }}>Setu</span>
          </h1>
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)',
            fontWeight: 500,
            marginBottom: '0.4rem'
          }}>
            Centralized Innovation Facility Booking & Utilization Portal
          </p>
          <div style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--amrita-maroon)',
            backgroundColor: 'var(--amrita-maroon-bg)',
            padding: '0.2rem 0.75rem',
            borderRadius: 'var(--radius-full)'
          }}>
            Amrita Vishwa Vidyapeetham • Problem Statement #9
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="card-amrita" style={{ 
          padding: '1.5rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
        }}>
          
          {/* Step 1: Role Selector Grid */}
          <div style={{ marginBottom: '1.35rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '0.55rem' 
            }}>
              <label style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                1. Select Your Role
              </label>
              <span style={{ fontSize: '0.725rem', color: 'var(--amrita-maroon)', fontWeight: 600 }}>
                Active: {currentRoleConfig.label}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '0.75rem 0.25rem',
                      minHeight: '62px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--amrita-maroon)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--amrita-maroon-bg)' : '#ffffff',
                      color: isSelected ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.775rem',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Icon size={19} color={isSelected ? 'var(--amrita-maroon)' : 'var(--text-muted)'} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Login Form */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '0.9rem'
            }}>
              <label style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                2. Enter Credentials for {currentRoleConfig.label}
              </label>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--status-occupied-bg)',
                color: 'var(--status-occupied-text)',
                border: '1px solid var(--status-occupied-border)',
                fontSize: '0.785rem',
                fontWeight: 600,
                lineHeight: 1.35
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}

            {/* Role-Specific Identifier Input */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.76rem', 
                fontWeight: 700, 
                color: 'var(--text-main)', 
                marginBottom: '0.3rem' 
              }}>
                {currentRoleConfig.fieldLabel} <span style={{ color: 'var(--amrita-maroon)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder={currentRoleConfig.placeholder}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError('');
                }}
                required
                className="form-input"
                style={{ 
                  minHeight: '44px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            {/* Password Input with Visibility Toggle */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.76rem', 
                fontWeight: 700, 
                color: 'var(--text-main)', 
                marginBottom: '0.3rem' 
              }}>
                Password / Passcode <span style={{ color: 'var(--amrita-maroon)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  className="form-input"
                  style={{ 
                    minHeight: '44px',
                    fontSize: '0.875rem',
                    paddingRight: '40px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Reviewer / Evaluator Demo Auto-Fill Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              fontSize: '0.725rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-surface-alt)',
              border: '1px dashed var(--border-medium)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--text-muted)' }}>Demo Creds: </span>
                <strong>{roleCreds.exampleId}</strong> (<code>{roleCreds.examplePass}</code>)
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--amrita-maroon)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  flexShrink: 0,
                  fontSize: '0.725rem'
                }}
              >
                Auto-Fill
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-amrita"
              style={{ 
                width: '100%', 
                minHeight: '46px',
                marginTop: '0.4rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Sign In to {currentRoleConfig.label} Portal</span>
              <ArrowRight size={17} />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

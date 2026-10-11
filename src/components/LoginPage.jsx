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
  CheckCircle2, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { 
  loginWithCredentials, 
  registerUser, 
  detectRoleFromIdentifier, 
  setStoredUser,
  ROLE_CREDENTIALS 
} from '../services/auth';

export default function LoginPage({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Signup form state
  const [signupRole, setSignupRole] = useState('student');
  const [signupName, setSignupName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDept, setSignupDept] = useState('Computer Science & Engineering');
  const [signupBatch, setSignupBatch] = useState('B.Tech CSE-B (2024-2028)');
  const [signupSuccess, setSignupSuccess] = useState('');

  // Real-time role detection as user types their username/roll number
  const detectedRole = detectRoleFromIdentifier(identifier);

  const getRoleDetails = (role) => {
    switch (role) {
      case 'student': return { label: 'Student Innovator', icon: GraduationCap, color: '#15803d', bg: '#f0fdf4' };
      case 'faculty': return { label: 'Faculty & Lab In-Charge', icon: BookOpen, color: '#7c3aed', bg: '#f5f3ff' };
      case 'admin': return { label: 'Portal Administrator', icon: Lock, color: '#be123c', bg: '#fff1f2' };
      default: return null;
    }
  };

  const detectedInfo = detectedRole ? getRoleDetails(detectedRole) : null;

  // Handle Login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = loginWithCredentials(identifier, password);
    if (!result.success) {
      setError(result.error);
      return;
    }

    // Successfully resolved role and validated credentials
    setStoredUser(result.user);
    onLoginSuccess(result.user);
  };

  // Handle Sign Up submission
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSignupSuccess('');

    const result = registerUser({
      role: signupRole,
      name: signupName,
      identifier: signupId,
      email: signupEmail,
      password: signupPassword,
      department: signupDept,
      batch: signupBatch
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSignupSuccess(`Account created successfully as ${signupRole}! Redirecting to your portal...`);
    setTimeout(() => {
      setStoredUser(result.user);
      onLoginSuccess(result.user);
    }, 800);
  };

  // Quick Demo Auto-Fill Helper for Reviewers
  const handleDemoFill = (roleKey) => {
    const cred = ROLE_CREDENTIALS[roleKey];
    if (cred) {
      setIdentifier(cred.exampleId);
      setPassword(cred.examplePass);
      setError('');
    }
  };

  return (
    <div style={{
      minHeight: '84vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '470px', width: '100%' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.65rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: 'var(--amrita-maroon)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.5rem',
            margin: '0 auto 0.75rem',
            boxShadow: '0 6px 16px rgba(164, 18, 63, 0.28)'
          }}>
            Y
          </div>
          <h1 style={{ 
            fontSize: '1.85rem', 
            fontWeight: 800, 
            color: 'var(--text-main)', 
            marginBottom: '0.2rem',
            letterSpacing: '-0.02em'
          }}>
            Amrita <span style={{ color: 'var(--amrita-maroon)' }}>Yukti</span>
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
            AI Lab Matching • Component Stock Radar • Slot Booking
          </div>
        </div>

        {/* Authentication Card */}
        <div className="card-amrita" style={{ 
          padding: '1.65rem',
          boxShadow: '0 8px 26px rgba(0, 0, 0, 0.06)'
        }}>
          
          {/* Mode Tabs: Sign In / Sign Up */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-alt)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.35rem',
            border: '1px solid var(--border-light)'
          }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: authMode === 'login' ? '#ffffff' : 'transparent',
                color: authMode === 'login' ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                fontWeight: authMode === 'login' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setError(''); }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: authMode === 'signup' ? '#ffffff' : 'transparent',
                color: authMode === 'signup' ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                fontWeight: authMode === 'signup' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: authMode === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              <UserPlus size={15} />
              <span>Sign Up / Register</span>
            </button>
          </div>

          {/* Feedback Banners */}
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
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.15rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {signupSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-available-bg)',
              color: 'var(--status-available-text)',
              border: '1px solid var(--status-available-border)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.15rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{signupSuccess}</span>
            </div>
          )}

          {/* MODE 1: UNIFIED SIGN IN (Username & Password Only) */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Username / Roll Number Input */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Username / Roll Number / ID <span style={{ color: 'var(--amrita-maroon)' }}>*</span>
                  </label>

                  {/* Dynamic Role Detection Badge */}
                  {detectedInfo && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: detectedInfo.color,
                      backgroundColor: detectedInfo.bg,
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${detectedInfo.color}33`
                    }}>
                      <detectedInfo.icon size={12} />
                      <span>{detectedInfo.label} Detected</span>
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="e.g. CB.EN.U4CSE23012, 9840123456, or admin"
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
                    fontFamily: identifier.startsWith('CB.EN') || identifier.startsWith('AMR') ? 'monospace' : 'inherit'
                  }}
                  autoFocus
                />
                <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Auto-redirects based on credentials (Student Innovator, Faculty In-Charge, Admin).
                </span>
              </div>

              {/* Password Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
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
                    style={{ minHeight: '44px', fontSize: '0.875rem', paddingRight: '42px' }}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-amrita"
                style={{
                  width: '100%',
                  minHeight: '46px',
                  marginTop: '0.3rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>
                  {detectedInfo ? `Sign In to ${detectedInfo.label} Portal` : 'Sign In to Campus Setu'}
                </span>
                <ArrowRight size={17} />
              </button>

              {/* Quick Evaluator / Demo Helper Bar */}
              <div style={{
                marginTop: '0.65rem',
                paddingTop: '0.85rem',
                borderTop: '1px dashed var(--border-light)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.45rem'
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    💡 Quick Fill Demo Credentials (For Testing)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('student')}
                    style={{
                      padding: '0.45rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-surface-alt)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('faculty')}
                    style={{
                      padding: '0.45rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-surface-alt)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    📖 Faculty In-Charge
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('admin')}
                    style={{
                      padding: '0.45rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-surface-alt)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--amrita-maroon)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    🔒 Lab Admin
                  </button>
                </div>
              </div>

            </form>
          ) : (
            /* MODE 2: SIGN UP / REGISTER NEW USER */
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              <div style={{ marginBottom: '0.2rem' }}>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setError(''); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  title="Return to Sign In"
                >
                  <ArrowLeft size={14} color="var(--amrita-maroon)" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Registering As (Role) <span style={{ color: 'var(--amrita-maroon)' }}>*</span>
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="form-select"
                  style={{ minHeight: '42px', fontSize: '0.85rem' }}
                >
                  <option value="student">Student Innovator (Roll No: CB.EN.U4...)</option>
                  <option value="faculty">Faculty & Lab In-Charge (Employee ID: AMR-FAC-...)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Full Name <span style={{ color: 'var(--amrita-maroon)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adithya K."
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className="form-input"
                  style={{ minHeight: '42px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  {signupRole === 'student' ? 'Student Roll Number' : 'Faculty Employee ID'} <span style={{ color: 'var(--amrita-maroon)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    signupRole === 'student' ? 'e.g. CB.EN.U4AIE23045' : 'e.g. AMR-FAC-209'
                  }
                  value={signupId}
                  onChange={(e) => setSignupId(e.target.value)}
                  required
                  className="form-input"
                  style={{ minHeight: '42px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>

              {signupRole === 'student' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={signupDept}
                      onChange={(e) => setSignupDept(e.target.value)}
                      className="form-input"
                      style={{ minHeight: '38px', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Batch
                    </label>
                    <input
                      type="text"
                      value={signupBatch}
                      onChange={(e) => setSignupBatch(e.target.value)}
                      className="form-input"
                      style={{ minHeight: '38px', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder={signupRole === 'student' ? 'adithya@cb.students.amrita.edu' : 'name@cb.amrita.edu'}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '42px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Create Password <span style={{ color: 'var(--amrita-maroon)' }}>*</span>
                </label>
                <input
                  type="password"
                  placeholder="Create password..."
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="form-input"
                  style={{ minHeight: '42px', fontSize: '0.85rem' }}
                />
              </div>

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
                <span>Create Account & Sign In</span>
                <ArrowRight size={17} />
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

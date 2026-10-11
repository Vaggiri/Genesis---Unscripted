import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  LogIn,
  UserPlus,
  ShieldCheck,
  Wrench,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateCollegeEmail } from '../services/auth';
import YuktiLogo from './YuktiLogo';

export default function LoginPage({ onLoginSuccess }) {
  const { signIn, signUp } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Signup form state (defaults strictly to student role)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRoll, setSignupRoll] = useState('');
  const [signupDept, setSignupDept] = useState('Computer Science & Engineering');
  const [signupBatch, setSignupBatch] = useState('2023-2027');
  const [signupSuccess, setSignupSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn({ email, password });
      if (onLoginSuccess) {
        onLoginSuccess(res.profile || res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSignupSuccess('');

    if (!validateCollegeEmail(signupEmail)) {
      setError('Registration is restricted to Amrita college domains: @cb.amrita.edu or @cb.students.amrita.edu');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: signupEmail,
        password: signupPassword,
        fullName: signupName,
        rollNo: signupRoll,
        department: signupDept,
        batch: signupBatch
      });

      setSignupSuccess('Account registered successfully! You may now sign in with your college credentials.');
      setAuthMode('login');
      setEmail(signupEmail);
    } catch (err) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoEmail = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        
        {/* Header Branding */}
        <div className="login-header">
          <YuktiLogo size={62} style={{ marginBottom: '1rem', boxShadow: '0 8px 24px rgba(164,18,63,0.3)', borderRadius: '22px' }} />
          <h1 className="login-title">
            Amrita Yukti Portal
          </h1>
          <p className="login-subtitle">
            Unified Campus Innovation & Space Radar • Coimbatore Campus
          </p>
        </div>

        {/* Tab Toggle: Login vs Signup */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(''); }}
            className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
          >
            <UserPlus size={16} />
            <span>Student Register</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-alert error">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {signupSuccess && (
          <div className="login-alert success">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{signupSuccess}</span>
          </div>
        )}

        {/* Sign In Form */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="login-form-card">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email-input">
                College Email Address
              </label>
              <input
                type="email"
                id="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cb.amrita.edu or @cb.students.amrita.edu"
                required
                className="form-input-styled"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password-input">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  className="form-input-styled password-field"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-login-submit"
            >
              {loading ? 'Authenticating with Supabase...' : (
                <>
                  <span>Sign In to Campus Hub</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form (Public sign-up is strictly for Student accounts) */
          <form onSubmit={handleSignupSubmit} className="login-form-card">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Adithya K."
                required
                className="form-input-styled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Amrita Student Email (@cb.students.amrita.edu)
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="rollno@cb.students.amrita.edu"
                required
                className="form-input-styled"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                value={signupRoll}
                onChange={(e) => setSignupRoll(e.target.value)}
                placeholder="CB.EN.U4AIE23045"
                required
                className="form-input-styled"
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  value={signupDept}
                  onChange={(e) => setSignupDept(e.target.value)}
                  className="form-input-styled"
                >
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="AI & Data Science">AI & DS</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Mechanical Engineering">MECH</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch</label>
                <input
                  type="text"
                  value={signupBatch}
                  onChange={(e) => setSignupBatch(e.target.value)}
                  className="form-input-styled"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Create Password</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="form-input-styled"
              />
            </div>

            <p className="signup-notice">
              ℹ️ Public registration creates Student Innovator accounts. Faculty, In-Charge, and Admin roles are granted by administration.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-login-submit"
            >
              {loading ? 'Creating Account...' : (
                <>
                  <span>Register Student Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Demo Accounts Panel for Reviewers */}
        <div className="demo-accounts-box">
          <div className="demo-accounts-header">
            <span className="demo-accounts-title">
              <ShieldCheck size={16} className="text-maroon" /> Review Demo Accounts
            </span>
            <span className="demo-accounts-hint">Click to autofill email</span>
          </div>

          <div className="demo-accounts-grid">
            <button
              type="button"
              onClick={() => fillDemoEmail('student.demo@cb.students.amrita.edu')}
              className="demo-account-card"
            >
              <div className="demo-card-role text-emerald">
                <GraduationCap size={15} /> Student
              </div>
              <div className="demo-card-email">student.demo@cb.students.amrita.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoEmail('faculty.demo@cb.amrita.edu')}
              className="demo-account-card"
            >
              <div className="demo-card-role text-indigo">
                <BookOpen size={15} /> Faculty
              </div>
              <div className="demo-card-email">faculty.demo@cb.amrita.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoEmail('incharge.demo@cb.amrita.edu')}
              className="demo-account-card"
            >
              <div className="demo-card-role text-amber">
                <Wrench size={15} /> In-Charge
              </div>
              <div className="demo-card-email">incharge.demo@cb.amrita.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoEmail('admin.demo@cb.amrita.edu')}
              className="demo-account-card"
            >
              <div className="demo-card-role text-rose">
                <Lock size={15} /> Admin
              </div>
              <div className="demo-card-email">admin.demo@cb.amrita.edu</div>
            </button>
          </div>

          <p className="demo-accounts-footnote">
            Passwords are read securely from your <code>DEMO_PASSWORD</code> environment variable.
          </p>
        </div>

      </div>
    </div>
  );
}

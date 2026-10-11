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
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-amrita-maroon/10 border border-amrita-maroon/20 text-amrita-maroon mb-1">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Amrita Yukti Portal
          </h1>
          <p className="text-xs text-gray-500">
            Unified Campus Innovation & Space Radar • Coimbatore Campus
          </p>
        </div>

        {/* Tab Toggle: Login vs Signup */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMode === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-amrita-maroon" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMode === 'signup' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amrita-maroon" /> Student Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {signupSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{signupSuccess}</span>
          </div>
        )}

        {/* Sign In Form */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="card-amrita p-6 space-y-4 shadow-md">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                College Email Address
              </label>
              <input
                type="email"
                id="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cb.amrita.edu or @cb.students.amrita.edu"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-amrita-maroon focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700 uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-amrita-maroon focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-amrita py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating with Supabase...' : (
                <>Sign In to Campus Hub <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form (Public sign-up is strictly for Student accounts) */
          <form onSubmit={handleSignupSubmit} className="card-amrita p-6 space-y-3.5 shadow-md">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Adithya K."
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Amrita Student Email (@cb.students.amrita.edu)
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="rollno@cb.students.amrita.edu"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                value={signupRoll}
                onChange={(e) => setSignupRoll(e.target.value)}
                placeholder="CB.EN.U4AIE23045"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
                <select
                  value={signupDept}
                  onChange={(e) => setSignupDept(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white"
                >
                  <option value="CSE">CSE</option>
                  <option value="AI & DS">AI & DS</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Batch</label>
                <input
                  type="text"
                  value={signupBatch}
                  onChange={(e) => setSignupBatch(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Create Password</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-medium"
              />
            </div>

            <p className="text-[11px] text-gray-500 italic">
              ℹ️ Public registration creates Student Innovator accounts. Faculty, In-Charge, and Admin roles are granted by administration.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-amrita py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : (
                <>Register Student Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}

        {/* Demo Accounts Panel for Reviewers (NO hardcoded passwords in code!) */}
        <div className="card-amrita p-4 space-y-2.5 bg-gray-50/80 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amrita-maroon" /> Review Demo Accounts
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Click to autofill email</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoEmail('student.demo@cb.students.amrita.edu')}
              className="p-2 rounded-lg bg-white border border-gray-200 text-left hover:border-amrita-maroon transition shadow-2xs"
            >
              <div className="font-bold text-gray-900 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Student
              </div>
              <div className="text-[10px] text-gray-500 truncate">student.demo@cb.students.amrita.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoEmail('faculty.demo@cb.amrita.edu')}
              className="p-2 rounded-lg bg-white border border-gray-200 text-left hover:border-amrita-maroon transition shadow-2xs"
            >
              <div className="font-bold text-gray-900 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Faculty
              </div>
              <div className="text-[10px] text-gray-500 truncate">faculty.demo@cb.amrita.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoEmail('incharge.demo@cb.amrita.edu')}
              className="p-2 rounded-lg bg-white border border-gray-200 text-left hover:border-amrita-maroon transition shadow-2xs"
            >
              <div className="font-bold text-gray-900 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-amber-600" /> In-Charge
              </div>
              <div className="text-[10px] text-gray-500 truncate">incharge.demo@cb.amrita.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoEmail('admin.demo@cb.amrita.edu')}
              className="p-2 rounded-lg bg-white border border-gray-200 text-left hover:border-amrita-maroon transition shadow-2xs"
            >
              <div className="font-bold text-gray-900 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-rose-600" /> Admin
              </div>
              <div className="text-[10px] text-gray-500 truncate">admin.demo@cb.amrita.edu</div>
            </button>
          </div>

          <p className="text-[11px] text-gray-500 text-center pt-1 border-t border-gray-200/60">
            Passwords are read securely from your <code>DEMO_PASSWORD</code> environment variable.
          </p>
        </div>

      </div>
    </div>
  );
}

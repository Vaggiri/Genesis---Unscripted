import { getSupabase } from '../lib/supabase.js';

/**
 * Middleware: Requires a valid Supabase Auth JWT token in the Authorization header.
 * Attaches req.user, req.profile, and req.role to the request object.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabase();

  if (!supabase) {
    // If running in pure offline demo mode without Supabase connected:
    // Allow demo mock token for local testing if DEMO_OFFLINE=true
    if (process.env.DEMO_OFFLINE === 'true' && process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      req.user = { id: 'demo-user-id', email: 'demo@cb.amrita.edu' };
      const allowedDemo = ['student', 'faculty', 'lab_incharge', 'admin'];
      const demoRole = allowedDemo.includes(req.headers['x-demo-role']) ? req.headers['x-demo-role'] : 'student';
      req.profile = { id: req.user.id, full_name: 'Demo Admin', role: demoRole, preferred_language: 'en' };
      req.role = demoRole;
      return next();
    }
    return res.status(503).json({ error: 'Supabase service is not configured' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token' });
    }

    req.user = user;

    // Fetch user profile from public.profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.profile = profile || { id: user.id, role: 'student', full_name: user.email?.split('@')[0] || 'User' };
    req.role = req.profile.role || 'student';

    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Token validation failed' });
  }
}

/**
 * Middleware: Requires req.role to be one of the specified allowed roles.
 * Must be used AFTER requireAuth.
 * 
 * @param  {...string} roles Allowed roles, e.g. 'admin', 'faculty', 'lab_incharge'
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return res.status(401).json({ error: 'Unauthorized: Not authenticated' });
    }

    if (!roles.includes(req.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Current role: ${req.role}` 
      });
    }

    next();
  };
}

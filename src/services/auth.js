/**
 * src/services/auth.js
 * 
 * Thin wrapper around Supabase Auth.
 * Hardcoded passwords, local credential arrays, and role guessing from identifiers have been completely deleted.
 */

import { getSupabaseClient } from './supabaseClient.js';

const ALLOWED_EMAIL_DOMAINS = ['@cb.amrita.edu', '@cb.students.amrita.edu', '@amrita.edu'];

export function validateCollegeEmail(email) {
  if (!email || !email.includes('@')) return false;
  const lower = email.toLowerCase().trim();
  return ALLOWED_EMAIL_DOMAINS.some(domain => lower.endsWith(domain));
}

/**
 * Sign in using Supabase Auth.
 */
export async function signIn({ email, password }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please check your environment variables.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error) {
    throw error;
  }

  // Fetch role & profile from public.profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const role = profile?.role || 'student';

  return {
    user: data.user,
    session: data.session,
    profile: profile || { id: data.user.id, role, full_name: data.user.email.split('@')[0] },
    role
  };
}

/**
 * Sign up using Supabase Auth.
 * Default role is always 'student'. Roles like faculty or admin are only granted by administrators.
 */
export async function signUp({ email, password, fullName, rollNo, department, batch }) {
  if (!validateCollegeEmail(email)) {
    throw new Error('Sign-up is restricted to Amrita college emails (@cb.amrita.edu, @cb.students.amrita.edu).');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'student', // Strictly defaulted to student
        roll_no: rollNo || '',
        department: department || 'CSE',
        batch: batch || '2023-2027'
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out of current session.
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * Get active session and profile.
 */
export async function getCurrentUserSession() {
  const supabase = getSupabaseClient();
  if (!supabase) return { session: null, profile: null, role: null };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { session: null, profile: null, role: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const role = profile?.role || 'student';
  return {
    session,
    user: session.user,
    profile: profile || { id: session.user.id, role, full_name: session.user.email?.split('@')[0] || 'User' },
    role
  };
}

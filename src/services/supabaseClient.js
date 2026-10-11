import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables (with optional dev fallback)
export const getSupabaseConfig = () => {
  let devUrl = '';
  let devKey = '';
  if (import.meta.env.DEV) {
    devUrl = localStorage.getItem('amrita_yukti_supabase_url') || '';
    devKey = localStorage.getItem('amrita_yukti_supabase_key') || '';
  }

  const url = devUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = devKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return { url, key, isCustom: Boolean(devUrl && devKey) };
};

export const saveSupabaseConfig = (url, key) => {
  if (import.meta.env.DEV) {
    if (url && key) {
      localStorage.setItem('amrita_yukti_supabase_url', url.trim());
      localStorage.setItem('amrita_yukti_supabase_key', key.trim());
    } else {
      localStorage.removeItem('amrita_yukti_supabase_url');
      localStorage.removeItem('amrita_yukti_supabase_key');
    }
  }
};

let clientInstance = null;

export const getSupabaseClient = () => {
  if (clientInstance) return clientInstance;

  const { url, key } = getSupabaseConfig();
  if (url && key && !url.includes('YOUR-PROJECT')) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return clientInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
};

export const testSupabaseConnection = async (url, key) => {
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('classrooms').select('id').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase Cloud Database successfully!' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

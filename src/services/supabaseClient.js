import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from localStorage or environment variables
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('campussync_supabase_url');
  const localKey = localStorage.getItem('campussync_supabase_key');

  const url = localUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return { url, key, isCustom: Boolean(localUrl && localKey) };
};

export const saveSupabaseConfig = (url, key) => {
  if (url && key) {
    localStorage.setItem('campussync_supabase_url', url.trim());
    localStorage.setItem('campussync_supabase_key', key.trim());
  } else {
    localStorage.removeItem('campussync_supabase_url');
    localStorage.removeItem('campussync_supabase_key');
  }
};

let clientInstance = null;

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      clientInstance = createClient(url, key);
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
    const { data, error } = await testClient.from('classrooms').select('id').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase Cloud Database successfully!' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR-PROJECT')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✅ Supabase server client initialized at:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Supabase server initialization failed:', err.message);
  }
} else {
  console.log('ℹ️ Running in resilient fallback/demo mode. Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY to connect cloud database.');
}

export function getSupabase() {
  return supabase;
}

export function isSupabaseConfigured() {
  return Boolean(supabase);
}

/**
 * Audit log helper: Writes directly to Supabase audit_log table.
 */
export async function logAudit({ actor_id = null, action, entity, entity_id = null, meta = {} }) {
  if (!supabase) return;
  try {
    await supabase.from('audit_log').insert({
      actor_id,
      action,
      entity,
      entity_id,
      meta,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Audit logging failed:', err.message);
  }
}

import express from 'express';
import { getSupabase } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { computeUtilization } from '../lib/analyticsCalc.js';

const router = express.Router();

// Staff-only: aggregate figures computed from real bookings (no PII returned).
router.get('/utilization', requireAuth, requireRole('faculty', 'lab_incharge', 'admin'), async (req, res) => {
  const supabase = getSupabase();
  const toMs = req.query.to && !Number.isNaN(Date.parse(req.query.to)) ? Date.parse(req.query.to) : Date.now();
  const fromMs = req.query.from && !Number.isNaN(Date.parse(req.query.from))
    ? Date.parse(req.query.from) : toMs - 30 * 86400000;

  if (!supabase) {
    return res.json(computeUtilization({ bookings: [], resources: [], fromMs, toMs }));
  }

  const [bRes, rRes] = await Promise.all([
    supabase.from('facility_bookings')
      .select('resource_id, start_ts, end_ts, status, created_at, resources:resource_id(name, kind)')
      .gte('start_ts', new Date(fromMs).toISOString())
      .lte('start_ts', new Date(toMs).toISOString())
      .limit(5000),
    supabase.from('resources').select('id, kind, status')
  ]);

  if (bRes.error || rRes.error) return res.status(500).json({ error: 'Could not compute analytics' });
  res.json(computeUtilization({ bookings: bRes.data || [], resources: rRes.data || [], fromMs, toMs }));
});

export default router;

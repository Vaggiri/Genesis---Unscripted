import express from 'express';
import { z } from 'zod';
import { getSupabase, logAudit } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { findEarliestSlot } from '../lib/scheduler.js';
import { IST_OFFSET_MIN, istDayBounds, istNow } from '../lib/time.js';

const router = express.Router();

/**
 * Lazy evaluation: Auto-release expired approved bookings with no check-in after 15 mins.
 */
async function autoReleaseNoShows(supabase) {
  if (!supabase) return;
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    await supabase
      .from('facility_bookings')
      .update({ status: 'no_show' })
      .eq('status', 'approved')
      .is('checked_in_at', null)
      .lt('start_ts', fifteenMinsAgo);
  } catch (err) {
    console.warn('Lazy no-show update warning:', err.message);
  }
}

// 1. GET /api/resources?lab=
router.get('/resources', async (req, res) => {
  const { lab } = req.query;
  const supabase = getSupabase();

  if (supabase) {
    let query = supabase.from('resources').select('*, labs(name, block, floor)');
    if (lab) query = query.eq('lab_id', lab);
    const { data, error } = await query;
    if (!error && data) return res.json(data);
  }

  // Fallback demo resources
  const mockResources = [
    { id: 'res-3d-bambu-x1', lab_id: 'lab-fablab', name: 'Bambu Lab X1-Carbon Combo', kind: 'printer_3d', status: 'ok', requires_cert: false },
    { id: 'res-3d-prusa-mk4', lab_id: 'lab-fablab', name: 'Prusa MK4 CoreXY', kind: 'printer_3d', status: 'ok', requires_cert: false },
    { id: 'res-ws-rtx4090-01', lab_id: 'lab-ai-hpc', name: 'Dell Precision RTX 4090 #1', kind: 'workstation', status: 'ok', requires_cert: false },
    { id: 'res-pcb-voltera-v2', lab_id: 'lab-pcb-eda', name: 'Voltera V-One PCB Printer', kind: 'pcb_mill', status: 'ok', requires_cert: false }
  ];
  res.json(lab ? mockResources.filter(r => r.lab_id === lab) : mockResources);
});

// 2. GET /api/availability?resourceId=&date=YYYY-MM-DD (IST day) — authenticated; no user data returned
router.get('/availability', requireAuth, async (req, res) => {
  const { resourceId } = req.query;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : istNow().dateStr;
  const bounds = istDayBounds(date);
  const supabase = getSupabase();
  await autoReleaseNoShows(supabase);

  if (supabase && resourceId && bounds) {
    const { data, error } = await supabase
      .from('facility_bookings')
      .select('id, resource_id, start_ts, end_ts, status')
      .eq('resource_id', resourceId)
      .in('status', ['pending', 'approved'])
      .lt('start_ts', bounds.end)
      .gt('end_ts', bounds.start);

    if (!error) {
      return res.json({ resourceId, date, bookings: data || [] });
    }
  }

  res.json({ resourceId: resourceId || 'all', date, bookings: [] });
});

// 3. POST /api/bookings/suggest (Runs Earliest-Available Algorithm)
const suggestSchema = z.object({
  resourceId: z.string().optional(),
  labId: z.string().optional(),
  kind: z.string().optional(),
  durationMin: z.number().int().positive().max(480).default(60),
  notBefore: z.string().optional()
});

router.post('/bookings/suggest', requireAuth, async (req, res) => {
  const parsed = suggestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid parameters', details: parsed.error.issues });
  }

  const { resourceId, labId, kind, durationMin, notBefore } = parsed.data;
  const supabase = getSupabase();
  await autoReleaseNoShows(supabase);

  let candidates = [];
  let existingBookings = [];

  if (supabase) {
    let q = supabase.from('resources').select('*').eq('status', 'ok');
    if (resourceId) q = q.eq('id', resourceId);
    if (labId) q = q.eq('lab_id', labId);
    if (kind) q = q.eq('kind', kind);

    const [candRes, bookRes] = await Promise.all([
      q,
      supabase.from('facility_bookings').select('*').in('status', ['pending', 'approved'])
    ]);

    candidates = candRes.data || [];
    existingBookings = bookRes.data || [];
  } else {
    candidates = [
      { id: 'res-3d-bambu-x1', name: 'Bambu Lab X1-Carbon', kind: 'printer_3d', status: 'ok' },
      { id: 'res-3d-prusa-mk4', name: 'Prusa MK4 CoreXY', kind: 'printer_3d', status: 'ok' }
    ];
  }

  const result = findEarliestSlot({
    candidates,
    durationMin,
    notBefore: notBefore && !Number.isNaN(new Date(notBefore).getTime()) ? new Date(notBefore) : new Date(),
    existingBookings,
    tzOffsetMin: IST_OFFSET_MIN
  });

  res.json({ success: true, ...result });
});

// 4. POST /api/bookings (Create booking with exclusion conflict check)
const bookingCreateSchema = z.object({
  resource_id: z.string().min(1),
  start_ts: z.string().datetime(),
  end_ts: z.string().datetime(),
  purpose: z.string().max(500).optional(),
  job_id: z.string().optional()
});

router.post('/bookings', requireAuth, async (req, res) => {
  const parsed = bookingCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  const { resource_id, start_ts, end_ts, purpose = '', job_id = null } = parsed.data;
  const userId = req.user.id;
  const supabase = getSupabase();

  const startMs = new Date(start_ts).getTime();
  const endMs = new Date(end_ts).getTime();
  if (!(endMs > startMs)) return res.status(400).json({ error: 'end_ts must be after start_ts' });
  if (endMs - startMs > 8 * 3600 * 1000) return res.status(400).json({ error: 'A booking cannot exceed 8 hours' });
  if (startMs < Date.now() - 5 * 60 * 1000) return res.status(400).json({ error: 'Cannot book a slot in the past' });
  if (startMs > Date.now() + 30 * 24 * 3600 * 1000) return res.status(400).json({ error: 'Bookings open only 30 days ahead' });

  if (supabase) {
    const { data: resource } = await supabase.from('resources').select('id, kind, status, requires_cert').eq('id', resource_id).single();
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    if (resource.status !== 'ok') return res.status(409).json({ error: 'resource_unavailable', message: 'This machine is under maintenance.' });
    if (resource.requires_cert && req.role === 'student') {
      const { data: cert } = await supabase.from('certifications').select('id').eq('user_id', userId).eq('resource_kind', resource.kind).maybeSingle();
      if (!cert) return res.status(403).json({ error: 'certification_required', message: 'Safety certification is required for this machine.' });
    }
    // Per-user cap on open bookings (anti-hoarding)
    const { count } = await supabase.from('facility_bookings').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).in('status', ['pending', 'approved']).gte('end_ts', new Date().toISOString());
    if ((count || 0) >= 5) return res.status(429).json({ error: 'booking_limit', message: 'You already have 5 active bookings.' });
  }

  const newBooking = {
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    resource_id,
    user_id: userId,
    job_id,
    start_ts,
    end_ts,
    status: 'pending',
    purpose,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('facility_bookings')
      .insert(newBooking)
      .select('*, resources(name, kind, lab_id)')
      .single();

    if (error) {
      // Postgres error 23P01 (exclusion violation) or 23505 (unique violation)
      if (error.code === '23P01' || error.code === '23505' || error.message?.includes('overlap')) {
        // Calculate dynamic alternatives
        const { data: candData } = await supabase.from('resources').select('*').eq('status', 'ok');
        const { data: allBookings } = await supabase.from('facility_bookings').select('*').in('status', ['pending', 'approved']);
        
        const alt = findEarliestSlot({
          candidates: candData || [],
          durationMin: Math.round((new Date(end_ts).getTime() - new Date(start_ts).getTime()) / (60 * 1000)),
          notBefore: new Date(end_ts),
          existingBookings: allBookings || [],
          tzOffsetMin: IST_OFFSET_MIN
        });

        return res.status(409).json({
          error: 'slot_taken',
          message: 'The requested slot conflicts with an existing booking.',
          alternatives: [alt.best, ...(alt.alternatives || [])].filter(Boolean)
        });
      }

      return res.status(400).json({ error: error.message });
    }

    await logAudit({
      actor_id: userId,
      action: 'BOOKING_CREATED',
      entity: 'facility_bookings',
      entity_id: newBooking.id,
      meta: { resource_id, start_ts, end_ts }
    });

    return res.status(201).json({ success: true, booking: data });
  }

  // Offline mock fallback
  res.status(201).json({ success: true, booking: newBooking });
});

// 5. PATCH /api/bookings/:id (approve / reject / cancel / complete)
const updateStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'cancelled', 'completed', 'no_show'])
});

// Allowed state transitions
const TRANSITIONS = {
  approved: ['pending'],
  rejected: ['pending'],
  cancelled: ['pending', 'approved'],
  completed: ['approved'],
  no_show: ['approved']
};

router.patch('/bookings/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid status', details: parsed.error.issues });
  }

  const { status } = parsed.data;
  const supabase = getSupabase();
  if (!supabase) return res.json({ success: true, booking: { id, status } });

  const { data: existing } = await supabase
    .from('facility_bookings')
    .select('id, user_id, status, resources:resource_id(lab_id, labs(incharge_id))')
    .eq('id', id)
    .single();
  if (!existing) return res.status(404).json({ error: 'Booking not found' });

  const isOwner = existing.user_id === req.user.id;
  const isStaff = ['faculty', 'lab_incharge', 'admin'].includes(req.role);

  if (status === 'cancelled') {
    if (!isOwner && !isStaff) return res.status(403).json({ error: 'Not allowed to cancel this booking' });
  } else {
    if (!isStaff) return res.status(403).json({ error: 'Insufficient permissions to update booking state' });
    const inchargeId = existing.resources?.labs?.incharge_id;
    if (req.role === 'lab_incharge' && inchargeId && inchargeId !== req.user.id) {
      return res.status(403).json({ error: 'You are not the in-charge of this lab' });
    }
    if (existing.user_id === req.user.id && req.role !== 'admin') {
      return res.status(403).json({ error: 'You cannot approve your own booking' });
    }
  }

  if (!TRANSITIONS[status].includes(existing.status)) {
    return res.status(409).json({ error: `Cannot change a ${existing.status} booking to ${status}` });
  }

  // Conditional update guards against double-approval races
  const { data, error } = await supabase
    .from('facility_bookings')
    .update({ status })
    .eq('id', id)
    .eq('status', existing.status)
    .select('*')
    .single();

  if (error || !data) return res.status(409).json({ error: 'Booking was modified by someone else. Refresh and retry.' });

  await logAudit({
    actor_id: req.user.id,
    action: `BOOKING_${status.toUpperCase()}`,
    entity: 'facility_bookings',
    entity_id: id,
    meta: { from: existing.status, to: status }
  });

  return res.json({ success: true, booking: data });
});

// 6. POST /api/bookings/:id/checkin (owner only, approved, near start time)
router.post('/bookings/:id/checkin', requireAuth, async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();
  if (!supabase) return res.json({ success: true, message: 'Check-in simulated' });

  const { data: b } = await supabase.from('facility_bookings').select('*').eq('id', id).single();
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (b.user_id !== req.user.id) return res.status(403).json({ error: 'Only the booking owner can check in' });
  if (b.status !== 'approved') return res.status(409).json({ error: 'Only approved bookings can be checked in' });

  const now = Date.now();
  if (now < new Date(b.start_ts).getTime() - 10 * 60 * 1000 || now > new Date(b.end_ts).getTime()) {
    return res.status(409).json({ error: 'Check-in opens 10 minutes before the slot and closes at its end' });
  }

  const { data, error } = await supabase
    .from('facility_bookings')
    .update({ checked_in_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: 'Check-in failed' });
  return res.json({ success: true, message: 'Checked in successfully', booking: data });
});

// 7. Booking list for the UI. Students see only their own; staff see all.
router.get('/innovation/bookings', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.json({ success: true, bookings: [] });

  const isStaff = ['faculty', 'lab_incharge', 'admin'].includes(req.role);
  let q = supabase
    .from('facility_bookings')
    .select('*, profiles:user_id(full_name, roll_no), resources:resource_id(name, lab_id, labs(name, incharge_id))')
    .order('created_at', { ascending: false })
    .limit(200);
  if (!isStaff) q = q.eq('user_id', req.user.id);

  const { data, error } = await q;
  if (error) return res.status(400).json({ error: 'Could not load bookings' });

  const fmt = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const bookings = (data || [])
    .filter(b => req.role !== 'lab_incharge' || !b.resources?.labs?.incharge_id || b.resources.labs.incharge_id === req.user.id)
    .map(b => ({
      id: b.id,
      user_id: b.user_id,
      studentName: b.profiles?.full_name || '',
      studentRoll: isStaff ? (b.profiles?.roll_no || '') : '',
      labId: b.resources?.lab_id || '',
      labName: b.resources?.labs?.name || '',
      projectTitle: b.purpose || '',
      projectType: b.resources?.name || '',
      requirements: b.resources?.name || '',
      slotTime: `${fmt(b.start_ts)} - ${fmt(b.end_ts)}`,
      start_ts: b.start_ts,
      end_ts: b.end_ts,
      status: b.status,
      checkedIn: Boolean(b.checked_in_at),
      submittedAt: new Date(b.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
    }));
  return res.json({ success: true, bookings });
});

export default router;

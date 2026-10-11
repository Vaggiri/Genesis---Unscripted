import express from 'express';
import { z } from 'zod';
import { getSupabase, logAudit } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { findEarliestSlot } from '../lib/scheduler.js';

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

// 2. GET /api/availability?resourceId=&date=
router.get('/availability', async (req, res) => {
  const { resourceId, date } = req.query;
  const supabase = getSupabase();
  await autoReleaseNoShows(supabase);

  if (supabase && resourceId) {
    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('facility_bookings')
      .select('id, resource_id, start_ts, end_ts, status')
      .eq('resource_id', resourceId)
      .in('status', ['pending', 'approved'])
      .gte('start_ts', dayStart.toISOString())
      .lte('end_ts', dayEnd.toISOString());

    if (!error) {
      return res.json({ resourceId, date: dayStart.toISOString().split('T')[0], bookings: data || [] });
    }
  }

  res.json({ resourceId: resourceId || 'all', bookings: [] });
});

// 3. POST /api/bookings/suggest (Runs Earliest-Available Algorithm)
const suggestSchema = z.object({
  resourceId: z.string().optional(),
  labId: z.string().optional(),
  kind: z.string().optional(),
  durationMin: z.number().int().positive().default(60),
  notBefore: z.string().optional()
});

router.post('/bookings/suggest', async (req, res) => {
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
    notBefore: notBefore ? new Date(notBefore) : new Date(),
    existingBookings
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
          existingBookings: allBookings || []
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

// 5. PATCH /api/bookings/:id (Approve, reject, cancel)
const updateStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled', 'completed', 'no_show'])
});

router.patch('/bookings/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid status', details: parsed.error.issues });
  }

  const { status } = parsed.data;
  const supabase = getSupabase();

  if (supabase) {
    // If student cancelling, must be owner
    if (status === 'cancelled' && req.role === 'student') {
      const { data, error } = await supabase
        .from('facility_bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error || !data) return res.status(403).json({ error: 'Cannot cancel booking or not owner' });
      return res.json({ success: true, booking: data });
    }

    // Approving or rejecting requires faculty, lab_incharge, or admin
    if (['approved', 'rejected', 'completed', 'no_show'].includes(status)) {
      if (!['faculty', 'lab_incharge', 'admin'].includes(req.role)) {
        return res.status(403).json({ error: 'Insufficient permissions to update booking state' });
      }

      const { data, error } = await supabase
        .from('facility_bookings')
        .update({ status })
        .eq('id', id)
        .select('*, profiles:user_id(full_name, email)')
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAudit({
        actor_id: req.user.id,
        action: `BOOKING_${status.toUpperCase()}`,
        entity: 'facility_bookings',
        entity_id: id,
        meta: { new_status: status }
      });

      return res.json({ success: true, booking: data });
    }
  }

  res.json({ success: true, booking: { id, status } });
});

// 6. POST /api/bookings/:id/checkin
router.post('/bookings/:id/checkin', requireAuth, async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('facility_bookings')
      .update({ checked_in_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, message: 'Checked in successfully', booking: data });
  }

  res.json({ success: true, message: 'Check-in simulated' });
});

// 7. Backward compatible innovation routes for existing components
router.get('/innovation/bookings', async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from('facility_bookings')
      .select('*, profiles:user_id(full_name, roll_no), resources:resource_id(name, lab_id, labs(name))')
      .order('created_at', { ascending: false });

    if (data) {
      const mapped = data.map(b => ({
        id: b.id,
        studentName: b.profiles?.full_name || 'Student Innovator',
        studentRoll: b.profiles?.roll_no || 'CB.EN.U4AIE23045',
        labId: b.resources?.lab_id || 'lab-fablab',
        labName: b.resources?.labs?.name || 'Central Innovation Hub',
        projectTitle: b.purpose || 'Laboratory Research & Fabrication',
        projectType: b.resources?.name || 'Workstation',
        requirements: b.resources?.name || 'Standard Equipment',
        slotTime: `${new Date(b.start_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.end_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: b.status,
        submittedAt: new Date(b.created_at).toLocaleDateString(),
        facultyAssigned: 'Dr. K. Swaminathan (AMR-FAC-209)'
      }));
      return res.json({ success: true, bookings: mapped });
    }
  }

  res.json({ success: true, bookings: [] });
});

export default router;

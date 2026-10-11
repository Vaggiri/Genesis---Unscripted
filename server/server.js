import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { getSupabase } from './lib/supabase.js';
import { computeRoomStatus } from './lib/roomStatus.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import { corsMiddleware, helmetMiddleware, standardLimiter } from './middleware/security.js';

// Route modules
import bookingsRouter from './routes/bookings.js';
import inventoryRouter from './routes/inventory.js';
import jobsRouter from './routes/jobs.js';
import roomsRouter from './routes/rooms.js';
import chatRouter from './routes/chat.js';
import analyticsRouter from './routes/analytics.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(standardLimiter);

// -----------------------------------------------------------------------------
// CORE ROUTER (Classroom Occupancy, Timetables, Reports, Settings & CMS)
// -----------------------------------------------------------------------------
const router = express.Router();

// 1. Health Endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase_configured: Boolean(getSupabase())
  });
});

// 2. Settings (Read public, Write admin-only)
router.get('/settings', async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from('portal_settings').select('*').single();
    if (!error && data) return res.json(data);
  }
  res.json({
    id: 'campus_config',
    campus_name: 'Amrita Vishwa Vidyapeetham — Coimbatore',
    active_semester: 'Even Semester 2026',
    flag_threshold: 2,
    banner_message: '📢 Real-time Classroom & Lab Occupancy live. Submit reports for unannounced room takeovers.',
    banner_active: true,
    allow_student_reporting: true
  });
});

router.put('/settings', requireAuth, requireRole('admin'), async (req, res) => {
  const supabase = getSupabase();
  const updates = { ...req.body, updated_at: new Date().toISOString() };
  if (supabase) {
    const { data, error } = await supabase.from('portal_settings').upsert(updates).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, settings: data });
  }
  res.json({ success: true, settings: updates });
});

// 3. Dynamic Portal Pages (Admin CMS)
router.get('/pages', async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from('portal_pages').select('*').order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return res.json(data);
  }
  res.json([
    { slug: 'classroom-occupancy', title: 'Classroom & Lab Occupancy Locator', subtitle: 'Live timetable cross-indexing', badge: 'Live Space Matrix', icon_name: 'Compass', is_enabled: true, display_order: 1 },
    { slug: 'facility-booking', title: 'Innovation Facility & Lab Slot Booking', subtitle: 'Conversational machine matching', badge: 'AI Allocation', icon_name: 'Cpu', is_enabled: true, display_order: 2 },
    { slug: 'fablab-desk', title: 'AI FabLab Intake Desk', subtitle: '3D printing & PCB CNC work orders', badge: 'AI Service Desk', icon_name: 'Cpu', is_enabled: true, display_order: 3 },
    { slug: 'admin-portal', title: 'Amrita Yukti Administrative Console', subtitle: 'Central access control and audit logging', badge: 'Admin Console', icon_name: 'Sliders', is_enabled: true, display_order: 4 }
  ]);
});

router.put('/pages/:slug', requireAuth, requireRole('admin'), async (req, res) => {
  const { slug } = req.params;
  const supabase = getSupabase();
  const updates = { ...req.body, slug, updated_at: new Date().toISOString() };
  if (supabase) {
    const { data, error } = await supabase.from('portal_pages').upsert(updates).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, page: data });
  }
  res.json({ success: true, page: updates });
});

// 4. Classrooms with Live Occupancy Calculation (Reads Supabase)
router.get('/classrooms', async (req, res) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const day = req.query.day || days[now.getDay()] || 'Monday';
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = req.query.time || `${hours}:${minutes}`;

  const supabase = getSupabase();
  let classroomsList = [];
  let timetablesList = [];
  let reportsList = [];
  let roomBookingsList = [];

  if (supabase) {
    try {
      const [roomsRes, ttRes, repRes, rbRes] = await Promise.all([
        supabase.from('classrooms').select('*').order('id'),
        supabase.from('timetables').select('*'),
        supabase.from('occupancy_reports').select('*').eq('status', 'active'),
        supabase.from('room_bookings').select('*').eq('booking_date', now.toISOString().split('T')[0])
      ]);

      classroomsList = roomsRes.data || [];
      timetablesList = ttRes.data || [];
      reportsList = repRes.data || [];
      roomBookingsList = rbRes.data || [];
    } catch (e) {
      console.warn('Supabase fetch failed:', e.message);
    }
  }

  // Enrich each classroom with occupancy calculations
  const enrichedClassrooms = classroomsList.map(room => 
    computeRoomStatus(room, day, timeStr, reportsList, timetablesList, roomBookingsList)
  );

  res.json({
    simulated_context: { day, time: timeStr },
    classrooms: enrichedClassrooms
  });
});

// 5. Timetables (Reads Supabase directly, fixing §2.3 item 6)
router.get('/timetables', async (req, res) => {
  const { roomId } = req.query;
  const supabase = getSupabase();

  if (supabase) {
    let q = supabase.from('timetables').select('*');
    if (roomId) q = q.eq('room_id', roomId);
    const { data } = await q;
    if (data) return res.json(data);
  }

  res.json([]);
});

// 6. Crowdsourced Occupancy Reports (Reads and writes Supabase directly)
router.get('/reports', async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.from('occupancy_reports').select('*').order('created_at', { ascending: false });
    if (data) return res.json(data);
  }
  res.json([]);
});

router.post('/reports', requireAuth, async (req, res) => {
  const {
    room_id,
    report_type = 'unscheduled_occupancy',
    reported_batch = 'Unspecified Batch',
    reported_department = 'General',
    is_lab_class = false,
    purpose = 'Occupied without timetable schedule',
    occupancy_level = 'Full'
  } = req.body;

  if (!room_id) {
    return res.status(400).json({ error: 'room_id is required' });
  }

  const supabase = getSupabase();
  const newReport = {
    room_id,
    report_type,
    reported_batch,
    reported_department,
    is_lab_class: Boolean(is_lab_class),
    purpose,
    occupancy_level,
    reporter_id: req.user.id,
    reporter_name: req.profile?.full_name || 'Anonymous Student',
    reporter_roll_no: req.profile?.roll_no || '',
    reporter_role: req.role,
    status: 'active',
    created_at: new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase.from('occupancy_reports').insert(newReport).select().single();
    if (error) return res.status(400).json({ error: error.message });

    // Check auto-flagging threshold
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentReports } = await supabase
      .from('occupancy_reports')
      .select('id')
      .eq('room_id', room_id)
      .eq('status', 'active')
      .gte('created_at', oneWeekAgo);

    const count = recentReports ? recentReports.length : 1;
    let newlyFlagged = false;

    if (count >= 2) {
      await supabase.from('classrooms').update({
        is_flagged: true,
        flag_reason: `Reported occupied ${count} times this week without timetable schedule.`,
        flag_count: count,
        flagged_batch: reported_batch,
        flagged_department: reported_department,
        flagged_purpose: purpose,
        last_flagged_at: new Date().toISOString()
      }).eq('id', room_id);
      newlyFlagged = true;
    }

    return res.status(201).json({
      success: true,
      report: data,
      total_active_reports: count,
      is_permanently_flagged: newlyFlagged
    });
  }

  res.status(201).json({ success: true, report: newReport });
});

// Mount Submodules on Core Router
router.use('/', bookingsRouter);
router.use('/inventory', inventoryRouter);
router.use('/jobs', jobsRouter);
router.use('/rooms', roomsRouter);
router.use('/room-bookings', roomsRouter);
router.use('/chat', chatRouter);
router.use('/ai/chat', chatRouter); // Backwards compatibility for old chat frontend calls
router.use('/analytics', analyticsRouter);
router.use('/admin', adminRouter);

// Mount router on BOTH '/api' AND '/' for Vercel and local Vite dev proxy
app.use('/api', router);
app.use('/', router);

// Direct execution listener
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectExecution || (!process.env.VERCEL && process.env.NODE_ENV !== 'production')) {
  app.listen(PORT, () => {
    console.log(`🚀 Amrita Yukti backend server active on port ${PORT}`);
  });
}

export default app;

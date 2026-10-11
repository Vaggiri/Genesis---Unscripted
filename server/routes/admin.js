import express from 'express';
import { z } from 'zod';
import { getSupabase, logAudit } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Require admin role for all routes in this router
router.use(requireAuth, requireRole('admin'));

// 1. Classroom Management
router.post('/classrooms', async (req, res) => {
  const { id, room_number, block, floor = 1, capacity = 60, room_type = 'lecture_hall', amenities = [] } = req.body;
  const roomId = id || `${block.replace(/[^A-Za-z0-9]/g, '')}-${room_number}`;
  const supabase = getSupabase();

  const newRoom = {
    id: roomId,
    room_number,
    block,
    floor: Number(floor),
    capacity: Number(capacity),
    room_type,
    amenities,
    is_flagged: false,
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase.from('classrooms').upsert(newRoom).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAudit({
      actor_id: req.user.id,
      action: 'ADMIN_UPSERT_CLASSROOM',
      entity: 'classrooms',
      entity_id: roomId
    });

    return res.json({ success: true, classroom: data });
  }

  res.json({ success: true, classroom: newRoom });
});

router.delete('/classrooms/:id', async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase.from('classrooms').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    await logAudit({
      actor_id: req.user.id,
      action: 'ADMIN_DELETE_CLASSROOM',
      entity: 'classrooms',
      entity_id: id
    });

    return res.json({ success: true, deletedId: id });
  }

  res.json({ success: true, deletedId: id });
});

router.post('/classrooms/:id/unflag', async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  if (supabase) {
    await supabase.from('classrooms').update({
      is_flagged: false,
      flag_reason: null,
      flag_count: 0,
      flagged_batch: null,
      flagged_department: null,
      flagged_purpose: null,
      last_flagged_at: null
    }).eq('id', id);

    await supabase.from('occupancy_reports').update({ status: 'resolved' }).eq('room_id', id);

    await logAudit({
      actor_id: req.user.id,
      action: 'ADMIN_UNFLAG_CLASSROOM',
      entity: 'classrooms',
      entity_id: id
    });

    return res.json({ success: true, message: `Room ${id} unflagged successfully.` });
  }

  res.json({ success: true, message: `Room ${id} unflagged.` });
});

// 2. Timetable Management & CSV Bulk Import (§7.1)
router.post('/timetables', async (req, res) => {
  const supabase = getSupabase();
  const entry = {
    room_id: req.body.room_id,
    day_of_week: req.body.day_of_week || 'Monday',
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    slot_number: Number(req.body.slot_number) || 1,
    subject_name: req.body.subject_name,
    subject_code: req.body.subject_code || '',
    department: req.body.department,
    batch: req.body.batch,
    is_lab: Boolean(req.body.is_lab),
    faculty_name: req.body.faculty_name || 'Faculty In-Charge'
  };

  if (supabase) {
    const { data, error } = await supabase.from('timetables').insert(entry).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, timetable: data });
  }

  res.json({ success: true, timetable: entry });
});

router.delete('/timetables/:id', async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase.from('timetables').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, deletedId: id });
  }

  res.json({ success: true, deletedId: id });
});

router.post('/timetables/import', async (req, res) => {
  const { entries } = req.body; // array of rows from CSV
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Timetable entries array required' });
  }

  const supabase = getSupabase();
  if (supabase) {
    const formatted = entries.map(e => ({
      room_id: e.room_id || e.room,
      day_of_week: e.day_of_week || e.day || 'Monday',
      start_time: e.start_time || e.start,
      end_time: e.end_time || e.end,
      slot_number: Number(e.slot_number || e.slot || 1),
      subject_name: e.subject_name || e.subject,
      subject_code: e.subject_code || '',
      department: e.department || 'CSE',
      batch: e.batch || 'General',
      is_lab: Boolean(e.is_lab),
      faculty_name: e.faculty_name || e.faculty || 'Faculty In-Charge'
    }));

    const { data, error } = await supabase.from('timetables').insert(formatted).select();
    if (error) return res.status(400).json({ error: error.message });

    await logAudit({
      actor_id: req.user.id,
      action: 'ADMIN_IMPORT_TIMETABLES',
      entity: 'timetables',
      meta: { count: entries.length }
    });

    return res.json({ success: true, count: data.length });
  }

  res.json({ success: true, count: entries.length });
});

// 3. Crowdsourced Report Moderation
router.post('/reports/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { action = 'resolve' } = req.body;
  const status = action === 'dismiss' ? 'dismissed' : 'resolved';
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('occupancy_reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await logAudit({
      actor_id: req.user.id,
      action: `ADMIN_${status.toUpperCase()}_REPORT`,
      entity: 'occupancy_reports',
      entity_id: id
    });

    return res.json({ success: true, report: data });
  }

  res.json({ success: true, status });
});

// 4. Users & Roles Management
router.get('/users', async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) return res.json(data);
  }
  res.json([]);
});

router.patch('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['student', 'faculty', 'lab_incharge', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await logAudit({
      actor_id: req.user.id,
      action: 'ADMIN_UPDATE_USER_ROLE',
      entity: 'profiles',
      entity_id: id,
      meta: { new_role: role }
    });

    return res.json({ success: true, profile: data });
  }

  res.json({ success: true, id, role });
});

// 5. Audit Log Viewer (§8.2)
router.get('/audit-log', async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*, profiles:actor_id(full_name, role)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) return res.json(data);
  }
  res.json([]);
});

export default router;

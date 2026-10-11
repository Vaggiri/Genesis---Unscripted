import express from 'express';
import { z } from 'zod';
import { getSupabase, logAudit } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { inspectStlBuffer, inspectGerberZipBuffer } from '../lib/fileRouter.js';

const router = express.Router();

// 1. GET /api/jobs (User sees own jobs, staff sees all for their lab)
router.get('/', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    let query = supabase.from('jobs').select('*, profiles:user_id(full_name, roll_no), labs(name)');
    if (req.role === 'student') {
      query = query.eq('user_id', req.user.id);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) return res.json(data);
  }

  // Fallback
  res.json([]);
});

// 2. POST /api/jobs (Submit job)
const createJobSchema = z.object({
  kind: z.enum(['print_3d', 'pcb', 'laser', 'other']),
  title: z.string().min(1).max(200),
  file_path: z.string().optional(),
  file_name: z.string().min(1),
  file_ext: z.string().min(1),
  detected_by: z.string().optional(),
  est_minutes: z.number().int().positive().default(60),
  est_material_g: z.number().nonnegative().default(0),
  params: z.record(z.string(), z.any()).optional().default({}),
  lab_id: z.string().optional()
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  const jobData = parsed.data;
  const supabase = getSupabase();
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  const newJob = {
    id: jobId,
    user_id: req.user.id,
    kind: jobData.kind,
    title: jobData.title,
    file_path: jobData.file_path || '',
    file_name: jobData.file_name,
    file_ext: jobData.file_ext,
    detected_by: jobData.detected_by || 'auto',
    est_minutes: jobData.est_minutes,
    est_material_g: jobData.est_material_g,
    params: jobData.params,
    status: 'submitted',
    lab_id: jobData.lab_id || (jobData.kind === 'print_3d' ? 'lab-fablab' : 'lab-pcb-eda'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase.from('jobs').insert(newJob).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAudit({
      actor_id: req.user.id,
      action: 'JOB_SUBMITTED',
      entity: 'jobs',
      entity_id: jobId,
      meta: { kind: jobData.kind, title: jobData.title, est_minutes: jobData.est_minutes }
    });

    return res.status(201).json({ success: true, job: data });
  }

  res.status(201).json({ success: true, job: newJob });
});

// 3. PATCH /api/jobs/:id (Staff update status & duration)
router.patch('/:id', requireAuth, requireRole('faculty', 'lab_incharge', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { status, est_minutes, lab_id } = req.body;
  const supabase = getSupabase();

  const updates = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (est_minutes !== undefined) updates.est_minutes = Number(est_minutes);
  if (lab_id) updates.lab_id = lab_id;

  if (supabase) {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await logAudit({
      actor_id: req.user.id,
      action: 'JOB_UPDATED',
      entity: 'jobs',
      entity_id: id,
      meta: updates
    });

    return res.json({ success: true, job: data });
  }

  res.json({ success: true, job: { id, ...updates } });
});

// 4. POST /api/jobs/verify-content (Magic bytes server verification)
router.post('/verify-content', async (req, res) => {
  const { kind, base64Header } = req.body;
  if (!base64Header) {
    return res.status(400).json({ error: 'base64Header is required for content inspection' });
  }

  const buffer = Buffer.from(base64Header, 'base64');

  if (kind === 'print_3d') {
    const inspection = inspectStlBuffer(buffer);
    return res.json(inspection);
  }

  if (kind === 'pcb') {
    const inspection = await inspectGerberZipBuffer(buffer);
    return res.json(inspection);
  }

  res.json({ valid: true, note: 'Generic type accepted' });
});

export default router;

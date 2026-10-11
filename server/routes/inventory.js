import express from 'express';
import { z } from 'zod';
import { getSupabase, logAudit } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. GET /api/inventory
router.get('/', async (req, res) => {
  const { lab, search, category } = req.query;
  const supabase = getSupabase();

  if (supabase) {
    let query = supabase.from('inventory_items').select('*, labs(id, name, block, floor)');
    if (lab) query = query.eq('lab_id', lab);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query.order('name');
    if (!error && data) return res.json(data);
  }

  // Fallback demo inventory
  res.json([
    { id: 'inv-res-10k', lab_id: 'lab-pcb-eda', name: '10k Ohm 1/4W Metal Film Resistors (Pack of 50)', part_no: 'RES-10K-025', category: 'Passives', quantity: 120, location: 'Drawer D-04 / Bin 12', updated_at: new Date().toISOString() },
    { id: 'inv-esp32-s3', lab_id: 'lab-iot-robotics', name: 'ESP32-S3-WROOM-1 DevKit Dual Type-C', part_no: 'ESP32-S3-N8R8', category: 'Microcontrollers', quantity: 16, location: 'Drawer R-01 / Tray A', updated_at: new Date().toISOString() }
  ]);
});

// 2. POST /api/inventory/import (Lab In-charge / Admin only)
const importSchema = z.object({
  lab_id: z.string().min(1),
  filename: z.string().min(1),
  items: z.array(z.object({
    name: z.string().min(1),
    part_no: z.string().optional().default(''),
    category: z.string().optional().default('General'),
    quantity: z.number().int().nonnegative(),
    location: z.string().optional().default('')
  })).min(1)
});

router.post('/import', requireAuth, requireRole('lab_incharge', 'admin'), async (req, res) => {
  const parsed = importSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  const { lab_id, filename, items } = parsed.data;
  const supabase = getSupabase();

  if (!supabase) {
    return res.json({ success: true, count: items.length, message: 'Offline mode: imported into simulated store' });
  }

  try {
    // Only the lab's own in-charge (or admin) may import for that lab
    if (req.role === 'lab_incharge') {
      const { data: lab } = await supabase.from('labs').select('incharge_id').eq('id', lab_id).single();
      if (lab?.incharge_id && lab.incharge_id !== req.user.id) {
        return res.status(403).json({ error: 'You are not the in-charge of this lab' });
      }
    }

    const keyOf = (item) => (item.part_no || item.name).toLowerCase().replace(/\s+/g, ' ').trim();
    // De-duplicate rows inside the uploaded file (last wins)
    const byKey = new Map();
    for (const item of items) byKey.set(keyOf(item), item);

    const formattedRows = [...byKey.entries()].map(([key, item]) => ({
      id: `inv-${lab_id}-${key.replace(/[^a-z0-9]+/g, '-').slice(0, 60)}`,
      item_key: key,
      lab_id,
      name: item.name,
      part_no: item.part_no || '',
      category: item.category || 'General',
      quantity: item.quantity,
      location: item.location || '',
      updated_at: new Date().toISOString(),
      updated_by: req.user.id
    }));

    // Upsert items into inventory_items
    const { error: upsertErr } = await supabase
      .from('inventory_items')
      .upsert(formattedRows, { onConflict: 'lab_id,item_key' });

    if (upsertErr) {
      return res.status(400).json({ error: upsertErr.message });
    }

    // Record import history
    await supabase.from('inventory_imports').insert({
      lab_id,
      uploaded_by: req.user.id,
      filename,
      row_count: items.length,
      created_at: new Date().toISOString()
    });

    // Audit log
    await logAudit({
      actor_id: req.user.id,
      action: 'INVENTORY_IMPORTED',
      entity: 'inventory_items',
      entity_id: lab_id,
      meta: { filename, row_count: items.length }
    });

    res.json({
      success: true,
      count: formattedRows.length,
      message: `Successfully imported ${formattedRows.length} inventory records.`
    });
  } catch (err) {
    console.error('Inventory import failed:', err.message);
    res.status(500).json({ error: 'Failed to process inventory import' });
  }
});

// 3. Purchase / Equipment Requests (§7.2)
router.get('/purchase-requests', requireAuth, requireRole('faculty', 'lab_incharge', 'admin'), async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from('purchase_requests')
      .select('*, labs(name), profiles:requested_by(full_name, role)')
      .order('created_at', { ascending: false });
    return res.json(data || []);
  }
  res.json([]);
});

router.post('/purchase-requests', requireAuth, requireRole('faculty', 'lab_incharge', 'admin'), async (req, res) => {
  const { lab_id, item, qty, reason } = req.body;
  if (!lab_id || !item || !qty) {
    return res.status(400).json({ error: 'Missing required purchase request fields' });
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('purchase_requests')
      .insert({
        lab_id,
        item,
        qty: Number(qty),
        reason: reason || '',
        status: 'pending',
        requested_by: req.user.id
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ success: true, request: data });
  }

  res.status(201).json({ success: true, request: { lab_id, item, qty, status: 'pending' } });
});

router.patch('/purchase-requests/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, request: data });
  }

  res.json({ success: true, request: { id, status } });
});

// 4. ICTS Hardware & Asset Requisitions
const inMemoryIctsRequests = [];

router.get('/icts-requests', async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('icts_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return res.json(data);
    } catch {
      // fallback
    }
  }
  res.json(inMemoryIctsRequests);
});

router.post('/icts-requests', async (req, res) => {
  const newReq = {
    id: `icts-req-${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    ...req.body
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('icts_requests')
        .insert(newReq)
        .select()
        .single();
      if (!error && data) return res.status(201).json({ success: true, request: data });
    } catch {
      // fallback
    }
  }

  inMemoryIctsRequests.unshift(newReq);
  res.status(201).json({ success: true, request: newReq });
});

router.patch('/icts-requests/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('icts_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return res.json({ success: true, request: data });
    } catch {
      // fallback
    }
  }

  const idx = inMemoryIctsRequests.findIndex(r => r.id === id);
  if (idx !== -1) {
    inMemoryIctsRequests[idx] = { ...inMemoryIctsRequests[idx], ...updates, updated_at: new Date().toISOString() };
    return res.json({ success: true, request: inMemoryIctsRequests[idx] });
  }

  res.json({ success: true, request: { id, ...updates } });
});

export default router;


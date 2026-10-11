import express from 'express';
import { z } from 'zod';
import { getSupabase, logAudit } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper: day name from date string YYYY-MM-DD
function getDayOfWeek(dateStr) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(dateStr);
  return days[d.getDay()] || 'Monday';
}

// 1. GET /api/rooms/free?date=&slot=
router.get('/free', async (req, res) => {
  const { date = new Date().toISOString().split('T')[0], slot = 1 } = req.query;
  const slotNum = Number(slot);
  const dayName = getDayOfWeek(date);
  const supabase = getSupabase();

  if (supabase) {
    try {
      // 1. All rooms
      const { data: allRooms } = await supabase.from('classrooms').select('*');
      // 2. Timetable scheduled for this day and slot
      const { data: scheduled } = await supabase
        .from('timetables')
        .select('room_id')
        .eq('day_of_week', dayName)
        .eq('slot_number', slotNum);
      // 3. Existing faculty bookings for this date and slot
      const { data: booked } = await supabase
        .from('room_bookings')
        .select('room_id')
        .eq('booking_date', date)
        .eq('slot_number', slotNum)
        .in('status', ['approved', 'blocked']);

      const scheduledIds = new Set((scheduled || []).map(s => s.room_id));
      const bookedIds = new Set((booked || []).map(b => b.room_id));

      const freeRooms = (allRooms || []).filter(r => !scheduledIds.has(r.id) && !bookedIds.has(r.id));
      return res.json({ date, slot: slotNum, day: dayName, freeRooms });
    } catch (err) {
      console.warn('Free rooms lookup error:', err.message);
    }
  }

  // Fallback demo rooms
  res.json({
    date,
    slot: slotNum,
    day: dayName,
    freeRooms: [
      { id: 'AB1-102', room_number: '102', block: 'AB-1', floor: 1, capacity: 65, room_type: 'lecture_hall' },
      { id: 'AB2-105', room_number: '105', block: 'AB-2', floor: 1, capacity: 80, room_type: 'lecture_hall' }
    ]
  });
});

// 2. POST /api/room-bookings (Faculty books a room)
const roomBookingSchema = z.object({
  room_id: z.string().min(1),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot_number: z.number().int().min(1).max(8),
  purpose: z.string().min(2).max(200)
});

router.post('/', requireAuth, requireRole('faculty', 'admin'), async (req, res) => {
  const parsed = roomBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  }

  const { room_id, booking_date, slot_number, purpose } = parsed.data;
  const facultyId = req.user.id;
  const supabase = getSupabase();

  if (supabase) {
    // Check if timetable conflict exists
    const dayName = getDayOfWeek(booking_date);
    const { data: ttConflict } = await supabase
      .from('timetables')
      .select('subject_name, batch')
      .eq('room_id', room_id)
      .eq('day_of_week', dayName)
      .eq('slot_number', slot_number)
      .maybeSingle();

    if (ttConflict) {
      return res.status(409).json({
        error: 'timetable_conflict',
        message: `Cannot book room ${room_id}: occupied by ${ttConflict.subject_name} (${ttConflict.batch}) in timetable.`
      });
    }

    // Attempt insertion
    const { data, error } = await supabase
      .from('room_bookings')
      .insert({
        room_id,
        faculty_id: facultyId,
        booking_date,
        slot_number,
        purpose,
        status: 'approved'
      })
      .select('*, classrooms(room_number, block)')
      .single();

    if (error) {
      // Unique conflict code 23505
      if (error.code === '23505') {
        // Fetch alternative free rooms for this slot
        const { data: allRooms } = await supabase.from('classrooms').select('id, room_number, block');
        const { data: booked } = await supabase
          .from('room_bookings')
          .select('room_id')
          .eq('booking_date', booking_date)
          .eq('slot_number', slot_number);

        const bookedSet = new Set((booked || []).map(b => b.room_id));
        const alternatives = (allRooms || []).filter(r => r.id !== room_id && !bookedSet.has(r.id)).slice(0, 3);

        return res.status(409).json({
          error: 'room_already_booked',
          message: `Room ${room_id} is already reserved for Slot ${slot_number} on ${booking_date}.`,
          alternatives
        });
      }

      return res.status(400).json({ error: error.message });
    }

    await logAudit({
      actor_id: facultyId,
      action: 'ROOM_BOOKED',
      entity: 'room_bookings',
      entity_id: data.id,
      meta: { room_id, booking_date, slot_number, purpose }
    });

    return res.status(201).json({ success: true, booking: data });
  }

  res.status(201).json({
    success: true,
    booking: { room_id, booking_date, slot_number, purpose, status: 'approved' }
  });
});

// 3. GET /api/room-bookings/mine
router.get('/mine', requireAuth, async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('room_bookings')
      .select('*, classrooms(room_number, block, capacity, room_type)')
      .eq('faculty_id', req.user.id)
      .order('booking_date', { ascending: false });

    if (!error && data) return res.json(data);
  }

  res.json([]);
});

// 4. DELETE /api/room-bookings/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  if (supabase) {
    let query = supabase.from('room_bookings').delete().eq('id', id);
    if (req.role !== 'admin') {
      query = query.eq('faculty_id', req.user.id);
    }
    const { error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    await logAudit({
      actor_id: req.user.id,
      action: 'ROOM_BOOKING_CANCELLED',
      entity: 'room_bookings',
      entity_id: id
    });

    return res.json({ success: true, message: 'Room booking cancelled successfully' });
  }

  res.json({ success: true, message: 'Cancelled' });
});

export default router;

/**
 * server/lib/roomStatus.js
 * 
 * Computes live occupancy status of classrooms and labs based on:
 * - Master timetable schedule (with strictly fixed non-overlapping `<` operator)
 * - Faculty room reservations (room_bookings table)
 * - Dynamic crowdsourced occupancy reports
 * - Auto-flagging logic for rooms frequently occupied unscheduled
 */

export function computeRoomStatus(room, day, timeStr, reports = [], timetables = [], roomBookings = []) {
  const roomReports = reports.filter(r => r.room_id === room.id && r.status === 'active');
  const unscheduledReports = roomReports.filter(r => 
    r.report_type === 'unscheduled_occupancy' || r.report_type === 'event_occupied'
  );
  const emptyReport = roomReports.find(r => r.report_type === 'class_cancelled_empty');

  // Timetable check with strictly < on end_time to prevent back-to-back slot 1-minute overlap
  const roomTimetables = timetables.filter(t => t.room_id === room.id && t.day_of_week === day);
  const currentSlot = roomTimetables.find(t => {
    return timeStr >= t.start_time && timeStr < t.end_time;
  });

  const upcomingSlots = roomTimetables
    .filter(t => t.start_time > timeStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const nextSlot = upcomingSlots[0] || null;

  // Check if room is booked by faculty for current period
  const activeFacultyBooking = roomBookings.find(b => 
    b.room_id === room.id && b.status === 'approved' &&
    (!currentSlot || b.slot_number === currentSlot.slot_number)
  );

  let status = 'available';
  let badgeText = 'Available Now';
  let currentSession = null;
  let flagAlert = null;

  if (room.is_flagged || unscheduledReports.length >= 2) {
    status = 'flagged_occupied';
    badgeText = 'Flagged: Frequently Taken Unscheduled';
    const latestRep = unscheduledReports[0] || {};
    flagAlert = {
      is_flagged: true,
      reason: room.flag_reason || 'Reported occupied ≥ 2 times this week without timetable schedule.',
      count: Math.max(room.flag_count, unscheduledReports.length),
      batch: room.flagged_batch || latestRep.reported_batch || 'Unspecified Batch',
      department: room.flagged_department || latestRep.reported_department || 'Unspecified Dept',
      purpose: room.flagged_purpose || latestRep.purpose || 'Unscheduled Class / Lab Activity',
      is_lab: latestRep.is_lab_class || false
    };
  } else if (unscheduledReports.length === 1) {
    status = 'reported_occupied';
    badgeText = 'Reported Occupied';
    const rep = unscheduledReports[0];
    currentSession = {
      subject_name: rep.purpose,
      department: rep.reported_department,
      batch: rep.reported_batch,
      is_lab: rep.is_lab_class,
      is_unscheduled: true,
      reported_at: rep.created_at
    };
  } else if (emptyReport) {
    status = 'available';
    badgeText = 'Reported Free (Class Cancelled)';
  } else if (activeFacultyBooking) {
    status = 'occupied';
    badgeText = 'Reserved: Faculty Room Booking';
    currentSession = {
      subject_name: activeFacultyBooking.purpose,
      department: 'Faculty Reservation',
      batch: 'Booked Session',
      is_lab: false,
      is_faculty_booking: true
    };
  } else if (currentSlot) {
    status = 'occupied';
    badgeText = currentSlot.is_lab ? 'Occupied (Lab Class)' : 'Occupied (Lecture)';
    currentSession = currentSlot;
  } else {
    status = 'available';
    badgeText = 'Available Now';
  }

  return {
    ...room,
    status,
    badgeText,
    currentSession,
    nextSlot,
    flagAlert,
    active_reports_count: roomReports.length,
    recent_reports: roomReports.slice(0, 3)
  };
}

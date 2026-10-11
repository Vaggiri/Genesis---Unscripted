/**
 * server/lib/scheduler.js
 * 
 * Earliest-available-resource interval scheduling algorithm.
 * Pure function: No DB calls, strictly deterministic and unit-testable.
 */

function parseTimeToMinutes(timeStr) {
  if (typeof timeStr === 'number') return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

function ceilToGrid(date, intervalMinutes = 15) {
  const d = new Date(date);
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.ceil(d.getTime() / ms) * ms);
}

function toDate(val) {
  return val instanceof Date ? val : new Date(val);
}

/**
 * Finds the earliest available slots across candidate resources.
 */
export function findEarliestSlot({
  candidates = [],
  durationMin = 60,
  notBefore = new Date(),
  workingHours = { start: '08:30', end: '17:30' },
  existingBookings = [],
  maxDays = 7,
  limit = 4,
  tzOffsetMin = 0 // working hours are interpreted in this UTC offset (campus passes 330 = IST)
}) {
  if (!candidates || candidates.length === 0 || durationMin <= 0) {
    return { best: null, alternatives: [] };
  }

  const startLimit = toDate(notBefore);
  const activeCandidates = candidates.filter(c => c.status === 'ok');
  if (activeCandidates.length === 0) {
    return { best: null, alternatives: [] };
  }

  const workStartMin = parseTimeToMinutes(workingHours.start || '08:30');
  const workEndMin = parseTimeToMinutes(workingHours.end || '17:30');
  const dailyWorkDurationMin = workEndMin - workStartMin;

  if (durationMin > dailyWorkDurationMin) {
    return { best: null, alternatives: [] };
  }

  const relevantBookings = existingBookings.filter(b => 
    b.status === 'pending' || b.status === 'approved'
  );

  const candidateSlots = [];

  for (const resource of activeCandidates) {
    const resBookings = relevantBookings
      .filter(b => b.resource_id === resource.id)
      .map(b => ({
        start: toDate(b.start_ts).getTime(),
        end: toDate(b.end_ts).getTime()
      }))
      .sort((a, b) => a.start - b.start);

    for (let dayOffset = 0; dayOffset < maxDays; dayOffset++) {
      const shift = tzOffsetMin * 60000;
      const localBase = new Date(startLimit.getTime() + shift);
      const dayStart = new Date(localBase);
      const dayEnd = new Date(localBase);
      dayStart.setUTCDate(dayStart.getUTCDate() + dayOffset);
      dayStart.setUTCHours(Math.floor(workStartMin / 60), workStartMin % 60, 0, 0);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + dayOffset);
      dayEnd.setUTCHours(Math.floor(workEndMin / 60), workEndMin % 60, 0, 0);
      // convert back from campus-local to real UTC instants
      dayStart.setTime(dayStart.getTime() - shift);
      dayEnd.setTime(dayEnd.getTime() - shift);

      let windowCursor = ceilToGrid(new Date(Math.max(dayStart.getTime(), startLimit.getTime())), 15);

      if (windowCursor.getTime() >= dayEnd.getTime()) {
        continue;
      }

      const dayBookings = resBookings.filter(b => 
        b.end > dayStart.getTime() && b.start < dayEnd.getTime()
      );

      while (windowCursor.getTime() + durationMin * 60 * 1000 <= dayEnd.getTime()) {
        const potentialStart = windowCursor.getTime();
        const potentialEnd = potentialStart + durationMin * 60 * 1000;

        const conflict = dayBookings.find(b => 
          (potentialStart < b.end && potentialEnd > b.start)
        );

        if (conflict) {
          windowCursor = ceilToGrid(new Date(conflict.end), 15);
        } else {
          let nextEventTime = dayEnd.getTime();
          const subsequentBooking = dayBookings.find(b => b.start >= potentialEnd);
          if (subsequentBooking) {
            nextEventTime = subsequentBooking.start;
          }
          const leftoverGapMin = Math.round((nextEventTime - potentialEnd) / (60 * 1000));

          candidateSlots.push({
            resourceId: resource.id,
            resourceName: resource.name,
            resourceKind: resource.kind,
            start: new Date(potentialStart).toISOString(),
            end: new Date(potentialEnd).toISOString(),
            startTimestamp: potentialStart,
            leftoverGapMin
          });

          windowCursor = new Date(windowCursor.getTime() + 15 * 60 * 1000);
          if (candidateSlots.filter(s => s.resourceId === resource.id).length >= 5) {
            break;
          }
        }
      }
    }
  }

  candidateSlots.sort((a, b) => {
    if (a.startTimestamp !== b.startTimestamp) {
      return a.startTimestamp - b.startTimestamp;
    }
    return a.leftoverGapMin - b.leftoverGapMin;
  });

  const uniqueSlots = [];
  const seenKey = new Set();
  for (const s of candidateSlots) {
    const key = `${s.resourceId}-${s.start}`;
    if (!seenKey.has(key)) {
      seenKey.add(key);
      uniqueSlots.push(s);
    }
  }

  return {
    best: uniqueSlots.length > 0 ? uniqueSlots[0] : null,
    alternatives: uniqueSlots.slice(1, limit)
  };
}

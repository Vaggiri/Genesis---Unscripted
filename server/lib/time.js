/**
 * server/lib/time.js — Campus time (IST, UTC+05:30) helpers.
 * Vercel/Node runs in UTC; all campus-facing "today / now / day-of-week" must use IST.
 */
export const IST_OFFSET_MIN = 330;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function istNow(date = new Date()) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MIN * 60000);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    day: DAYS[shifted.getUTCDay()],
    time: `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`,
    hour: shifted.getUTCHours(),
    dateStr: shifted.toISOString().split('T')[0]
  };
}

/** UTC ISO bounds [start, end] of an IST calendar date (YYYY-MM-DD). */
export function istDayBounds(dateStr) {
  const start = new Date(`${dateStr}T00:00:00+05:30`);
  if (Number.isNaN(start.getTime())) return null;
  return { start: start.toISOString(), end: new Date(start.getTime() + 24 * 3600 * 1000).toISOString() };
}

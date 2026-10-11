/**
 * server/lib/analyticsCalc.js — pure functions computing utilization metrics from real bookings.
 * No randomness, no hard-coded sample numbers.
 */
import { IST_OFFSET_MIN } from './time.js';

const WORK_START_H = 8.5;   // 08:30
const WORK_END_H = 17.5;    // 17:30
const HOURS_PER_DAY = WORK_END_H - WORK_START_H;
const SHIFT = IST_OFFSET_MIN * 60000;

const istParts = (iso) => {
  const d = new Date(new Date(iso).getTime() + SHIFT);
  return { dow: d.getUTCDay(), hour: d.getUTCHours() + d.getUTCMinutes() / 60 };
};

function weekdaysBetween(fromMs, toMs) {
  let n = 0;
  for (let t = fromMs; t < toMs; t += 86400000) {
    const dow = new Date(t + SHIFT).getUTCDay();
    if (dow !== 0 && dow !== 6) n++;
  }
  return Math.max(n, 1);
}

export function computeUtilization({ bookings = [], resources = [], fromMs, toMs }) {
  const used = bookings.filter(b => ['approved', 'completed'].includes(b.status) || b.status === 'no_show');
  const honoured = bookings.filter(b => ['approved', 'completed'].includes(b.status));
  const hours = (b) => Math.max(0, (new Date(b.end_ts) - new Date(b.start_ts)) / 3600000);

  const usableResources = resources.filter(r => r.status === 'ok');
  const capacityHours = usableResources.length * HOURS_PER_DAY * weekdaysBetween(fromMs, toMs);
  const bookedHours = honoured.reduce((s, b) => s + hours(b), 0);
  const utilizationRate = capacityHours > 0 ? Math.min(100, Math.round((bookedHours / capacityHours) * 100)) : 0;

  const noShows = bookings.filter(b => b.status === 'no_show').length;
  const decided = used.length;
  const noShowRate = decided > 0 ? Math.round((noShows / decided) * 100) : 0;

  const counts = {};
  for (const b of bookings) {
    const name = b.resources?.name || b.resource_id;
    counts[name] = (counts[name] || 0) + 1;
  }
  const topEquipment = Object.entries(counts).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count).slice(0, 5);

  const hourDistribution = [];
  for (let h = 8; h <= 17; h++) hourDistribution.push({ hour: `${h}:00`, count: 0 });
  const grid = {}; // dow -> bucket -> hours
  const buckets = ['09:00', '11:00', '14:00', '16:00'];
  const bucketStart = [9, 11, 14, 16];
  for (const b of honoured) {
    const { dow, hour } = istParts(b.start_ts);
    const slot = hourDistribution.find(x => x.hour === `${Math.floor(hour)}:00`);
    if (slot) slot.count++;
    let idx = -1;
    bucketStart.forEach((s, i) => { if (hour >= s) idx = i; });
    if (idx >= 0 && dow >= 1 && dow <= 5) {
      grid[dow] = grid[dow] || {};
      grid[dow][idx] = (grid[dow][idx] || 0) + hours(b);
    }
  }
  const perCellCapacity = usableResources.length * 2 * Math.max(1, weekdaysBetween(fromMs, toMs) / 5);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const heatmap = dayNames.map((day, i) => ({
    day,
    slots: buckets.map((hour, bi) => ({
      hour,
      intensity: perCellCapacity > 0
        ? Math.min(100, Math.round((((grid[i + 1] || {})[bi]) || 0) / perCellCapacity * 100))
        : 0
    }))
  }));

  // Queue-style what-if: adding one machine of the busiest kind scales wait by n/(n+1)
  const waits = honoured.map(b => (new Date(b.start_ts) - new Date(b.created_at)) / 3600000).filter(w => w >= 0);
  const avgWait = waits.length ? waits.reduce((s, w) => s + w, 0) / waits.length : 0;
  const kindCount = {};
  for (const b of honoured) {
    const k = b.resources?.kind;
    if (k) kindCount[k] = (kindCount[k] || 0) + 1;
  }
  const busiestKind = Object.entries(kindCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const n = busiestKind ? Math.max(1, usableResources.filter(r => r.kind === busiestKind).length) : 1;
  const projected = avgWait * n / (n + 1);
  const weeks = Math.max(1, (toMs - fromMs) / (7 * 86400000));
  const simulation = {
    machineKind: busiestKind,
    currentAvgWaitHours: Math.round(avgWait * 10) / 10,
    projectedAvgWaitHours: Math.round(projected * 10) / 10,
    reductionPercent: avgWait > 0 ? Math.round((1 - projected / avgWait) * 100) : 0,
    extraThroughputJobsWeek: busiestKind ? Math.round((kindCount[busiestKind] / n) / weeks) : 0,
    method: 'Estimate: wait scales as n/(n+1) when one machine is added to a pool of n.'
  };

  return {
    isSampleData: bookings.length === 0,
    totalBookings: bookings.length,
    utilizationRate,
    noShowRate,
    topEquipment,
    hourDistribution,
    heatmap,
    simulation
  };
}

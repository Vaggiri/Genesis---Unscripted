import { describe, it, expect } from 'vitest';
import { computeUtilization } from '../lib/analyticsCalc.js';
import { istNow, istDayBounds } from '../lib/time.js';

const resources = [{ id: 'a', kind: 'printer_3d', status: 'ok' }, { id: 'b', kind: 'printer_3d', status: 'ok' }];
const from = Date.parse('2026-10-05T00:00:00Z');
const to = Date.parse('2026-10-12T00:00:00Z');

describe('computeUtilization', () => {
  it('returns zeros (no fabricated numbers) when there are no bookings', () => {
    const r = computeUtilization({ bookings: [], resources, fromMs: from, toMs: to });
    expect(r.totalBookings).toBe(0);
    expect(r.utilizationRate).toBe(0);
    expect(r.isSampleData).toBe(true);
  });

  it('computes utilization from booked hours / capacity and is deterministic', () => {
    const bookings = [{
      resource_id: 'a', status: 'approved', created_at: '2026-10-05T01:00:00Z',
      start_ts: '2026-10-06T04:00:00Z', end_ts: '2026-10-06T07:00:00Z', resources: { name: 'P1', kind: 'printer_3d' }
    }];
    const r1 = computeUtilization({ bookings, resources, fromMs: from, toMs: to });
    const r2 = computeUtilization({ bookings, resources, fromMs: from, toMs: to });
    expect(r1).toEqual(r2);
    // 3h booked / (2 machines * 9h * 5 weekdays = 90h) = 3%
    expect(r1.utilizationRate).toBe(3);
    expect(r1.topEquipment[0]).toEqual({ name: 'P1', count: 1 });
  });

  it('counts no-shows', () => {
    const mk = (status) => ({ resource_id: 'a', status, created_at: '2026-10-05T01:00:00Z', start_ts: '2026-10-06T04:00:00Z', end_ts: '2026-10-06T05:00:00Z' });
    const r = computeUtilization({ bookings: [mk('approved'), mk('no_show')], resources, fromMs: from, toMs: to });
    expect(r.noShowRate).toBe(50);
  });
});

describe('IST helpers', () => {
  it('maps 20:00 UTC Sunday to Monday 01:30 IST', () => {
    const r = istNow(new Date('2026-10-11T20:00:00Z'));
    expect(r.day).toBe('Monday');
    expect(r.time).toBe('01:30');
    expect(r.dateStr).toBe('2026-10-12');
  });
  it('gives a 24h IST day window', () => {
    const b = istDayBounds('2026-10-12');
    expect(b.start).toBe('2026-10-11T18:30:00.000Z');
    expect(b.end).toBe('2026-10-12T18:30:00.000Z');
  });
});

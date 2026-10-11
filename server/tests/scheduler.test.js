import { describe, it, expect } from 'vitest';
import { findEarliestSlot } from '../lib/scheduler.js';

describe('Earliest Available Resource Scheduler', () => {
  const baseDate = new Date('2026-10-12T08:30:00Z'); // Monday 08:30 UTC
  const defaultWorkingHours = { start: '08:30', end: '17:30' };

  const singleResource = [
    { id: 'res-printer-1', name: 'Prusa MK4', kind: 'printer_3d', status: 'ok' }
  ];

  it('handles empty calendar by scheduling at the earliest grid time inside working hours', () => {
    const result = findEarliestSlot({
      candidates: singleResource,
      durationMin: 60,
      notBefore: new Date('2026-10-12T08:30:00Z'),
      workingHours: defaultWorkingHours,
      existingBookings: []
    });

    expect(result.best).not.toBeNull();
    expect(result.best.resourceId).toBe('res-printer-1');
    const start = new Date(result.best.start);
    expect(start.getUTCHours()).toBe(8);
    expect(start.getUTCMinutes()).toBe(30);
  });

  it('skips maintenance resources completely', () => {
    const maintenanceCandidate = [
      { id: 'res-broken', name: 'Broken Laser', kind: 'laser', status: 'maintenance' }
    ];

    const result = findEarliestSlot({
      candidates: maintenanceCandidate,
      durationMin: 60,
      notBefore: baseDate,
      workingHours: defaultWorkingHours,
      existingBookings: []
    });

    expect(result.best).toBeNull();
    expect(result.alternatives).toHaveLength(0);
  });

  it('finds slot when gap is exactly equal to duration', () => {
    // 08:30 - 09:30 booked, then gap 09:30 - 10:30, then 10:30 - 12:00 booked
    const existingBookings = [
      {
        resource_id: 'res-printer-1',
        start_ts: '2026-10-12T08:30:00Z',
        end_ts: '2026-10-12T09:30:00Z',
        status: 'approved'
      },
      {
        resource_id: 'res-printer-1',
        start_ts: '2026-10-12T10:30:00Z',
        end_ts: '2026-10-12T12:00:00Z',
        status: 'approved'
      }
    ];

    const result = findEarliestSlot({
      candidates: singleResource,
      durationMin: 60, // Exactly 1 hour gap between 09:30 and 10:30
      notBefore: baseDate,
      workingHours: defaultWorkingHours,
      existingBookings
    });

    expect(result.best).not.toBeNull();
    expect(result.best.start).toBe('2026-10-12T09:30:00.000Z');
    expect(result.best.end).toBe('2026-10-12T10:30:00.000Z');
    expect(result.best.leftoverGapMin).toBe(0);
  });

  it('skips gaps shorter than the requested duration', () => {
    // Gap is only 30 minutes (09:30 - 10:00), but request is 60 minutes
    const existingBookings = [
      {
        resource_id: 'res-printer-1',
        start_ts: '2026-10-12T08:30:00Z',
        end_ts: '2026-10-12T09:30:00Z',
        status: 'approved'
      },
      {
        resource_id: 'res-printer-1',
        start_ts: '2026-10-12T10:00:00Z',
        end_ts: '2026-10-12T11:00:00Z',
        status: 'approved'
      }
    ];

    const result = findEarliestSlot({
      candidates: singleResource,
      durationMin: 60,
      notBefore: baseDate,
      workingHours: defaultWorkingHours,
      existingBookings
    });

    expect(result.best).not.toBeNull();
    // Must jump past the 10:00-11:00 booking to 11:00
    expect(result.best.start).toBe('2026-10-12T11:00:00.000Z');
  });

  it('advances to next day when current day is fully booked', () => {
    // Book whole day 08:30 - 17:30
    const existingBookings = [
      {
        resource_id: 'res-printer-1',
        start_ts: '2026-10-12T08:30:00Z',
        end_ts: '2026-10-12T17:30:00Z',
        status: 'approved'
      }
    ];

    const result = findEarliestSlot({
      candidates: singleResource,
      durationMin: 60,
      notBefore: baseDate,
      workingHours: defaultWorkingHours,
      existingBookings,
      maxDays: 3
    });

    expect(result.best).not.toBeNull();
    // Must be on 2026-10-13 at 08:30
    const start = new Date(result.best.start);
    expect(start.getUTCDate()).toBe(13);
    expect(start.getUTCHours()).toBe(8);
    expect(start.getUTCMinutes()).toBe(30);
  });

  it('respects working-hours boundaries and does not schedule after working hours', () => {
    // Asking for 120 minutes starting at 16:30 when day ends at 17:30
    const result = findEarliestSlot({
      candidates: singleResource,
      durationMin: 120,
      notBefore: new Date('2026-10-12T16:30:00Z'),
      workingHours: defaultWorkingHours,
      existingBookings: [],
      maxDays: 2
    });

    expect(result.best).not.toBeNull();
    // Cannot fit before 17:30, so must be scheduled next morning at 08:30
    const start = new Date(result.best.start);
    expect(start.getUTCDate()).toBe(13);
    expect(start.getUTCHours()).toBe(8);
    expect(start.getUTCMinutes()).toBe(30);
  });

  it('returns best option and up to 3 alternatives with best-fit tie-break', () => {
    const multiCandidates = [
      { id: 'res-1', name: 'Machine 1', kind: 'printer_3d', status: 'ok' },
      { id: 'res-2', name: 'Machine 2', kind: 'printer_3d', status: 'ok' }
    ];

    const result = findEarliestSlot({
      candidates: multiCandidates,
      durationMin: 30,
      notBefore: baseDate,
      workingHours: defaultWorkingHours,
      existingBookings: [],
      limit: 4
    });

    expect(result.best).not.toBeNull();
    expect(result.alternatives.length).toBeGreaterThan(0);
    expect(result.alternatives.length).toBeLessThanOrEqual(3);
  });
});

describe('IST working hours (tzOffsetMin=330)', () => {
  it('applies 08:30-17:30 in IST, not UTC', () => {
    const r = findEarliestSlot({
      candidates: [{ id: 'r1', name: 'P', kind: 'printer_3d', status: 'ok' }],
      durationMin: 60,
      notBefore: new Date('2026-10-12T00:00:00Z'), // 05:30 IST Monday
      existingBookings: [],
      tzOffsetMin: 330
    });
    expect(r.best.start).toBe('2026-10-12T03:00:00.000Z'); // 08:30 IST
  });

  it('never proposes a slot ending after 17:30 IST', () => {
    const r = findEarliestSlot({
      candidates: [{ id: 'r1', name: 'P', kind: 'printer_3d', status: 'ok' }],
      durationMin: 120,
      notBefore: new Date('2026-10-12T10:30:00Z'), // 16:00 IST
      existingBookings: [],
      tzOffsetMin: 330
    });
    expect(r.best.start).toBe('2026-10-13T03:00:00.000Z'); // next day 08:30 IST
  });
});

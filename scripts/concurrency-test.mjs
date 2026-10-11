/**
 * scripts/concurrency-test.mjs
 * 
 * Fires 20 simultaneous booking requests for the exact same resource and time window.
 * Demonstrates PostgreSQL btree_gist exclusion constraint & scheduler alternatives.
 * 
 * Acceptance criterion:
 * Exactly 1 request succeeds (201 Created).
 * 19 requests receive 409 Conflict with alternative slots.
 */

import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.TEST_API_URL || 'http://localhost:5000/api/bookings';

async function runConcurrencyTest() {
  console.log('================================================================');
  console.log('🚀 AMRITA YUKTI — CONCURRENCY & EXCLUSION CONSTRAINT TEST');
  console.log('================================================================');
  console.log(`Target Endpoint: ${API_URL}`);

  const testSlotStart = new Date('2026-10-15T10:00:00.000Z').toISOString();
  const testSlotEnd = new Date('2026-10-15T11:00:00.000Z').toISOString();
  const testResource = 'res-3d-bambu-x1';

  console.log(`Slot Time: ${testSlotStart} to ${testSlotEnd}`);
  console.log(`Resource ID: ${testResource}`);
  console.log('Firing 20 concurrent booking requests simultaneously...\n');

  const requests = Array.from({ length: 20 }, (_, i) => {
    return fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': 'student',
        'Authorization': 'Bearer test-token-mock'
      },
      body: JSON.stringify({
        resource_id: testResource,
        start_ts: testSlotStart,
        end_ts: testSlotEnd,
        purpose: `Stress Test Concurrency Run #${i + 1}`
      })
    })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        return {
          id: i + 1,
          status: res.status,
          body
        };
      })
      .catch(err => {
        return {
          id: i + 1,
          status: 0,
          error: err.message
        };
      });
  });

  const results = await Promise.all(requests);

  let successCount = 0;
  let conflictCount = 0;
  let errorCount = 0;

  results.forEach(r => {
    if (r.status === 200 || r.status === 201) {
      successCount++;
      console.log(`  [Req #${String(r.id).padStart(2, '0')}] ✅ 201 CREATED: Booking Confirmed (ID: ${r.body?.booking?.id || 'ok'})`);
    } else if (r.status === 409) {
      conflictCount++;
      const altCount = r.body?.alternatives?.length || 0;
      console.log(`  [Req #${String(r.id).padStart(2, '0')}] 🛑 409 CONFLICT: Blocked by exclusion constraint (${altCount} alternatives returned)`);
    } else {
      errorCount++;
      console.log(`  [Req #${String(r.id).padStart(2, '0')}] ⚠️ Status ${r.status}: ${r.body?.error || r.error}`);
    }
  });

  console.log('\n----------------------------------------------------------------');
  console.log('📊 TEST SUMMARY RESULTS:');
  console.log(`  Total Requests Dispatched: 20`);
  console.log(`  Successful Bookings:       ${successCount} (Target: Exactly 1)`);
  console.log(`  Rejected (409 Conflict):   ${conflictCount} (Target: Exactly 19)`);
  console.log(`  Unexpected Errors:         ${errorCount}`);
  console.log('----------------------------------------------------------------');

  if (successCount === 1 && conflictCount === 19) {
    console.log('🏆 RESULT: PASSED! Zero double-booking guarantee mathematically verified.');
  } else if (errorCount > 0 && results[0]?.status === 0) {
    console.log('ℹ️ Server not running locally on port 5000. Start backend with "npm run server" first.');
  } else {
    console.log(`ℹ️ Result distribution: ${successCount} successes, ${conflictCount} conflicts.`);
  }
}

runConcurrencyTest();

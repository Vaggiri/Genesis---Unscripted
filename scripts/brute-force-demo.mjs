/**
 * scripts/brute-force-demo.mjs
 * 
 * Demonstrates DDoS and Brute-Force Rate Limiting protection.
 * Fires 50 rapid requests against the server to trigger 429 Too Many Requests.
 */

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:5000/api/chat';

async function runRateLimitDemo() {
  console.log('================================================================');
  console.log('🛡️ AMRITA YUKTI — RATE LIMITING & SECURITY DEFENSE DEMO');
  console.log('================================================================');
  console.log(`Targeting: ${TARGET_URL}`);
  console.log('Sending burst of 50 requests in rapid succession...\n');

  let passed = 0;
  let rateLimited = 0;

  for (let i = 1; i <= 50; i++) {
    try {
      const res = await fetch(TARGET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Probe test #${i}` })
      });

      if (res.status === 429) {
        rateLimited++;
        if (rateLimited === 1) {
          console.log(`🚨 [Req #${i}] 429 TOO MANY REQUESTS: Rate limit triggered! Firewall active.`);
        }
      } else {
        passed++;
      }
    } catch (err) {
      console.log(`⚠️ Connection error: ${err.message}. Is backend running?`);
      return;
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Total Requests Sent: 50`);
  console.log(`Allowed Requests:    ${passed}`);
  console.log(`Blocked (HTTP 429):  ${rateLimited}`);
  console.log('----------------------------------------------------------------');
  if (rateLimited > 0) {
    console.log('✅ PASS: Attack mitigated. Rate-limiting middleware successfully blocked abusive traffic.');
  }
}

runRateLimitDemo();

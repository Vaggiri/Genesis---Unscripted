# Security & correctness fixes (post-review)

Run migrations in `supabase/migrations/` in order: `001_init.sql` → `002_rls.sql` → `003_seed_sample.sql` → `004_security_fixes.sql` → `005_realtime.sql`.

| # | Fix | Where |
|---|-----|-------|
| 1 | Role is always `student` at signup; role changes only by admin/service role; college-domain enforced in DB | 004 SQL (`handle_new_user`, `guard_profile_update`) |
| 2 | Students cannot write jobs/bookings directly via Supabase (no self-approval); all writes go through Express | 004 SQL policies |
| 3 | PII endpoints need login; analytics/reports are staff-only | `server.js`, `bookings.js`, `analytics.js` |
| 4 | `DEMO_OFFLINE` ignored in production/Vercel; default demo role is `student` | `middleware/auth.js` |
| 5 | `trust proxy` set (correct rate-limit IP on Vercel) | `server.js` |
| 6 | No default demo password; seed script requires `DEMO_PASSWORD` | `scripts/seed-demo-users.mjs`, `.env.example` |
| 7 | Real analytics (no `Math.random`, no fabricated minimums) | `lib/analyticsCalc.js` |
| 8 | Booking PATCH: state machine, no self-approval, lab in-charge scoping, race-safe | `routes/bookings.js` |
| 9 | Check-in: owner only, approved only, time window | `routes/bookings.js` |
| 10 | IST handling for working hours, "today", day-of-week | `lib/time.js`, `lib/scheduler.js` (`tzOffsetMin`) |
| 11 | Idempotent inventory import (`item_key` unique), lab in-charge scoping | `routes/inventory.js`, 004 SQL |
| 12 | Chat requires login, input length cap, no internal error text | `routes/chat.js` |
| 13 | Server never falls back to the anon key | `lib/supabase.js` |

Known limitation: `/jobs/verify-content` still inspects a header sent by the browser (now authenticated and size-capped).
Upload the file to Supabase Storage and inspect it server-side for full assurance.

# Review Cheatsheet: Amrita Yukti at a Glance

A high-density 1-page briefing for review panels, evaluator Q&A, and elevator pitches.

---

## 1. Ten Verifiable Headline Facts & Numbers

| Metric | Verified Value | Evidence in Codebase |
| :--- | :---: | :--- |
| **1. Automated Test Pass Rate** | **18 / 18 Tests Passing** | 9 scheduler, 5 analytics, 4 chatbot tests run via `npm test` (`vitest`). |
| **2. Database Tables** | **16 Normalized Tables** | Defined across migrations in `supabase/migrations/001_init.sql`. |
| **3. Supported Languages** | **4 Languages** | English, Tamil (தமிழ்), Hindi (हिन्दी), Malayalam (മലയാളം) in `src/i18n/`. |
| **4. User Personas / Roles** | **4 Roles** | `student`, `faculty`, `lab_incharge`, `admin` enforced via PostgreSQL RLS. |
| **5. Scheduling Time Quantization**| **15-Minute Grid** | `ceilToGrid()` in `server/lib/scheduler.js` across 08:30–17:30 IST window. |
| **6. Double-Booking Guarantee** | **100% Kernel Enforcement**| `EXCLUDE USING gist` exclusion constraint on `facility_bookings`. |
| **7. Concurrency Test Workers** | **20 Simultaneous Races** | `scripts/concurrency-test.mjs`: 1 success (201), 19 conflicts (409). |
| **8. Rate Limiting Firewalls** | **120 / 25 Req/Min** | Standard limiter (120 req/min) & sensitive chat limiter (25 req/min). |
| **9. Stale Inventory Audit Flag**| **30 Days Threshold** | `Date.now() - 30 * 86400000` check in `src/components/InventorySearch.jsx`. |
| **10. Operating Cost** | **$0 / Month** | Runs 100% within free tiers of Vercel Edge CDN and Supabase PostgreSQL. |

---

## 2. Five Architectural Strengths

1. **Kernel-Level Concurrency Protection:** Zero double bookings under concurrency races via PostgreSQL `btree_gist` exclusion constraints.
2. **Client-Side Slicing Math:** In-browser signed tetrahedron decomposition calculates 3D mesh volume and duration in milliseconds without costly cloud slicers.
3. **Resilient Multilingual Voice Assistant:** Grounded, regional-language assistant in Tamil, Hindi, Malayalam, and English operating with zero GPU dependencies and graceful Gemini Flash fallback.
4. **Live Synchronization via Supabase Realtime:** Instant cross-device state updates with automatic 20-second polling fallback.
5. **Classroom Space Radar:** Timetable cross-referencing and crowdsourced occupancy reporting reconciling theoretical schedules with physical room drift.

---

## 3. Five Honest Limitations

1. **Client-Side File Storage:** CAD files (`.stl`, `.zip`) are inspected in browser memory; raw originals are not saved to an S3/Supabase Storage bucket (metadata saved to DB).
2. **Header-Based Content Verification:** `/api/jobs/verify-content` inspects a client-sent base64 header (capped at 70 KB).
3. **Serverless In-Memory Rate Limiting:** Request counts are maintained in-memory per serverless instance rather than a globally synchronized Redis cache.
4. **Supabase Free-Tier Inactivity Sleep:** Database instances pause after ~7 consecutive days without queries on free plans.
5. **Browser-Native Voice Recognition:** Hands-free speech input requires Chromium-based desktop browsers (Chrome, Edge) supporting Web Speech API.

---

## 4. The 60-Second Elevator Pitch

> *"Good morning, respected judges. Engineering campuses house crores worth of specialized prototyping equipment—3D printers, PCB mills, multi-GPU workstations—and thousands of electronic components spread across departmental silos. Yet students spend hours walking between academic blocks looking for open machines or standard resistors, while lab managers battle manual paper registers and double bookings.*
> 
> *We built **Amrita Yukti**—a centralized innovation facility booking and inventory matching portal built specifically for campus reality. Innovators search drawer stock by exact bin location with stale-stock alerts, inspect 3D models in the browser using signed tetrahedron math, and book machines through an interval scheduler protected by PostgreSQL exclusion constraints that physically prevent double bookings under concurrency. Everything is synchronized in real-time, backed by crowdsourced classroom occupancy tracking and a hands-free multilingual voice assistant speaking English, Tamil, Hindi, and Malayalam.*
> 
> *Zero double bookings, zero server-side slicing overhead, zero vendor lock-in. Built for Amrita, by Amrita."*

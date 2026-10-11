# BUILD_SPEC.md — Amrita Yukti (Genesis---Unscripted)

Instructions for the coding agent. Read the whole file first. Work in the priority order given (P0 → P3). Each item has acceptance criteria; do not mark an item done until they pass.

## 0. Ground rules

- **Keep the current stack:** Vite + React 19 (JavaScript) frontend, Express 5 backend in `server/server.js`, exposed on Vercel through `api/index.js`, Supabase (Postgres, Auth, Storage, Realtime). **Do NOT migrate to Next.js.** The repo already works as a Vite SPA plus an Express serverless function, and a rewrite would burn time.
- **Serverless reality:** on Vercel, in-memory state does not persist between invocations. Anything that must survive (bookings, reports, jobs, inventory, settings) must live in Supabase, never only in `state` in `server.js` or in `localStorage`.
- **Secrets:** never put the Supabase service-role key or any API key in a `VITE_` variable or in the client bundle. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are allowed client-side.
- **No large models.** Everything must run on a small server with no GPU. The chatbot is intents + slots + templates, grounded in the database.
- **Use sample data only.** Label seeded data as "Sample data" in the UI where it appears (dashboards especially).
- Keep the existing Amrita maroon design system (`src/index.css`, `src/App.css`). Reuse `card-amrita`, `btn-amrita`, `badge-*` classes.

## 1. What exists today (analysis summary)

| Area | Current state | Problem |
|---|---|---|
| Auth (`src/services/auth.js`, `LoginPage.jsx`) | Entirely client-side. Hardcoded passwords (`student123`, `faculty123`, `admin123`), a universal password `amrita123`, role guessed from the text typed (`includes('u4')`, `includes('prof')`, `=== 'admin'`). Registered users and plaintext passwords stored in `localStorage`. Session in `localStorage`/`sessionStorage`. | Anyone can become admin by typing `admin` / `admin123`, or by editing `localStorage`. Reviewers will find this in minutes. |
| API auth (`server/server.js`) | No authentication or authorization on any route, including `/admin/*`, `PUT /settings`, `PUT /pages/:slug`, `POST /ai/config`. `cors()` is fully open. | Anyone can delete classrooms, edit settings, or repoint the AI endpoint. `GET /ai/config` returns the AI `apiKey`. |
| Secrets (`.env.example`) | Contains a real-looking Supabase project URL and anon key. | See §2.1 — rotate and replace with placeholders. |
| DB (`supabase_schema.sql`) | Tables: `classrooms`, `timetables`, `occupancy_reports`, `portal_settings`, `portal_pages`. Starts with `DROP TABLE ... CASCADE`. All RLS policies are `USING (true) WITH CHECK (true)`. | No tables for users, labs, inventory, bookings, jobs, audit. RLS gives everyone read/write/delete on everything. The DROP statements will wipe production data if re-run. |
| Bookings (`App.jsx`, `labsData.js`, server `/innovation/bookings`) | Source of truth is `localStorage` + `BroadcastChannel` (same-browser tabs only). Server keeps `state.innovation_bookings` in memory and never writes to Supabase. Slots are free-text strings from a static `availableSlotsToday` list. | Bookings vanish on serverless cold start. Two students can book the same slot (no uniqueness). Faculty on another device never sees student requests. |
| Faculty room booking (`ClassroomOccupancyModule.jsx`) | `bookedRooms` is local React state only. | Not persisted, not time-aware, no conflict check, not visible to anyone else. |
| Chatbot (`SmartLabFinderBot.jsx`, `/ai/chat`, `AiTunnelModal.jsx`) | Calls a local OmniRoute LLM (`vag`, port 20128) through an ngrok tunnel. Fallback is keyword matching (`lower.includes('ai')` matches almost any sentence). Lab facts are duplicated in the server system prompt and in `labsData.js`. English only, text only. | Cannot work on Vercel (needs a local model + tunnel). Contradicts the "no huge model / college-friendly" goal. No Tamil/Hindi/Malayalam, no voice. Two sources of truth for lab data. |
| Inventory (`labsData.js`, `LabDirectoryView.jsx`) | Component stock hard-coded in `benchComponents`. Directory shows only the first 3 components per lab. | No upload, no per-lab search by component, no "last updated". |
| File upload / 3D print vs PCB routing | Does not exist. | Required feature. |
| Scheduling algorithm | Does not exist. | Required feature. |
| Roles | `student`, `faculty`, `admin` only. | The notes call for a workshop manager / lab in-charge with a task list and equipment ordering. |
| Utilization | `currentUtilization: '78%'` hard-coded strings. | Not computed from anything. |
| i18n / voice | None. | Required feature. |
| Branding | Four names in use: Campus Setu, Amrita Yukti, Amrita InnovateX, Campus Sync (old localStorage keys). | Inconsistent; judges will notice. |
| Docs (`README.md`, `TECH_STACK.md`) | Claim RLS tenant isolation, "guaranteed transactional reservation state", a "fine-tuned" model. | Not true of the current code. Update to match reality (§9). |
| `package.json` | `vercel` CLI, `concurrently` listed under `dependencies`. | Move to `devDependencies` (keeps the serverless bundle small). |

## 2. P0 — must be done before anything else

### 2.1 Secrets hygiene (do first)

1. Replace the real values in `.env.example` with placeholders (`https://YOUR-PROJECT.supabase.co`, `YOUR-ANON-KEY`). Do not keep a real project URL or key in the repo.
2. **Tell the user to rotate the Supabase anon key** in the Supabase dashboard (the old one is in git history), and to set the new values in Vercel → Project Settings → Environment Variables. If the repo is public, treat the old key as exposed. An anon key is meant to be public-facing, but only when RLS is correct, and today it is not (see §2.3).
3. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.example` as a placeholder with the comment "server-side only, never prefix with VITE_".
4. Confirm `.env` is in `.gitignore` (it is).

**Acceptance:** `grep -r "supabase.co" .env.example` shows only the placeholder; no key-looking strings in tracked files.

### 2.2 Real authentication with Supabase Auth

- **Delete** the hard-coded credential logic in `src/services/auth.js` (`DEMO_USERS`, `ROLE_CREDENTIALS`, `detectRoleFromIdentifier`, `loginWithCredentials`, `registerUser`, `localStorage` user storage). Replace with thin wrappers around `supabase.auth.signInWithPassword`, `signUp`, `signOut`, and `getSession`.
- **Add** `src/context/AuthContext.jsx` exposing `{ session, profile, role, loading, signIn, signUp, signOut }`. `App.jsx` reads the user from this context instead of `getStoredUser()`.
- **Add table `profiles`** (see §3): `id uuid primary key references auth.users`, `role` in (`student`,`faculty`,`lab_incharge`,`admin`), `full_name`, `roll_no`, `emp_id`, `department`, `batch`, `preferred_language`.
- **Role is stored in `profiles.role` and enforced on the server and by RLS. It is never inferred from what the user types.**
- Sign-up creates a `student` by default. Faculty / lab in-charge / admin roles are assigned only by an admin (or seeded). Remove the role picker from the public sign-up form in `LoginPage.jsx`.
- Restrict sign-ups to college email domains (`@cb.amrita.edu`, `@cb.students.amrita.edu`) with a check in the sign-up handler and a server-side check when the profile row is created.
- **Add `scripts/seed-demo-users.mjs`** (uses the service-role key from env) that creates demo accounts for student, faculty, lab in-charge and admin. Passwords come from env (`DEMO_PASSWORD`), not from source code. The login page may show the demo emails but must not contain the passwords in the bundle; share them separately with the review team.
- Remove the universal password logic (`amrita123`) entirely.
- Fix the hard-coded identity in `StudentPortal.jsx` ("AK" initials, `'Adithya K.'` and `'CB.EN.U4AIE23045'` fallbacks, the "Faculty Mentor: Dr. K. Swaminathan" card) and `FacultyPortal.jsx` ("KS", fallbacks). Derive initials from `profile.full_name`; make the mentor field come from the profile or be removed.

**Acceptance:** typing `admin` / `admin123` no longer logs anyone in; editing `localStorage` cannot grant a role; a student token calling an admin endpoint gets `403`.

### 2.3 Server-side authorization and hardening (`server/server.js`)

1. **Split `server/server.js` (1,072 lines) into modules** while keeping `export default app` and the `api/index.js` import unchanged:
   - `server/lib/supabase.js` — creates the service-role client from env.
   - `server/middleware/auth.js` — `requireAuth` (verifies the `Authorization: Bearer <jwt>` with `supabase.auth.getUser(token)`, loads `profiles.role`) and `requireRole(...roles)`.
   - `server/middleware/security.js` — `helmet`, `express-rate-limit` (strict on `/auth`-adjacent and `/chat` routes, looser on reads), CORS allowlist from env `ALLOWED_ORIGINS`, JSON body size limit (e.g. `100kb`).
   - `server/routes/*.js` — one file per area (§4–§7), mounted on `/api` only. Keep the existing duplicate mount on `/` only if Vercel needs it; otherwise drop it.
2. **Protect every write route.** `/admin/*`, `PUT /settings`, `PUT /pages/:slug` → `requireRole('admin')`. Approving or rejecting bookings → `requireRole('faculty','lab_incharge','admin')`. Submitting reports → `requireAuth`.
3. **Input validation** with `zod` on every POST/PUT/PATCH body (types, lengths, enums). Reject unknown fields.
4. **`/ai/config`:** delete both the GET and POST routes along with `AiTunnelModal.jsx` and its Navbar button (the OmniRoute/ngrok bridge is replaced by §6). If you keep any dev-only AI settings, make them admin-only, never return the API key, and never accept arbitrary base URLs.
5. **Persist everything.** Remove the writes-to-`state`-then-maybe-Supabase pattern. Routes read and write Supabase directly. The in-memory `state` object may remain only as an explicit demo fallback when `DEMO_OFFLINE=true`; when active, show a visible "Demo mode — data not saved" banner. Default behaviour on Vercel must be Supabase-required.
6. **Fix inconsistent reads:** `GET /timetables` and `GET /reports` currently read only `state`; they must read Supabase.
7. **Audit log:** insert a row into `audit_log` for logins (via an auth webhook or client call), uploads, booking create/approve/reject, inventory imports, role changes.
8. Remove `supabase_connected` counts from `/health` or keep it minimal (`{status:'ok'}`).

**Acceptance:** with no token, `DELETE /api/admin/classrooms/x` returns `401`; with a student token `403`; with an admin token it works. A burst of 100 requests to a rate-limited route returns `429`.

### 2.4 Database rewrite (replace `supabase_schema.sql`)

Create `supabase/migrations/001_init.sql`, `002_rls.sql`, `003_seed_sample.sql` and **delete the `DROP TABLE` block**. Use `CREATE TABLE IF NOT EXISTS`. Keep the existing tables (`classrooms`, `timetables`, `occupancy_reports`, `portal_settings`, `portal_pages`) and add those in §3. Enable the `btree_gist` extension (`CREATE EXTENSION IF NOT EXISTS btree_gist;`) and verify it works in the Supabase project.

**RLS (replace every `USING (true)` policy):**
- `profiles`: a user reads/updates their own row; admin reads all.
- `labs`, `resources`, `inventory_items`: all authenticated users can `SELECT`; only `lab_incharge` (for their own lab) and `admin` can write.
- `facility_bookings`, `jobs`: students see their own rows; `faculty`/`lab_incharge`/`admin` see rows for their lab(s); inserts must have `user_id = auth.uid()`.
- `room_bookings`: all authenticated `SELECT`; faculty insert own; owner or admin delete.
- `classrooms`, `timetables`: authenticated `SELECT`; admin writes.
- `occupancy_reports`: authenticated insert (own), admin moderate.
- `audit_log`: insert by service role only; admin `SELECT`.
- The service-role key (server only) bypasses RLS; keep that key out of the browser.

**Acceptance:** using the anon key with no login, `select * from facility_bookings` returns nothing; a student cannot read another student's jobs.

## 3. New data model (tables)

```
profiles(id, role, full_name, roll_no, emp_id, department, batch, preferred_language, created_at)
labs(id text pk, name, block, floor, category, incharge_id -> profiles, capacity)
resources(id, lab_id -> labs, name, kind  -- 'printer_3d' | 'pcb_mill' | 'laser' | 'lathe' | 'welding' | 'workstation' | 'bench', status -- 'ok'|'maintenance', requires_cert boolean)
inventory_items(id, lab_id -> labs, name, part_no, category, quantity int check (quantity >= 0), location, updated_at, updated_by)
inventory_imports(id, lab_id, uploaded_by, filename, row_count, created_at)      -- version history per CSV upload
jobs(id, user_id, kind -- 'print_3d' | 'pcb' | 'laser' | 'other', title, file_path, file_name, file_ext, detected_by, est_minutes int, est_material_g numeric, params jsonb, status -- 'submitted'|'queued'|'approved'|'in_progress'|'done'|'rejected', lab_id, created_at)
facility_bookings(id, resource_id -> resources, user_id, job_id nullable, start_ts timestamptz, end_ts timestamptz, status -- 'pending'|'approved'|'rejected'|'cancelled'|'no_show'|'completed', checked_in_at, created_at,
   EXCLUDE USING gist (resource_id WITH =, tstzrange(start_ts, end_ts) WITH &&) WHERE (status IN ('pending','approved')))
room_bookings(id, room_id -> classrooms, faculty_id, booking_date date, slot_number int, purpose, status, created_at,
   UNIQUE (room_id, booking_date, slot_number))
audit_log(id, actor_id, action, entity, entity_id, meta jsonb, created_at)
```

- Pending bookings must hold the slot (they are in the exclusion constraint), otherwise two students can both "request" the same time.
- `resources.requires_cert` plus a small `certifications(user_id, resource_kind, passed_at)` table implements the safety gate for the lathe and welding station (optional, P2).

## 4. P0 — Facility booking, scheduling algorithm, and approvals

### 4.1 Scheduling algorithm — `server/lib/scheduler.js` (new)

Implement and unit-test **earliest-available-resource interval scheduling**:

```
findEarliestSlot({ candidates, durationMin, notBefore, workingHours, existingBookings })
  1. For each compatible resource (status ok), take its sorted future bookings (pending+approved).
  2. Scan the gaps between bookings (and the end of the working day) and find the earliest gap >= durationMin starting at or after notBefore, aligned to a 15-minute grid and inside working hours.
  3. Push each candidate start into a min-heap keyed by start time; break ties by smallest leftover gap (best fit).
  4. Return the best option plus the next 3 alternatives (other resources / other times).
```

- Pure function with no database access, so it is easy to test. `server/tests/scheduler.test.js` (use `vitest`) must cover: empty calendar, fully booked day, gap exactly equal to duration, gap shorter than duration, maintenance resource skipped, crossing working-hours boundaries.
- **Commit step:** the route inserts into `facility_bookings` inside the request; if Postgres raises exclusion violation (`23P01`) or unique violation (`23505`), respond `409 { error: 'slot_taken', alternatives: [...] }` with freshly computed alternatives. The database constraint is the source of truth for concurrency, not application code.
- Same function powers: lab slot suggestions, the 3D-print/PCB job queue, and gap filling (when a booking is cancelled or marked no-show, offer the gap to the next waiting job).

### 4.2 Booking API — `server/routes/bookings.js` (new)

- `GET /api/resources?lab=` · `GET /api/availability?resourceId=&date=` · `POST /api/bookings/suggest` (runs the algorithm, returns options) · `POST /api/bookings` (commit, student) · `PATCH /api/bookings/:id` (approve/reject/cancel by in-charge or owner) · `POST /api/bookings/:id/checkin`.
- No-show auto-release: evaluate lazily — when listing or suggesting, treat any `approved` booking with no `checked_in_at` more than 15 minutes after `start_ts` as `no_show` and update it. (Avoids needing a cron job on Vercel.)

### 4.3 Frontend changes for bookings

- `src/services/labsData.js`: **remove** `INITIAL_BOOKING_REQUESTS`, `getStoredBookings`, `saveStoredBookings`, and all `availableSlotsToday` / `currentUtilization` strings. Lab, resource and stock data now come from the API. The file can be deleted once nothing imports it (`SmartLabFinderBot.jsx`, `LabDirectoryView.jsx`, `App.jsx` do today).
- `src/App.jsx`: remove the booking `useState`, `BroadcastChannel`, `storage` listener, the three `fetch('/api/innovation/...')` handlers and the chime-on-broadcast logic. Replace with a `useBookings()` hook (new file `src/hooks/useBookings.js`) that fetches from the API and subscribes to **Supabase Realtime** on `facility_bookings` so faculty on another device see new requests live and students see approvals live. Keep the toast + chime, triggered from the realtime events.
- `src/services/api.js`: attach the Supabase access token as `Authorization: Bearer ...` on every request; add methods for the new routes; remove the silent `catch → fake data` fallbacks that hide failures (show an error state instead).
- `StudentPortal.jsx` "My Requests": render real bookings (resource, start–end, status) from the hook.
- `FacultyApprovalsView.jsx`: keep the layout; data comes from the API, filtered to the faculty member's lab(s). Add the lab in-charge role to see it too.
- `LabDirectoryView.jsx`: load labs, resources, and live status from the API; "Next open slot" comes from `/availability`; show all components with quantity (see §5.1), not just 3.

**Acceptance:** run `scripts/concurrency-test.mjs` (new): fire 20 simultaneous booking requests for the same resource and time; exactly one succeeds, 19 get `409` with alternatives. Include the output in the README.

## 5. P0 — Inventory and job intake (the headline features)

### 5.1 Inventory CSV upload and search

- New components: `src/components/InventoryUpload.jsx` (lab in-charge/admin), `src/components/InventorySearch.jsx` (everyone).
- Upload flow: choose CSV/XLSX → parse client-side with `papaparse` → validate (required columns `component, part_no, quantity, lab, location`; no negative quantities; trim duplicates; unknown lab names flagged) → show a **preview with row errors and a diff against current stock** → confirm → `POST /api/inventory/import` (server re-validates with zod, upserts in a transaction, writes an `inventory_imports` row and an `audit_log` row).
- Search: fuzzy match with `fuse.js` ("resistor 10k" ≈ "10 kΩ resistor") returning component, lab, location, quantity, and **"last updated"**. Flag items not updated in 30+ days.
- Replaces the hard-coded `benchComponents` arrays.
- Provide `public/sample-inventory.csv` so the demo works offline.

### 5.2 File upload and job routing (3D print vs PCB)

- New: `src/components/JobUpload.jsx`, `src/utils/fileRouter.js`, `src/utils/stlAnalysis.js`, `server/lib/fileRouter.js`, `server/routes/jobs.js`.
- **Upload path:** the browser uploads directly to a private Supabase Storage bucket `job-files` (never through the Express function, which has body-size limits). Object path: `{user_id}/{uuid}.{ext}`. Add storage policies so a user can only write under their own folder. Size caps: 50 MB STL, 20 MB Gerber zip.
- **Routing rules (extension + content check, not extension alone):**

| Kind | Extensions | Content check |
|---|---|---|
| `print_3d` | `.stl`, `.obj`, `.3mf` (`.step` accepted, no analysis) | STL: ASCII starts with `solid`; binary size must equal `84 + 50 × triangleCount` from the header |
| `pcb` | `.zip` containing Gerber layers (`.gbr .gtl .gbl .gts .gbs .gko .gm1`) plus drill (`.drl .xln`); also `.kicad_pcb`, `.brd` | Open the zip (`jszip`), look for Gerber layer names and a drill file; cap uncompressed size and file count to defend against zip bombs |
| ambiguous | `.dxf`, `.svg`, generic `.zip` | Ask the user to pick (laser cut / PCB outline / other) |

- If the user's selected job type disagrees with the detected type, show "This looks like a Gerber zip but you chose 3D printing. Switch?"
- **3D print analysis (client side, `three` `STLLoader`):** compute volume (signed tetrahedra), bounding box, estimated print time ≈ `volume × infill factor / flow rate + overhead` and material grams. Label as **estimate**. Let the in-charge override duration.
- **PCB fields:** layer count (from copper layers found), board size (from outline layer if parseable, else manual entry), quantity, finish.
- On submit: create a `jobs` row, call `/api/bookings/suggest` with the estimated duration for compatible machines (printers or PCB mill), let the student pick an option, and create a pending `facility_bookings` row linked to the job.
- Server re-verifies the file kind from the first bytes of the stored object before accepting (`magic-byte` check) and rejects mismatches.
- New `src/components/JobQueue.jsx` for the workshop manager / lab in-charge: queue by lab, accept/reject, mark in progress/done, adjust duration, "order material" (see §7).

**Acceptance:** upload `cube.stl` → routed to 3D printing with volume and time estimate shown; upload a Gerber zip → routed to PCB with layer count; rename a `.txt` to `.stl` → rejected; wrong selected type → switch prompt.

## 6. P0 — Chatbot: multilingual, voice, lightweight (replaces the OmniRoute bot)

Replace `SmartLabFinderBot.jsx` with `src/components/VoiceChatBot.jsx` and the server `/ai/chat` route with `server/routes/chat.js` + `server/lib/chatEngine.js`. Delete `AiTunnelModal.jsx` and remove the ngrok/OmniRoute references in `server/server.js`, `src/App.jsx` (modal wiring), `src/components/Navbar.jsx` (the "AI Bridge" button and `onOpenAiModal` prop), `README.md`, and `TECH_STACK.md`.

**Engine (no LLM required):**
- **Language detection** by Unicode script: Tamil `U+0B80–0BFF`, Malayalam `U+0D00–0D7F`, Devanagari (Hindi) `U+0900–097F`, otherwise English. Respect `profile.preferred_language` as the default.
- **Intents:** `inventory_check`, `lab_info`, `suggest_slot` / `book_slot`, `job_status`, `free_rooms` (faculty), `help`, `human_handoff`. Implement with keyword/phrase lists per language plus fuzzy matching; add a small TF-IDF or multilingual-embedding classifier only if time permits.
- **Slots:** component name → fuzzy match against `inventory_items`; lab name → `labs`; date words (`today`, `tomorrow`, `இன்று`, `நாளை`, `आज`, `कल`, `ഇന്ന്`, `നാളെ`); duration.
- **Replies:** pre-written templates in `src/i18n/*.json` / `server/lib/templates/{en,ta,hi,ml}.json`, filled with **real database values**. The bot never invents stock counts or slots.
- **Actions:** the bot can start a booking suggestion, but must show a confirmation card before creating anything (reuse the existing "Proceed to Book" card UI from `SmartLabFinderBot.jsx`).
- Always offer "talk to a person" (shows the lab in-charge's contact) and a short "what I can do" list.
- **Optional Gemini fallback** (`GEMINI_API_KEY` server-side env, off by default): only when intent confidence is low, ask Gemini to classify the message into one of the fixed intents or translate it to English. Never send personal data; set a 4 s timeout; the bot must work fully without it. Never let it generate facts.

**Voice (client side):**
- Web Speech API: `SpeechRecognition` with `lang` = `en-IN`, `ta-IN`, `hi-IN`, `ml-IN`; `speechSynthesis` for spoken replies. Feature-detect and hide the mic on unsupported browsers (Firefox). Show the recognised text in the input box for the user to edit before sending. No audio is sent to our server.
- Add a one-line privacy note near the mic: browser speech recognition may send audio to the browser vendor's service.
- Language selector (English / தமிழ் / हिन्दी / മലയാളം) in the chat header.

**UI i18n:** add `i18next` + `react-i18next`, `src/i18n/index.js`, and `en.json`, `ta.json`, `hi.json`, `ml.json` covering navigation, buttons, and booking/status labels. Ship English + Tamil first; Hindi + Malayalam next. Language switcher in `Navbar.jsx`.

**Acceptance:** "do you have 10k resistors" → answer from the DB with lab + quantity + last updated; the same question in Tamil returns a Tamil reply; with `GEMINI_API_KEY` unset the bot still works; mic works in Chrome and degrades gracefully elsewhere.

## 7. P1 — Roles, faculty room booking, workshop manager

### 7.1 Faculty free-room booking (replace local `bookedRooms` state)

- `src/components/ClassroomOccupancyModule.jsx`: remove the local `bookedRooms` state and the fake "Reserved for Current Session" text. Add a date + period picker. Faculty see free rooms for that date/slot (from `timetables` + `room_bookings` + active reports) and book one.
- New `server/routes/rooms.js`: `GET /api/rooms/free?date=&slot=` · `POST /api/room-bookings` (unique `(room_id, booking_date, slot_number)`; `409` on conflict with alternatives) · `DELETE /api/room-bookings/:id` · `GET /api/room-bookings/mine`.
- `computeRoomStatus` (currently in `server.js`) must also consider `room_bookings`. Move it into `server/lib/roomStatus.js` and fix its time comparison (`timeStr <= t.end_time` makes back-to-back slots overlap by a minute; use `<`).
- Timetable import: add `POST /api/admin/timetables/import` (CSV: `room, day, start, end, subject, faculty, batch`) with the same preview-then-confirm pattern as inventory.
- Admin can block slots for exams/events (`room_bookings.status = 'blocked'`).

### 7.2 Workshop manager / lab in-charge role

- Add `lab_incharge` (workshop manager) to role routing in `App.jsx` with a new `src/components/LabInchargePortal.jsx`: Job Queue (`JobQueue.jsx`), Inventory (`InventoryUpload.jsx`), Auto-assign (uses the scheduler to assign pending jobs to the earliest machine), Equipment/material order requests, and an Approvals tab (reuse `FacultyApprovalsView.jsx`).
- "Order equipment/components": simple `purchase_requests(id, lab_id, item, qty, reason, status, requested_by)` table + a form and an approval list for admin. No payment integration.
- Faculty "order lab components" in the notes → same `purchase_requests` flow, requested from the faculty portal.

### 7.3 Items from the handwritten notes — scope decision

- **Include (small modules):** class vacant (already covered by the Space Radar "class cancelled/empty" report — surface a "Mark my class vacant" button for faculty that creates a `class_cancelled_empty` report), student "raise complaint" (reuse `occupancy_reports` pattern or a simple `complaints` table), faculty view of free classes.
- **Keep as roadmap slides, not code:** parent login, parent entry request, warden pass approval, attendance/marks/fees, faculty-to-parent behaviour reports. These duplicate the university ERP and add privacy risk; do not build them. If a placeholder tab exists, label it "Roadmap — via ERP integration".

## 8. P2 — Analytics and security demo

### 8.1 Utilization dashboard — `src/components/UtilizationDashboard.jsx` (admin + lab in-charge)

- Computed from `facility_bookings`: utilization % per resource = booked minutes (approved/completed) ÷ available minutes; idle-hours heatmap (day × hour); peak hours; most-requested equipment; no-show rate; department-wise usage. Add `GET /api/analytics/utilization?from=&to=`.
- Replace the hard-coded `currentUtilization` strings everywhere (`LabDirectoryView.jsx`, `SmartLabFinderBot.jsx` card).
- Seed sample bookings in `003_seed_sample.sql` so the dashboard has data, and show a "Sample data" badge.
- Optional "what-if" panel: replay the last N days of demand with one extra machine and show the change in waiting hours (simple queue simulation, no ML).

### 8.2 Security items to demonstrate (replaces the "dynamic firewall" phrasing)

- Rate limiting + temporary lockout after repeated failed logins (Supabase Auth rate limits plus `express-rate-limit` on server routes).
- Role-based access on every route + RLS; audit log viewer for admin (`AdminPortal.jsx` new tab "Audit Log").
- Upload validation (magic bytes, size caps, zip-bomb limits).
- Add `scripts/brute-force-demo.mjs` that hammers a login/route and shows `429`/lockout responses for a live demo.

### 8.3 Optional

- Safety certification gate for lathe/welding (`certifications` table; `requires_cert` blocks booking until signed off by the in-charge).
- Peer-mentor suggestion, job-to-machine matching summary card, ICS export of approved bookings, PWA manifest.

## 9. P3 — Cleanup, docs, deployment

1. **Branding:** pick one product name (**Amrita Yukti**, used in README and footer) and replace "Campus Setu", "Amrita InnovateX", "Campus Sync". Update `package.json` `name`, `index.html` title, the schema comment, the localStorage keys, the footer, and the toast text. Delete the legacy `campussync_*` key handling.
2. **`package.json`:** move `vercel` and `concurrently` to `devDependencies`; add `express-rate-limit`, `helmet`, `zod`, `papaparse`, `jszip`, `three`, `fuse.js`, `i18next`, `react-i18next`; dev: `vitest`. Remove unused imports flagged by `npm run lint` (many components import unused lucide icons).
3. **Remove** `src/components/SupabaseConfigModal.jsx` and its Navbar button for the production build (it lets any visitor point the app at a different database via `localStorage`); keep it behind `import.meta.env.DEV` if needed for development. Make `getSupabaseClient()` return a single cached client.
4. **`vercel.json`:** keep the rewrites. Add function config only if needed (`maxDuration`). Document required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`, optional `GEMINI_API_KEY`, `DEMO_OFFLINE`.
5. **Docs — rewrite `README.md` and `TECH_STACK.md` to match the real system** and drop claims that aren't true (remove "fine-tuned `vag` model", ngrok/OmniRoute, and "guaranteed transactional state" unless the new code earns it). Add these sections, because reviewers asked for them:
   - **Architecture** (diagram: React SPA on Vercel → Express serverless `/api` → Supabase Postgres/Auth/Storage/Realtime).
   - **Traffic management** (rate limits, direct-to-Storage uploads, pagination/indexes, lazy no-show release, realtime instead of polling, voice processed in the browser).
   - **Data security** (Supabase Auth, RLS, service-role key server-side only, upload validation, audit log, email-domain restriction, no stored audio, sample data only).
   - **Algorithm** (earliest-available-resource interval scheduling, complexity ≈ O(m log m + n) for m machines and n bookings, concurrency guarantee through the exclusion constraint, concurrency test result).
   - **Worst cases and precautions** (double booking; traffic spike at slot opening; malicious/corrupt upload; Supabase free project paused after a week idle → open the dashboard before demo; Render/Vercel cold start; stale inventory; chatbot misunderstanding → confirm-before-action and human fallback; browser lacks speech support → text always available; scope creep).
   - **Deployment path for the college** (same code runs on Amrita IT's hosting; Postgres is standard; Supabase can be self-hosted; SSO as phase two).
6. **Free-tier notes for the team:** a free Supabase project pauses after about a week of inactivity — open it before the demo; Supabase free storage is limited (about 1 GB), so cap uploads and clean test files. Keep a `docker-compose.yml`-style local backup (or a recorded demo) in case campus Wi-Fi fails.

## 10. File-by-file change list

| File | Action |
|---|---|
| `.env.example` | **Modify** — placeholders only; add service-role + `ALLOWED_ORIGINS` + optional `GEMINI_API_KEY` |
| `package.json` | **Modify** — deps per §9.2; add scripts `test`, `seed:users`, `test:concurrency` |
| `README.md`, `TECH_STACK.md` | **Rewrite** per §9.5 |
| `supabase_schema.sql` | **Replace** with `supabase/migrations/001–003` (no DROP, new tables, real RLS) |
| `vercel.json` | **Keep**; document env vars |
| `vite.config.js` | **Keep**; proxy to `:5000` stays for local dev |
| `api/index.js` | **Keep** (re-exports the Express app) |
| `server/server.js` | **Refactor** into `lib/`, `middleware/`, `routes/`; auth + validation + persistence; delete `/ai/config`, in-memory-only booking store, ngrok headers |
| `server/lib/scheduler.js` | **Add** (+ `server/tests/scheduler.test.js`) |
| `server/lib/chatEngine.js`, `server/lib/templates/*.json` | **Add** |
| `server/lib/fileRouter.js` | **Add** (magic-byte verification) |
| `server/lib/roomStatus.js` | **Add** (moved + fixed `computeRoomStatus`) |
| `server/routes/{bookings,inventory,jobs,rooms,chat,analytics,admin}.js` | **Add** |
| `scripts/{seed-demo-users,concurrency-test,brute-force-demo}.mjs` | **Add** |
| `src/main.jsx` | **Modify** — wrap in `AuthContext` + i18n provider |
| `src/App.jsx` | **Modify** — remove booking state/BroadcastChannel/localStorage; use `AuthContext`, `useBookings`; add `lab_incharge` route; realtime toasts |
| `src/context/AuthContext.jsx`, `src/hooks/useBookings.js` | **Add** |
| `src/services/auth.js` | **Rewrite** as Supabase Auth wrapper |
| `src/services/api.js` | **Modify** — bearer token, new endpoints, remove fake-data fallbacks |
| `src/services/supabaseClient.js` | **Modify** — single client, env-only config (dev-only override) |
| `src/services/labsData.js` | **Delete** after migrating consumers to API data |
| `src/components/LoginPage.jsx` | **Modify** — Supabase sign-in/up, email-domain check, no role picker, no demo passwords |
| `src/components/Navbar.jsx` | **Modify** — language switcher; remove Supabase/AI tunnel buttons (prod) |
| `src/components/StudentPortal.jsx` | **Modify** — real profile data; job upload tab; inventory search tab; chatbot swap; real bookings |
| `src/components/FacultyPortal.jsx` | **Modify** — real profile data; room booking tab; purchase requests; chatbot swap |
| `src/components/SmartLabFinderBot.jsx` | **Replace** with `VoiceChatBot.jsx` (keep the confirmation card UI) |
| `src/components/AiTunnelModal.jsx` | **Delete** |
| `src/components/SupabaseConfigModal.jsx` | **Delete or DEV-only** |
| `src/components/LabDirectoryView.jsx` | **Modify** — API data, all components, live next-slot |
| `src/components/FacultyApprovalsView.jsx` | **Modify** — API-backed, scoped to lab, also for `lab_incharge` |
| `src/components/ClassroomOccupancyModule.jsx` | **Modify** — persistent room booking with date/period; "mark class vacant" |
| `src/components/{RoomTimetableModal,ReportRoomModal}.jsx` | **Keep**; ensure they send the auth token via `api.js` |
| `src/components/AdminPortal.jsx` | **Modify** — add tabs: Users & Roles, Inventory imports, Audit Log, Utilization; timetable CSV import |
| `src/components/{InventoryUpload,InventorySearch,JobUpload,JobQueue,LabInchargePortal,UtilizationDashboard,VoiceChatBot}.jsx` | **Add** |
| `src/utils/{fileRouter,stlAnalysis}.js` | **Add** |
| `src/i18n/{index.js,en.json,ta.json,hi.json,ml.json}` | **Add** |
| `public/sample-inventory.csv`, sample STL and Gerber zip for demo | **Add** |

## 11. Definition of done (check all before the review)

- [ ] No real secrets in the repo; Supabase anon key rotated; new values set in Vercel.
- [ ] Login is Supabase Auth only; no hard-coded or universal passwords anywhere (`grep -ri "admin123\|student123\|faculty123\|amrita123" src server` returns nothing).
- [ ] Every write route requires a token and the right role; RLS verified with the anon key.
- [ ] Concurrency test: 20 simultaneous bookings for one slot → exactly 1 success, rest `409` with alternatives; output pasted in README.
- [ ] Scheduler unit tests pass (`npm test`).
- [ ] CSV inventory upload with preview; search shows lab, quantity, and last-updated.
- [ ] STL → 3D print with estimate; Gerber zip → PCB; renamed/mismatched file rejected.
- [ ] Faculty can book a free room; a second faculty booking the same room/date/slot gets `409`.
- [ ] Student request appears live on the faculty/in-charge screen on a different device (Realtime), and approval appears live for the student.
- [ ] Chatbot answers from the DB in English and Tamil (Hindi/Malayalam if time), voice works in Chrome, text works everywhere, works with `GEMINI_API_KEY` unset.
- [ ] Utilization dashboard computed from bookings and labelled "Sample data".
- [ ] `npm run lint` and `npm run build` pass; the Vercel deployment works end to end with only Supabase as the data store.
- [ ] README/TECH_STACK describe what the code actually does, including architecture, traffic, security, algorithm, and failure modes.

## 12. Things NOT to do

- Do not migrate to Next.js, Python/FastAPI, or MongoDB.
- Do not add any large or self-hosted model, ngrok tunnel, or GPU dependency.
- Do not store audio, and do not store personal data in chat logs beyond a retention window.
- Do not claim features in the UI or docs that are not implemented.
- Do not build parent/warden/attendance/marks/fee modules; they belong to the university ERP.

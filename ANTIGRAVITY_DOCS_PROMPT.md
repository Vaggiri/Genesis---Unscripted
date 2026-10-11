# PROMPT FOR ANTIGRAVITY — Write the complete documentation for "Amrita Yukti"

You are working inside the repository `Genesis---Unscripted` (project name **Amrita Yukti**, GENESIS 2026 hackathon,
Amrita Vishwa Vidyapeetham, Coimbatore). Your job: produce a complete, accurate documentation set that the team can use
to (a) run and demo the system, (b) set it up from zero including every key/token, and (c) defend the project in a
review panel.

## RULES (read first)
1. **Document only what exists in the code.** Before writing each section, open the real files and read them. Never
   invent features, endpoints, tables, numbers or screenshots. If something is claimed in README.md / TECH_STACK.md but not in code, do NOT repeat the claim; list it under "Known limitations / roadmap".
2. **Never put real secrets in the docs.** Use placeholders like `YOUR-ANON-KEY`. Do not print the contents of any `.env`.
3. For anything about external dashboards (Supabase, Vercel, Google AI Studio) check the current official documentation
   and write the steps as they exist today; if a menu name differs from what you remember, use the official name and link the official page.
4. Write for three readers: a teammate who has never run the project, a faculty reviewer, and a technical judge.
5. Use Markdown, clear headings, tables for env vars/endpoints/roles, and Mermaid diagrams for architecture/flows.
6. Keep wording honest: do not call the scheduler "constant time" (it is bounded by days x 15-minute steps x bookings),
   do not call the chatbot an "AI model" (it is a rule-based intent/slot engine with an OPTIONAL Gemini classification fallback).
7. After writing, run `npm ci`, `npm test`, `npm run build` and confirm every command you document actually works. Fix the doc, not the facts.

## FILES TO CREATE (all under `docs/`, plus a short root README)
| File | Purpose |
|------|---------|
| `README.md` (root, rewrite) | 1-page overview, feature list, quick start, link index to docs/ |
| `docs/01-PROJECT-OVERVIEW.md` | Problem statement, why it matters for Amrita, users/roles, novelty, scope, what is NOT in scope |
| `docs/02-FEATURES.md` | Every feature, per role, with where it lives in code (file paths) and how to see it in the UI |
| `docs/03-ARCHITECTURE.md` | System architecture (see detail below) |
| `docs/04-DATABASE.md` | Every table/column/constraint/policy/trigger from `supabase/migrations/001-004`, ER diagram |
| `docs/05-API-REFERENCE.md` | Every Express endpoint: method, path, auth, roles, request, response, errors, rate limit |
| `docs/06-ALGORITHM.md` | The scheduling algorithm (see detail below) |
| `docs/07-SECURITY.md` | Threat model, controls, worst cases and precautions (see detail below) |
| `docs/08-SETUP-GUIDE.md` | Zero-to-running guide + how to obtain EVERY key/token (see detail below) |
| `docs/09-DEPLOYMENT.md` | Vercel deployment, env vars, domain, redeploy, rollback, free-tier limits and keep-alive |
| `docs/10-DEMO-SCRIPT.md` | Step-by-step live demo with exact accounts, clicks, expected result, and timing (see detail below) |
| `docs/11-TESTING.md` | What is tested (vitest), how to run, concurrency/brute-force scripts, manual test checklist |
| `docs/12-REVIEW-QA.md` | 40+ likely reviewer questions with short honest answers (see detail below) |
| `docs/13-LIMITATIONS-ROADMAP.md` | Honest limitations + future work |
| `docs/14-TROUBLESHOOTING.md` | Symptom -> cause -> fix table |
| `docs/GLOSSARY.md` | Terms (RLS, JWT, exclusion constraint, Gerber, STL, IST, etc.) |

Keep the existing `docs/SECURITY_FIXES.md` and `docs/BUILD_SPEC.md`; link to them. Delete the stray
`amrita-yukti-fixes.patch` from the repo root (it is not documentation).

## DETAIL: 03-ARCHITECTURE.md
- Mermaid component diagram: Browser (React 19 + Vite SPA) -> Vercel (static files + serverless function `api/index.js` wrapping Express 5) -> Supabase (Postgres, Auth, Realtime). Optional: Google Gemini API.
- Request lifecycle for: login, creating a booking, approving a booking, uploading a job file, chatbot message, free-room booking (sequence diagrams).
- Layer table: frontend folders (`src/components`, `src/services`, `src/context`, `src/hooks`, `src/i18n`, `src/utils`), backend folders (`server/routes`, `server/lib`, `server/middleware`), `supabase/migrations`, `scripts/`.
- **Network traffic management**: static assets served by Vercel CDN; API runs as serverless functions that scale per request; helmet; CORS allow-list; `express-rate-limit` (standard 120/min, sensitive 25/min on chat) — explain that on serverless the limiter is per-instance and `trust proxy` is set; 100 kb body limit; indexes; lazy no-show release (no cron needed); Supabase connection handled by the Supabase client over HTTPS; Realtime WebSocket for live updates. State clearly what the free-tier limits are (verify current numbers on the official pages) and the idle-pause behaviour of Supabase free projects.
- **Data security**: Supabase Auth JWT, role from `profiles.role` only, DB-enforced role guard trigger, RLS on every table, service-role key only on the server, college-email domain check in DB trigger, audit log, input validation with zod, helmet. Reference migration 004.
- Where each role's data is visible (table: role x data).
- Timezone design: server runs UTC, campus logic uses IST (`server/lib/time.js`, `tzOffsetMin` in scheduler).

## DETAIL: 06-ALGORITHM.md
Read `server/lib/scheduler.js` and explain exactly: inputs, outputs, 15-minute grid (`ceilToGrid`), working hours 08:30-17:30 in campus time,
per-resource sorted bookings, conflict skipping, leftover-gap tie-break, dedupe, `best` + `alternatives`. Give pseudocode, a worked numeric example
(use a real test from `server/tests/scheduler.test.js`), true complexity, why it is paired with the Postgres `EXCLUDE USING gist` constraint
(algorithm = suggestion, database = guarantee), and what happens on a race (409 + alternatives). Include a Mermaid flowchart.

## DETAIL: 07-SECURITY.md
Table of **worst cases -> what happens -> precaution implemented -> residual risk**. Cover at least: two students book the same slot at the same moment; Supabase free project paused; Vercel cold start; serverless rate-limit per-instance; stolen/expired JWT; student tries to set own role; student tries to approve own booking; direct Supabase client writes; malicious or oversized upload / zip bomb / fake extension; wrong file type chosen; chatbot abuse and Gemini quota drain; no-show hoarding of machines; bad CSV inventory import; duplicate inventory rows; clock/timezone mismatch; internet down at demo; wrong key committed to GitHub (rotation steps). Be honest: list the known residual risk that `/jobs/verify-content` inspects a client-supplied header and that files are analysed in the browser (check whether any Supabase Storage upload really exists in code; if not, say so).

## DETAIL: 08-SETUP-GUIDE.md  (must be beginner-proof)
1. Prerequisites: Node.js version (check `package.json`/`engines`, state the exact minimum), Git, a Google or GitHub account. Windows + macOS + Linux commands.
2. Clone, `npm ci`, copy `.env.example` -> `.env`.
3. **Environment variable table** — for EACH variable in `.env.example` and in code (`grep process.env` and `import.meta.env`): name, used by (frontend/backend), required?, where to get it, example placeholder, and whether it is safe to expose to the browser (only `VITE_*` values reach the browser; the service-role key must NEVER be prefixed with VITE_).
4. **How to get each key/token, step by step with the official dashboard names:**
   - Supabase: create account, create project (region choice, DB password), copy Project URL, anon/publishable key and service-role/secret key from the project API settings, how to run the four migrations in order in the SQL editor, how to confirm tables/RLS exist, how to enable Realtime for `facility_bookings` (the repo must contain the SQL `ALTER PUBLICATION supabase_realtime ADD TABLE public.facility_bookings;` — if it is missing from the migrations, add it as `005_realtime.sql` and mention it), Auth settings (email confirmation on/off for demo, redirect URLs, allowed domains), how to create demo users (`npm run seed:users` with `DEMO_PASSWORD`), how to promote a user to admin/faculty/lab_incharge (SQL one-liner run as the project owner, and via the Admin portal), how to set a lab's `incharge_id`.
   - Google Gemini API key (OPTIONAL): Google AI Studio -> get API key, put in `GEMINI_API_KEY`. State that the bot works without it. **Check the model name used in `server/lib/chatEngine.js` (`gemini-1.5-flash`): verify against the current Gemini model list; if it is retired/deprecated, change it to a currently supported Flash model read from a new env var `GEMINI_MODEL` with a sensible default, keep the 4 s timeout, and document it. Also move the API key from the URL query string into the `x-goog-api-key` header.**
   - Vercel: create account, import the GitHub repo, framework preset "Vite", add environment variables (list them), deploy; Vercel CLI login/token only if they want CLI deploys (`vercel login`, and how to create a token in account settings for CI) — mark as optional.
   - GitHub: how to add the repo, branch, and how to rotate a leaked key (Supabase key rotation + Vercel redeploy).
5. Run locally: `npm run dev:all` (frontend 5173 + API 5000), how the Vite dev proxy reaches `/api` (read `vite.config.js`), open the URL, log in.
6. Verification checklist: `/api/health` returns OK, login works for 4 roles, inventory page lists seeded items, booking round-trip works.
7. Offline/demo fallback: what `DEMO_OFFLINE` does, that it is ignored in production, and its limits.

## DETAIL: 10-DEMO-SCRIPT.md
A 8-10 minute script. Table columns: step, who is logged in (student / faculty / lab in-charge / admin demo accounts from `scripts/seed-demo-users.mjs`), what to click, what the audience should see, what to say. Must include:
1. Student: search "10k resistor" -> shows lab, drawer location, stale-stock badge.
2. Student: upload an `.stl` -> auto-detected as 3D print, volume/time estimate -> earliest slot suggestion; then upload a Gerber `.zip` -> detected as PCB; show the mismatch warning when the wrong type is picked.
3. Two browsers book the same machine/slot at once (`npm run test:concurrency`) -> one 201, one 409 with alternatives (the database exclusion constraint).
4. Lab in-charge / faculty approves -> student's screen updates live (Realtime).
5. Chatbot in English, Tamil, Hindi, Malayalam by voice and text (note: voice needs Chrome/Edge and mic permission; list the supported browsers honestly).
6. Faculty: Classroom radar -> free room now -> book a slot; timetable conflict shown.
7. Admin: role management, audit log, inventory CSV import using `public/sample-inventory.csv`, utilization dashboard (explain it is computed from real bookings and shows zeros until bookings exist — tell them to create 8-10 bookings before the demo).
8. Security moment: show that a student cannot call an admin API (401/403) — `npm run demo:security` if it is accurate; verify what that script does first.
Add: pre-demo checklist (wake the Supabase project, warm the Vercel function, seed data, charge laptop, backup screen recording, hotspot), what to do if internet/Supabase fails (backup plan), and a "if X goes wrong, say Y" table.

## DETAIL: 12-REVIEW-QA.md
40+ Q&As grouped: Problem & novelty; Architecture & scalability (how many users, how traffic is managed, why Vercel+Supabase, why not microservices/Next.js); Security & privacy; Algorithm; Chatbot (why no large model, multilingual approach, language detection by Unicode script); File handling (STL volume via signed tetrahedra, Gerber zip inspection, zip-bomb limits); Deployment & cost to the college (free tier, what it costs to move to Amrita servers, data residency); Failure modes; Future scope (integration with campus ERP, QR check-in, notifications, mobile app, payment/credits, carbon/energy tracking). Answers must be short, honest, and consistent with the code. Mark any answer that depends on something not implemented as "roadmap".

## DETAIL: 05-API-REFERENCE.md and 04-DATABASE.md
Generate by reading `server/server.js`, every file in `server/routes/`, and the four SQL migrations. Include RLS policy tables per table and the triggers `handle_new_user` and `guard_profile_update`. Mark which routes are mounted twice (`/api/...` and `/...`, `/rooms` and `/room-bookings`, `/chat` and `/ai/chat`).

## DIAGRAMS
Mermaid: architecture, ER diagram, booking sequence, approval sequence, scheduler flowchart, role-permission matrix, deployment topology. Add a PNG/SVG export note (how to render Mermaid) so they can paste into slides.

## ALSO DELIVER
- `docs/REVIEW-CHEATSHEET.md`: one page — 10 headline numbers/facts that are verifiable in the repo (test count, tables, endpoints, languages, roles), 5 strengths, 5 honest limitations, and the 60-second pitch.
- `docs/PITCH-OUTLINE.md`: 10-slide outline (title, problem, solution, demo flow, architecture, algorithm, security, deployment/cost, impact, roadmap).
- Update `TECH_STACK.md` and old README claims so they match the code (remove or qualify: "constant time", "Direct-to-Storage uploads" unless a real upload exists, ngrok mentions, "AI" wording).

## DEFINITION OF DONE
- Every command in the docs was executed successfully (or marked "not verified" with the reason).
- Every file path, env var, endpoint and table named in the docs exists in the repo (do a final grep-based consistency pass).
- No secrets, no placeholder like TODO/lorem, no claims that the code does not support.
- A final `docs/CHECKLIST.md` listing each doc file with a verified tick and the date.

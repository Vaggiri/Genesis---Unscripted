# 🏫 Amrita Yukti
### Centralized Innovation Facility Booking & Utilization Portal

> **Amrita Vishwa Vidyapeetham** — Genesis Hackathon Project  
> A hackathon prototype hardened for campus pilot for facility, prototyping equipment, and hardware inventory matching.  
> *(Derived from Sanskrit **Yukti** — Meaning Ingenuity, Skillful Innovation, and Creative Synergy)*

---

## 📌 Problem Statement Alignment
Engineering campuses house specialized prototyping equipment (3D printers, PCB milling machines, pick-and-place stations, 100MHz DSOs) and specialized components across departmental silos. Students struggle to find available slots or drawer locations, while lab in-charges spend hours manually reviewing files and verifying component stocks.

**Amrita Yukti** provides a unified, college-friendly solution:
1. **Intelligent Hardware & Facility Discovery:** Search drawer stock by drawer label and physical location (e.g. `Drawer D-12, Bin 3`), with >30 day stale audit alerts.
2. **Earliest-Available Interval Scheduler:** The scheduler scans each active machine over up to 7 working days in 15-minute steps, skipping past existing bookings, so its cost grows with machines × days × bookings (small on campus-scale data). Correctness under concurrency is guaranteed by the PostgreSQL exclusion constraint, not by the algorithm.
3. **Database-Level Concurrency Protection:** Postgres `btree_gist` exclusion constraints ensure zero double-bookings, returning `409 Conflict` with immediate alternative suggestions.
4. **Client-Side File Inspection & Job Intake:** 3D model (.stl) and Gerber (.zip) files are inspected in the browser (volume/time estimate, magic-byte check); only the job metadata and estimates are saved to the database. Uploading originals to Supabase Storage is on the roadmap.
5. **Real-Time Faculty & Lab In-Charge Desk:** Live cross-device synchronization powered by Supabase Realtime for instant approval notifications and check-ins.
6. **Classroom & Space Radar:** Real-time occupancy tracker with timetable integration, crowdsourced vacancy reports, and faculty reservations.
7. **Multilingual Voice Assistant:** A rule-based multilingual intent/slot assistant with an optional Gemini classification fallback and speech-to-text in English, Tamil (தமிழ்), Hindi (हिन्दी), and Malayalam (മലയാളം).

---

## 📚 Complete Project Documentation Index

All detailed architecture, database, security, and setup guides are organized under [`docs/`](./docs/):

| Documentation Guide | Focus Area & Description |
| :--- | :--- |
| [**01. Project Overview**](./docs/01-PROJECT-OVERVIEW.md) | Campus problem statement, user personas, scope boundaries, and core novelty. |
| [**02. Features Breakdown**](./docs/02-FEATURES.md) | Detailed feature inventory mapped by role (`student`, `faculty`, `incharge`, `admin`) to code files. |
| [**03. System Architecture**](./docs/03-ARCHITECTURE.md) | Topology diagram, sequence flows, traffic management, rate limits, and IST timezone handling. |
| [**04. Database Schema & RLS**](./docs/04-DATABASE.md) | 16 PostgreSQL tables, constraints, triggers, RLS policies, and ER diagram. |
| [**05. REST API Reference**](./docs/05-API-REFERENCE.md) | Complete Express 5 endpoint catalog with auth requirements, payload schemas, and responses. |
| [**06. Scheduling Algorithm**](./docs/06-ALGORITHM.md) | Earliest-slot mathematical formulation, 15-min grid snapping, test trace, and complexity. |
| [**07. Security & Threat Model**](./docs/07-SECURITY.md) | 17-threat worst-case matrix, privilege locks, residual risks, and secret rotation runbook. |
| [**08. Zero-to-Running Setup Guide**](./docs/08-SETUP-GUIDE.md) | Beginner-proof local setup, complete environment variable table, and token acquisition. |
| [**09. Vercel & Cloud Deployment**](./docs/09-DEPLOYMENT.md) | Vercel serverless configuration, edge rewrites, instant rollbacks, and keep-alive procedures. |
| [**10. Live Demonstration Script**](./docs/10-DEMO-SCRIPT.md) | 8–10 minute minute-by-minute presentation script with click walkthroughs and backup plans. |
| [**11. Testing & Verification**](./docs/11-TESTING.md) | Vitest test suite inventory (18 tests), concurrency stress script, and rate limit demo. |
| [**12. Reviewer Defense Q&A**](./docs/12-REVIEW-QA.md) | 40+ evaluator questions and honest, technically grounded answers. |
| [**13. Known Limitations & Roadmap**](./docs/13-LIMITATIONS-ROADMAP.md) | Honest prototype boundaries and phased 3-stage campus rollout roadmap. |
| [**14. Operational Troubleshooting**](./docs/14-TROUBLESHOOTING.md) | Diagnostic symptom $\rightarrow$ cause $\rightarrow$ fix table for common setup and demo errors. |
| [**Technical Glossary**](./docs/GLOSSARY.md) | Definitions of RLS, `btree_gist`, signed tetrahedra, STL, Gerber, and Web Speech API. |
| [**Review Cheatsheet**](./docs/REVIEW-CHEATSHEET.md) | 1-page high-density briefing: 10 headline facts, 5 strengths, 5 limitations, and 60s pitch. |
| [**10-Slide Pitch Deck Outline**](./docs/PITCH-OUTLINE.md) | Slide-by-slide outline for the GENESIS hackathon panel presentation. |
| [**Deliverables Checklist**](./docs/CHECKLIST.md) | Full audit checklist of documentation deliverables and automated quality gates. |

---

## 🛠️ Architecture & Technical Stack Summary

* **Frontend:** React 19 (`19.2.8`), Vite 8 (`8.3.4`), Vanilla CSS3 with Amrita Maroon identity tokens (`#A4123F`), Lucide React icons, `react-i18next`.
* **Backend:** Node.js (ESM), Express 5 (`5.3.0`), Helmet security headers, dual-tier rate limiting, and Zod schema validation.
* **Database & Auth:** Supabase PostgreSQL 15 with Row Level Security (RLS), Supabase Auth with `@cb.amrita.edu` college domain verification, and Supabase Realtime WebSocket events.
* **Scheduling:** Earliest-available-resource interval scheduling algorithm ([`server/lib/scheduler.js`](./server/lib/scheduler.js)) with UTC and timezone safety.
* **3D & File Verification:** Client-side binary/ASCII STL parser using signed tetrahedra geometry + server-side magic-byte validator.

For technical stack specifics, see [**TECH_STACK.md**](./TECH_STACK.md).

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm ci
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
DEMO_PASSWORD=YourSecureDemoPassword2026!
```

### 3. Setup Database Schema & Seed Data
Execute the migration scripts located in `supabase/migrations/` in your Supabase SQL editor (Run 001 → 005 in order):
1. `001_init.sql` — Tables, indexes, and `btree_gist` exclusion constraint
2. `002_rls.sql` — Row Level Security policies
3. `003_seed_sample.sql` — Sample innovation labs, resources, and inventory items
4. `004_security_fixes.sql` — Role escalation lock, signup restrictions, and staff write scoping
5. `005_realtime.sql` — Enable Supabase Realtime publication on `facility_bookings`

### 4. Seed Demo Users
Run the user seeding script to provision accounts with the configured `DEMO_PASSWORD`:
```bash
npm run seed:users
```

### 5. Run the Application
Start both the Express backend and the Vite frontend dev server:
```bash
npm run dev:all
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`

---

## 🧪 Testing & Verification

* **Unit Tests (Vitest):**
  ```bash
  npm test
  ```
  Runs 18 unit tests across 3 suites validating scheduler calendar fit, analytics calculations, and Gemini chatbot fallback handling.

* **Concurrency Stress Test:**
  ```bash
  npm run test:concurrency
  ```
  Sends 20 simultaneous booking requests to prove database exclusion constraints and conflict handling.

* **Security Rate Limiter Demo:**
  ```bash
  npm run demo:security
  ```
  Demonstrates Express rate limiting returning HTTP `429 Too Many Requests`.

* **Static Code Analysis:**
  ```bash
  npx oxlint
  npm run build
  ```

---

## 👥 Demo User Personas

All seeded demo accounts authenticate via Supabase Auth with `DEMO_PASSWORD`:

| Role | Email Identifier | Access Privileges |
| :--- | :--- | :--- |
| **Student Innovator** | `student.demo@cb.students.amrita.edu` | Equipment bookings, 3D/PCB job intake, voice assistant, inventory lookup |
| **Faculty Member** | `faculty.demo@cb.amrita.edu` | Classroom reservation, student slot approvals, component orders |
| **Lab In-Charge** | `incharge.demo@cb.amrita.edu` | 3D print/PCB queue management, CSV inventory import, job status transitions |
| **Administrator** | `admin.demo@cb.amrita.edu` | User role management, timetable CSV bulk import, security audit log |

---

## ⚠️ Known Limitations
* **Client-Side File Analysis:** 3D model (.stl) and Gerber (.zip) files are inspected in the browser only (volume/time estimation, magic-byte check); original binary files are not uploaded or stored in cloud storage (uploading originals to Supabase Storage is on the roadmap).
* **Header-Based Content Verification:** `/api/jobs/verify-content` trusts a client-sent header (authenticated and size-capped).
* **Serverless Rate Limiting:** Rate limiting is in-memory per serverless instance rather than globally coordinated via Redis.
* **Supabase Free Tier Inactivity:** Supabase free projects pause after about a week of idle time (must be resumed via the dashboard before demos).

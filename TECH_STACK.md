# 🛠️ Amrita Yukti — Technical Architecture & Stack Specification

**Problem Statement:** Centralized Innovation Facility Booking & Utilization Portal  
**Platform Category:** Campus Facility, Prototyping Equipment & Inventory Hub  
**Institution:** Amrita Vishwa Vidyapeetham  

---

## 1. 🎨 Frontend Tier (Client Interface)

| Component | Technology | Version | Purpose & Architecture Rationale |
| :--- | :--- | :--- | :--- |
| **Core Framework** | **React** | `19.2.8` | High-performance Single Page Application (SPA) leveraging modern React 19 hooks (`useState`, `useEffect`, `useCallback`, `useRef`). |
| **Build Engine & Bundler** | **Vite** | `8.3.4` | Native ECMAScript Modules (ESM) with instant Hot Module Replacement (HMR) and production chunk optimization. |
| **Styling & Design System** | **Vanilla CSS3** | Custom | Amrita maroon design tokens (`--amrita-maroon: #A4123F`, `#7A0C2E`), clean cards, fluid typography, and sub-second First Contentful Paint. |
| **Authentication Client** | **Supabase Auth** | `v2.117.3` | JWT session handling with strict college domain enforcement (`@cb.amrita.edu`, `@cb.students.amrita.edu`). No hardcoded passwords. |
| **Realtime Subscriptions** | **Supabase Realtime** | Native | WebSocket postgres-change subscriptions on `facility_bookings` enabling instant cross-device updates between students and faculty. |
| **Client-Side Slicing & 3D Math** | **Signed Tetrahedra Math** | In-House | Direct binary and ASCII STL volume and print time estimation in the browser using signed tetrahedron mesh decomposition without heavy WASM or external slicers. |
| **Client-Side Fuzzy Search** | **Fuse.js** | `7.5.0` | Sub-millisecond component inventory searching by keyword, drawer location, or lab name. |
| **Multilingual UI (i18n)** | **react-i18next** | `15.4.1` | Localized campus interface supporting English, Tamil (தமிழ்), Hindi (हिन्दी), and Malayalam (മലയാളം). |
| **Iconography** | **Lucide React** | `1.55.0` | Tree-shaken SVG icon primitives. |

---

## 2. ⚡ Backend Tier (Express 5 REST API)

| Component | Technology | Version | Purpose & Architecture Rationale |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | **Node.js** | `v20+ LTS` | Server-side JavaScript runtime with native ES Modules (`"type": "module"`). |
| **Web Server** | **Express.js** | `5.3.0` | Next-generation Express 5 kernel with native async/await error propagation and modular sub-routers. |
| **Security Headers** | **Helmet** | `8.3.0` | Injects protective HTTP headers (CSP, HSTS, X-Content-Type-Options). |
| **Rate Limiting** | **express-rate-limit** | `8.7.1` | DoS protection with standard limiter (120 req/min) and sensitive endpoints limiter (10 req/min). |
| **CORS Policy** | **CORS** | `2.8.6` | Configured with strict origin allowlist preventing cross-site scripting abuses. |
| **Schema Validation** | **Zod** | `3.24.2` | Runtime request body validation on CSV uploads, bookings, and purchase orders. |
| **Audit Logging** | **Custom Service Helper** | In-House | Records state changes and security events in the immutable `audit_log` table. |

---

## 3. 🗓️ Scheduling Engine & Concurrency Control

| Module | Implementation | Description |
| :--- | :--- | :--- |
| **Interval Scheduler Algorithm** | `server/lib/scheduler.js` | Deterministic earliest-available-resource interval scheduling. Given a job duration and equipment type, iterates through available lab machines, filters out existing bookings and maintenance blocks, and returns the next contiguous slot in constant time. |
| **Concurrency Guarantees** | **PostgreSQL `btree_gist` Exclusion Constraint** | Database-level guarantee on `facility_bookings`: `EXCLUDE USING gist (resource_id WITH =, tstzrange(start_time, end_time) WITH &&)`. Simultaneous requests for the same slot return an immediate `409 Conflict` along with alternative slots. |
| **Unit Test Coverage** | **Vitest** | Comprehensive unit tests in `server/tests/scheduler.test.js` validating empty calendars, exact slot fits, maintenance windows, and boundary conditions. |

---

## 4. 🗄️ Database & Storage Tier

| Tier Component | Engine | Specifications |
| :--- | :--- | :--- |
| **Relational Database** | **Supabase (PostgreSQL 15)** | Normalized schema for `profiles`, `labs`, `resources`, `certifications`, `inventory_items`, `jobs`, `facility_bookings`, `room_bookings`, `purchase_requests`, and `audit_log`. |
| **Row Level Security (RLS)** | **Postgres RLS Policies** | Role-based policies enforcing tenant privacy. Students can only view their own bookings; faculty and lab in-charges can review departmental requests; admins have management access. |
| **File Storage** | **Supabase Storage** | Direct upload bucket (`innovation-assets`) for 3D model files (`.stl`), PCB Gerber archives (`.zip`), and project attachments. Direct storage uploads bypass server memory bottlenecks. |
| **File Integrity Inspection** | `server/lib/fileRouter.js` | Magic-byte file validation (`solid`/binary STL header inspection) and ZIP-bomb protection (uncompressed size limits) preventing malicious uploads. |

---

## 5. 🤖 Lightweight Grounded Assistant & Voice Engine

| Module | Implementation | Description |
| :--- | :--- | :--- |
| **Chatbot Architecture** | **Rule / Slot / Template Engine** | Deterministic intent extraction grounded directly in live Postgres lab data (drawer components, 3D printer queue, room occupancy). No large local models or tunnel bridges required. |
| **Voice Interface** | **Web Speech API** | Hands-free speech recognition (`SpeechRecognition`) and synthesized speech feedback (`speechSynthesis`) in the browser. |
| **Multilingual Support** | **Unicode Script Detection** | Automatic language detection routing queries to localized response templates in English, Tamil, Hindi, and Malayalam. |
| **Optional LLM Fallback** | **Google Gemini REST API** | Lightweight optional server-side fallback (`GEMINI_API_KEY`) for conversational queries when configured. |

---

## 6. 🌐 DevOps, Deployment & Verification

* **Deployment Target:** **Vercel** serverless hosting ready via `api/index.js` and `vercel.json` rewrite routing.
* **Concurrency Stress Testing:** `scripts/concurrency-test.mjs` verifying exclusion constraint under 20 simultaneous booking requests.
* **Rate Limiter Demonstration:** `scripts/brute-force-demo.mjs` confirming `429 Too Many Requests` behavior under stress.
* **Code Quality & Linting:** `npm run lint` (`oxlint`) and `npm test` (`vitest`).

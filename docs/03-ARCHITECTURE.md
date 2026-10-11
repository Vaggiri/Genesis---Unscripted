# 03 — System Architecture & Technical Specifications

This document defines the architectural topology, request lifecycles, network traffic management, and data access tiers of **Amrita Yukti**.

---

## 1. End-to-End System Topology

```mermaid
graph TB
    subgraph Client ["Client Tier (Browser)"]
        UI["React 19 SPA (Vite 8)"]
        WSClient["Supabase Realtime Client (WebSocket)"]
        Speech["Web Speech API (STT / TTS)"]
        Slicer["Client-Side Slicing & Mesh Math"]
    end

    subgraph Hosting ["Edge & Compute (Vercel Serverless)"]
        CDN["Vercel Global Edge CDN (Static HTML/JS/CSS)"]
        API["Serverless Function (api/index.js)"]
        Express["Express 5 REST Engine"]
        Middlewares["Helmet + CORS + Rate Limiters + Auth Guard"]
    end

    subgraph Database ["Data & Auth Tier (Supabase Cloud)"]
        Auth["Supabase Auth (JWT Engine)"]
        Postgres[("PostgreSQL 15 Database")]
        Exclusion["btree_gist Exclusion Constraints"]
        RLS["Row Level Security Policies"]
        RealtimePub["supabase_realtime Publication"]
    end

    subgraph External ["Optional External Services"]
        Gemini["Google Gemini REST API (gemini-2.5-flash)"]
    end

    UI -->|Static Asset Fetch| CDN
    UI -->|REST Calls /api/* with Bearer JWT| API
    API --> Express
    Express --> Middlewares
    Middlewares -->|HTTPS Client via Service Role| Postgres
    Middlewares -->|Verify JWT Claims| Auth
    Middlewares -->|Optional Intent Fallback via x-goog-api-key| Gemini
    UI <-->|WebSocket wss://*.supabase.co| RealtimePub
    RealtimePub -->|Event Stream on facility_bookings| Postgres
```

---

## 2. Codebase Layer Structure

| Directory | Layer Purpose | Key Files & Responsibilities |
| :--- | :--- | :--- |
| `src/components/` | UI Presentation & Views | Modular React components for each portal view (`StudentPortal.jsx`, `FacultyPortal.jsx`, `AdminPortal.jsx`, `JobQueue.jsx`, `ClassroomOccupancyModule.jsx`, `VoiceChatBot.jsx`). |
| `src/services/` | API Abstraction | `api.js`: Centralized Axios/fetch client attaching Supabase session tokens, handling errors, and routing to `/api/*`. |
| `src/context/` | Global State Management | `AuthContext.jsx`: Session persistence, role distribution, and domain enforcement. |
| `src/hooks/` | Reusable React Hooks | `useBookings.js`: Supabase Realtime channel subscription with automatic 20-second polling fallback. |
| `src/i18n/` | Localization Engine | `index.js`, `en.json`, `ta.json`, `hi.json`, `ml.json`: Multilingual translation tables. |
| `server/routes/` | API Endpoints | Modular Express 5 sub-routers (`bookings.js`, `inventory.js`, `jobs.js`, `rooms.js`, `chat.js`, `analytics.js`, `admin.js`). |
| `server/lib/` | Core Business Logic | Pure algorithms and helpers: `scheduler.js` (interval allocation), `chatEngine.js` (NLP & Gemini), `fileRouter.js` (magic bytes), `time.js` (IST calculations), `supabase.js` (client & audit logging). |
| `server/middleware/` | Security & Auth | `auth.js` (`requireAuth`, `requireRole`), `security.js` (Helmet, CORS, rate limiters). |
| `supabase/migrations/` | Database Schema & SQL | `001_init.sql` $\rightarrow$ `005_realtime.sql`: DDL, RLS, triggers, indexes, and Realtime publications. |
| `scripts/` | Testing & Seeding CLI | `seed-demo-users.mjs` (demo provisioning), `concurrency-test.mjs` (20-worker race), `brute-force-demo.mjs` (rate limit test). |

---

## 3. Detailed Request Lifecycles (Sequence Diagrams)

### 3.1 Authentication & Role Derivation Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Staff
    participant UI as React Client
    participant Auth as Supabase Auth
    participant DB as PostgreSQL (handle_new_user)
    
    User->>UI: Enter email (@cb.students.amrita.edu) & password
    UI->>Auth: signInWithPassword({ email, password })
    Auth->>DB: Check auth.users & verify password hash
    Note over DB: On signup, trigger validates @cb.* domain<br/>and inserts profile with role='student'
    Auth-->>UI: Return Session Object (access_token JWT)
    UI->>DB: Fetch public.profiles where id = auth.uid()
    DB-->>UI: Return Profile { role, full_name, roll_no }
    UI->>UI: Store session in AuthContext & render role view
```

### 3.2 Equipment Booking & Concurrency Conflict Flow
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Student Portal
    participant API as Express API (/api/bookings)
    participant DB as Supabase PostgreSQL
    
    Student->>UI: Select Bambu Lab X1 (10:00 - 11:00 AM)
    UI->>API: POST /api/bookings (Bearer JWT, resource_id, start_ts, end_ts)
    API->>API: Validate input (Zod), verify role ('student'), check 5-booking cap
    API->>DB: INSERT INTO facility_bookings (status: 'pending')
    
    alt Slot is Open
        DB-->>API: 201 Created (Row inserted)
        API->>DB: INSERT INTO audit_log (action: 'BOOKING_CREATED')
        API-->>UI: 201 Created { success: true, booking }
    else Slot is Already Booked (Concurrent Request Race)
        DB-->>API: Error 23P01: exclusion_violation
        API->>API: Run findEarliestSlot() for next open slots
        API-->>UI: 409 Conflict { error: 'slot_taken', alternatives: [...] }
        UI-->>Student: Display conflict toast with 1-click alternative slots
    end
```

### 3.3 Slot Approval & Realtime Push Flow
```mermaid
sequenceDiagram
    autonumber
    actor Faculty
    actor Student
    participant FacUI as Faculty Portal
    participant API as Express API (/api/bookings/:id)
    participant DB as Supabase PostgreSQL
    participant RT as Supabase Realtime (WebSocket)
    participant StudUI as Student Portal
    
    Faculty->>FacUI: Click "Approve Booking"
    FacUI->>API: PATCH /api/bookings/:id { status: 'approved' }
    API->>API: Verify caller is faculty/in-charge & not own booking
    API->>DB: UPDATE facility_bookings SET status='approved' WHERE id=:id AND status='pending'
    DB-->>API: 200 OK (Updated row)
    API->>DB: INSERT INTO audit_log (action: 'BOOKING_APPROVED')
    API-->>FacUI: 200 OK { success: true }
    
    DB->>RT: WAL change detected on facility_bookings
    RT->>StudUI: Push postgres_changes UPDATE event (user_id = student.id)
    StudUI->>StudUI: useBookings hook triggers fetchBookings()
    StudUI-->>Student: UI badge turns green: "Approved" (No page refresh)
```

### 3.4 Client-Side File Inspection Flow
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as JobQueue.jsx
    participant Slicer as In-Browser STL Parser
    participant API as Express API (/api/jobs)
    participant DB as PostgreSQL
    
    Student->>UI: Drag and drop "bracket.stl" (5 MB)
    UI->>Slicer: Read File ArrayBuffer in browser memory
    Note over Slicer: Signed tetrahedra math decomposes facets.<br/>Computes volume: 34.2 cm3, est print: 110 min.<br/>Inspects first 80 bytes for binary/ASCII headers.
    Slicer-->>UI: Return { volumeCm3: 34.2, estMinutes: 110, detectedType: 'print_3d' }
    Student->>UI: Click "Submit Fabrication Request"
    UI->>API: POST /api/jobs (Metadata + estimates only, no heavy file upload)
    API->>DB: INSERT INTO jobs (status: 'submitted', est_minutes: 110, ...)
    DB-->>API: 201 Created
    API-->>UI: 201 Created { success: true, job }
```

### 3.5 Multilingual Chatbot Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant BotUI as VoiceChatBot.jsx
    participant Engine as server/lib/chatEngine.js
    participant DB as Supabase PostgreSQL
    participant Gemini as Google Gemini API
    
    User->>BotUI: Voice or text: "10k resistor enga irukku?" (Tamil query)
    BotUI->>Engine: POST /api/chat { message, preferredLanguage: 'ta' }
    Engine->>Engine: detectLanguage() identifies Tamil script
    Engine->>Engine: Run regex & keyword rules for known intent ('inventory_search')
    
    alt Rule Matches Intent
        Engine->>DB: SELECT * FROM inventory_items WHERE name ILIKE '%resistor%'
        DB-->>Engine: Found: "Drawer D-04 / Bin 12"
        Engine->>Engine: Render localized Tamil template
        Engine-->>BotUI: "10k resistor Drawer D-04 / Bin 12-il ulladhu."
    else Ambiguous Query & GEMINI_API_KEY Configured
        Engine->>Gemini: POST /models/gemini-2.5-flash:generateContent (Header: x-goog-api-key)
        Gemini-->>Engine: Classified Intent: "room_search"
        Engine->>DB: Query free rooms
        Engine-->>BotUI: Localized response with room numbers
    else Gemini Fails or No Key Set
        Engine-->>BotUI: Fallback to grounded rule-based answer
    end
    BotUI->>BotUI: Speak response via window.speechSynthesis
```

---

## 4. Network Traffic Management & Scalability

1. **Edge CDN Distribution:** All client assets (HTML, CSS, JS bundles, icons) are served via Vercel's global Anycast Edge Network, ensuring instant static delivery and zero compute overhead for page loads.
2. **Serverless Scalability:** Backend endpoints operate as stateless Vercel Serverless Functions (`api/index.js`), auto-scaling on demand from zero to handle registration spikes and slot opening rushes.
3. **Dual Tier Rate Limiting (`express-rate-limit`):**
   * **Standard Limiter:** 120 requests / minute per client IP across all regular endpoints.
   * **Sensitive Limiter:** 25 requests / minute per client IP applied to `/api/chat` and `/api/ai/chat` to prevent denial-of-service and LLM quota exhaustion.
   * *Architecture Note:* On serverless infrastructure, in-memory rate limiting applies per serverless instance. `app.set('trust proxy', 1)` is enabled to ensure the correct client IP is evaluated behind reverse proxies.
4. **Request Body Caps:** `express.json({ limit: '100kb' })` prevents memory exhaustion attacks from oversized JSON payloads.
5. **Database-Side Indexing:**
   * Compound index on `facility_bookings (resource_id, start_ts, end_ts)`.
   * GIST index on `facility_bookings USING gist (resource_id WITH =, tstzrange(start_ts, end_ts) WITH &&)`.
   * Unique natural key index on `inventory_items (lab_id, item_key)`.
6. **Lazy No-Show Release:** Rather than maintaining a memory-intensive background polling daemon, `autoReleaseNoShows()` runs lazily on booking queries, checking if approved slots started >15 minutes ago with no check-in, freeing them automatically.
7. **Free-Tier Constraints & Mitigations:**
   * **Supabase Free Tier:** Inactive projects pause after approximately 7 days of inactivity. *Mitigation:* The team wakes the project prior to reviews.
   * **Realtime Connection Limits:** Free tier supports up to 200 concurrent WebSocket connections. *Mitigation:* The `useBookings` hook terminates channels cleanly on unmount (`removeChannel`) and falls back to polling if WebSocket quota is reached.

---

## 5. Data Access & Visibility Matrix

| Entity / Table | `student` | `faculty` | `lab_incharge` | `admin` |
| :--- | :---: | :---: | :---: | :---: |
| **`public.profiles`** | Own row only | Own row + student names | Own row + lab students | All profiles |
| **`public.facility_bookings`** | Own bookings only | Department bookings | Lab bookings | All bookings |
| **`public.jobs`** | Own jobs only | Department jobs | Lab jobs | All jobs |
| **`public.inventory_items`** | View catalogue | View catalogue | View & Import (assigned lab) | Full CRUD |
| **`public.classrooms`** | View status | View status | View status | Manage & Unflag |
| **`public.timetables`** | View schedules | View schedules | View schedules | Bulk Import CSV |
| **`public.occupancy_reports`** | Submit report | View all & submit | View all & submit | Moderate & Resolve |
| **`public.room_bookings`** | View schedule | Book & Cancel own | View schedule | Full CRUD |
| **`public.purchase_requests`** | ❌ Forbidden | Create & View own | Create & View own | Approve / Reject |
| **`public.audit_log`** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | Read-only access |

---

## 6. Timezone Architecture (UTC vs. IST)

* **Server Runtime:** Node.js executes in UTC standard time on Vercel and local environments (`new Date().toISOString()`).
* **Database Storage:** All timestamp columns use PostgreSQL `TIMESTAMPTZ` (`TIMESTAMP WITH TIME ZONE`), standardizing on ISO 8601 UTC representation (`YYYY-MM-DDTHH:mm:ss.sssZ`).
* **Campus Business Hours (IST):** Amrita Coimbatore operates in Indian Standard Time (`UTC+05:30`, offset `330` minutes).
* **Time Conversion Module ([`server/lib/time.js`](file:///d:/Project/Hackathon/server/lib/time.js)):**
  * `istNow()`: Converts current UTC instant to IST day name (`Monday`), IST date string (`YYYY-MM-DD`), and IST clock time (`HH:mm`).
  * `istDayBounds(dateStr)`: Computes UTC start/end boundaries for an IST calendar day so database queries filter accurately without timezone slippage.
  * `tzOffsetMin: 330` in [`server/lib/scheduler.js`](file:///d:/Project/Hackathon/server/lib/scheduler.js): Ensures 08:30–17:30 working hours are strictly applied in Coimbatore local time.

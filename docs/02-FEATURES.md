# 02 — Features Breakdown by Role

This document details every implemented feature in **Amrita Yukti**, mapping each capability directly to its source code files, API routes, and user interface workflows.

---

## 1. Feature Matrix by Role

| Feature Category | Student Innovator | Faculty Member | Lab In-Charge | Administrator | Code Files |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Drawer Hardware Search** | Read Only | Read Only | Read & Import | Full Access | `src/components/InventorySearch.jsx`<br>`server/routes/inventory.js` |
| **Earliest-Slot Scheduling** | Book & View | View & Approve | Manage Queue | Full Access | `server/lib/scheduler.js`<br>`server/routes/bookings.js` |
| **3D / Gerber File Intake** | Inspect & Submit | View | Queue Status | Full Access | `src/components/JobQueue.jsx`<br>`server/lib/fileRouter.js` |
| **Realtime Live Updates** | Own Bookings | Department Desk | Lab Bookings | All Bookings | `src/hooks/useBookings.js`<br>`005_realtime.sql` |
| **Classroom Space Radar** | View & Report | View, Report, Book | View & Report | Moderate & Unflag | `src/components/ClassroomOccupancyModule.jsx`<br>`server/routes/rooms.js` |
| **Multilingual Voice Bot** | Active Use | Active Use | Active Use | Active Use | `src/components/VoiceChatBot.jsx`<br>`server/lib/chatEngine.js` |
| **Inventory CSV Bulk Import** | ❌ | ❌ | Allowed (own lab) | Full Access | `src/components/InventoryUpload.jsx`<br>`server/routes/inventory.js` |
| **Timetable CSV Import** | ❌ | ❌ | ❌ | Allowed | `src/components/AdminPortal.jsx`<br>`server/routes/admin.js` |
| **Role Management** | ❌ | ❌ | ❌ | Allowed | `src/components/AdminPortal.jsx`<br>`server/routes/admin.js` |
| **Audit Log Viewing** | ❌ | ❌ | ❌ | Allowed | `src/components/AdminPortal.jsx`<br>`server/routes/admin.js` |
| **Utilization Analytics** | ❌ | View | View | View | `src/components/UtilizationDashboard.jsx`<br>`server/routes/analytics.js` |

---

## 2. Student Innovator Features (`role === 'student'`)

### 2.1 Hardware Component & Drawer Stock Lookup
* **UI Component:** [`src/components/InventorySearch.jsx`](file:///d:/Project/Hackathon/src/components/InventorySearch.jsx)
* **Backend Endpoint:** `GET /api/inventory?search=&lab=&category=`
* **Capabilities:**
  * Sub-millisecond client-side fuzzy searching using Fuse.js across component names, part numbers, and categories.
  * Direct drawer locator display (e.g., `Drawer D-04 / Bin 12`, `Drawer R-01 / Tray A`).
  * **Stale Audit Alert:** Automatically flags items with `>30 Days Since Audit` badge if `updated_at` is older than 30 days (`Date.now() - 30 * 86400000`).

### 2.2 Prototyping File Intake & 3D Volume Estimation
* **UI Component:** [`src/components/JobQueue.jsx`](file:///d:/Project/Hackathon/src/components/JobQueue.jsx)
* **Backend Endpoint:** `POST /api/jobs`, `POST /api/jobs/verify-content`
* **Capabilities:**
  * Drag-and-drop intake for `.stl` (3D print) and `.zip` (PCB Gerber) files.
  * **Client-Side Slicing Math:** Inspects binary and ASCII STL files in-memory using signed tetrahedron decomposition to calculate cubic centimetre volume ($cm^3$) and print duration estimates without sending binary payloads to a server.
  * **Pre-Flight Type Check:** Detects extension and magic-byte mismatches (e.g., user selects "PCB Mill" but uploads `.stl`), presenting a warning banner before submission.
  * Metadata and duration estimates are saved to PostgreSQL via `POST /api/jobs`.

### 2.3 Intelligent Machine Booking & Conflict Handling
* **UI Component:** [`src/components/StudentPortal.jsx`](file:///d:/Project/Hackathon/src/components/StudentPortal.jsx)
* **Backend Endpoint:** `POST /api/bookings/suggest`, `POST /api/bookings`
* **Capabilities:**
  * Suggests earliest open slot across available machines for requested duration (e.g., 60 to 480 mins).
  * Automatically checks safety certification prerequisites (`public.certifications`).
  * Enforces a 5-active-booking cap per student to prevent machine hoarding.
  * Realtime status badge (`pending` $\rightarrow$ `approved` $\rightarrow$ `completed`).

### 2.4 Hands-Free Multilingual Voice Assistant
* **UI Component:** [`src/components/VoiceChatBot.jsx`](file:///d:/Project/Hackathon/src/components/VoiceChatBot.jsx)
* **Backend Endpoint:** `POST /api/chat` (mounted also on `/api/ai/chat`)
* **Capabilities:**
  * Uses browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) with synthetic voice responses (`speechSynthesis`).
  * Supports English, Tamil (தமிழ்), Hindi (हिन्दी), and Malayalam (മലയാളം).
  * Detects language automatically via Unicode script ranges and routes queries to deterministic templates grounded in live database queries (drawer locations, printer status, free rooms).

---

## 3. Faculty Member Features (`role === 'faculty'`)

### 3.1 Slot Approval Desk
* **UI Component:** [`src/components/FacultyApprovalsView.jsx`](file:///d:/Project/Hackathon/src/components/FacultyApprovalsView.jsx)
* **Backend Endpoint:** `GET /api/innovation/bookings`, `PATCH /api/bookings/:id`
* **Capabilities:**
  * Displays pending student booking requests across labs.
  * One-click **Approve** or **Reject** actions.
  * State transition protection prevents approving already-approved or cancelled bookings.
  * Realtime updates reflect approvals across all connected client tabs instantly.

### 3.2 Classroom Space Radar & Ad-Hoc Room Booking
* **UI Component:** [`src/components/ClassroomOccupancyModule.jsx`](file:///d:/Project/Hackathon/src/components/ClassroomOccupancyModule.jsx)
* **Backend Endpoint:** `GET /api/rooms/free`, `POST /api/room-bookings`, `GET /api/room-bookings/mine`
* **Capabilities:**
  * Shows real-time campus room occupancy matrix across Academic Blocks (AB-1, AB-2).
  * Finds free rooms for any given date and timetable slot (Slot 1 to 8).
  * One-click faculty room reservation with automatic timetable conflict validation (rejects with `409 Conflict` if room is occupied by a scheduled lecture).
  * View and cancel faculty's own reserved slots.

### 3.3 Procurement / Component Purchase Requests
* **UI Component:** [`src/components/FacultyPortal.jsx`](file:///d:/Project/Hackathon/src/components/FacultyPortal.jsx)
* **Backend Endpoint:** `GET /api/inventory/purchase-requests`, `POST /api/inventory/purchase-requests`
* **Capabilities:**
  * Submit procurement requests for depleted or specialized lab components.
  * Tracks request status (`pending` $\rightarrow$ `ordered` $\rightarrow$ `received`).

---

## 4. Lab In-Charge Features (`role === 'lab_incharge'`)

### 4.1 FabLab Work Order Queue Management
* **UI Component:** [`src/components/JobQueue.jsx`](file:///d:/Project/Hackathon/src/components/JobQueue.jsx)
* **Backend Endpoint:** `PATCH /api/jobs/:id`
* **Capabilities:**
  * Manage fabrication pipeline: `submitted` $\rightarrow$ `queued` $\rightarrow$ `in_progress` $\rightarrow$ `done`.
  * Adjust estimated print/mill duration based on slicing review.
  * Reject invalid or safety-violating submissions with audit logging.

### 4.2 CSV Bulk Inventory Import & Natural Key Deduplication
* **UI Component:** [`src/components/InventoryUpload.jsx`](file:///d:/Project/Hackathon/src/components/InventoryUpload.jsx)
* **Backend Endpoint:** `POST /api/inventory/import`
* **Capabilities:**
  * Upload CSV files (e.g., [`public/sample-inventory.csv`](file:///d:/Project/Hackathon/public/sample-inventory.csv)) containing headers `name,part_no,category,quantity,location`.
  * Generates stable natural key `item_key = lower(trim(part_no || name))`.
  * Idempotently upserts rows with PostgreSQL `ON CONFLICT (lab_id, item_key) DO UPDATE`, preventing duplicate entries.
  * Restricts in-charge imports strictly to the lab assigned to them in `public.labs.incharge_id`.

---

## 5. Administrator Features (`role === 'admin'`)

### 5.1 User Role Management
* **UI Component:** [`src/components/AdminPortal.jsx`](file:///d:/Project/Hackathon/src/components/AdminPortal.jsx)
* **Backend Endpoint:** `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`
* **Capabilities:**
  * View all registered campus profiles.
  * Promote or demote user roles (`student`, `faculty`, `lab_incharge`, `admin`).
  * Backed by database trigger `guard_profile_update` which prevents non-admins from altering roles.

### 5.2 Timetable Master Bulk Import
* **UI Component:** [`src/components/AdminPortal.jsx`](file:///d:/Project/Hackathon/src/components/AdminPortal.jsx)
* **Backend Endpoint:** `POST /api/admin/timetables/import`
* **Capabilities:**
  * Ingest full campus timetable schedules via CSV (room, day of week, slot, subject, department, batch, faculty).
  * Populates `public.timetables` for accurate automated space radar occupancy calculations.

### 5.3 Crowdsourced Report Moderation & Unflagging
* **UI Component:** [`src/components/AdminPortal.jsx`](file:///d:/Project/Hackathon/src/components/AdminPortal.jsx)
* **Backend Endpoint:** `POST /api/admin/classrooms/:id/unflag`, `POST /api/admin/reports/:id/resolve`
* **Capabilities:**
  * Rooms flagged with persistent unannounced occupancy ($\ge 2$ reports within a 7-day window) appear in the moderation queue.
  * Admin can verify the takeover, resolve reports, and unflag the room back to normal timetable status.

### 5.4 Immutable Security Audit Log
* **UI Component:** [`src/components/AdminPortal.jsx`](file:///d:/Project/Hackathon/src/components/AdminPortal.jsx)
* **Backend Endpoint:** `GET /api/admin/audit-log`
* **Capabilities:**
  * Chronological ledger of all system events: `BOOKING_CREATED`, `BOOKING_APPROVED`, `JOB_SUBMITTED`, `INVENTORY_IMPORTED`, `ADMIN_UPDATE_USER_ROLE`.
  * Direct client inserts to `public.audit_log` are revoked; only the server service-role key can write audit records.

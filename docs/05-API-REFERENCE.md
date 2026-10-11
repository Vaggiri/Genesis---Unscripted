# 05 — REST API Reference

All backend routes are implemented in Express 5 and mounted dual-path on both `/api/*` and `/*` in [`server/server.js`](file:///d:/Project/Hackathon/server/server.js) to support both the Vite local development proxy and Vercel serverless rewrites.

---

## 1. Global Middleware & Route Conventions

* **Authentication:** Sent via HTTP header `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`.
* **Rate Limits:**
  * **Standard Limiter:** 120 req / min across all endpoints.
  * **Sensitive Limiter:** 25 req / min applied strictly to Chat endpoints (`/api/chat`, `/api/ai/chat`).
* **Request Body Cap:** `100kb` application/json maximum.
* **Dual-Mounted Route Aliases:**
  * Chat router is mounted at both `/api/chat` and `/api/ai/chat` (legacy backward-compatibility).
  * Room router is mounted at both `/api/rooms` and `/api/room-bookings`.

---

## 2. Core Campus & System Endpoints (`server/server.js`)

### `GET /api/health`
* **Auth:** None (Public)
* **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-11T12:00:00.000Z",
    "supabase_configured": true
  }
  ```

### `GET /api/settings`
* **Auth:** None (Public read)
* **Response (200 OK):**
  ```json
  {
    "id": "campus_config",
    "campus_name": "Amrita Vishwa Vidyapeetham — Coimbatore",
    "active_semester": "Even Semester 2026",
    "flag_threshold": 2,
    "banner_message": "📢 Real-time Classroom & Lab Occupancy live.",
    "banner_active": true,
    "allow_student_reporting": true
  }
  ```

### `PUT /api/settings`
* **Auth:** Required | **Roles:** `admin`
* **Body:** JSON object with configuration updates.
* **Response (200 OK):** `{ "success": true, "settings": { ... } }`

### `GET /api/classrooms`
* **Auth:** None (Public)
* **Query Parameters:**
  * `day` (optional string): e.g. `'Monday'`
  * `time` (optional HH:mm string): e.g. `'10:30'`
* **Response (200 OK):**
  ```json
  {
    "simulated_context": { "day": "Monday", "time": "10:30" },
    "classrooms": [
      {
        "id": "AB1-101",
        "room_number": "101",
        "block": "AB-1",
        "floor": 1,
        "capacity": 65,
        "status": "Occupied",
        "current_lecture": { "subject": "Data Structures", "batch": "CSE-A", "faculty": "Dr. Ramesh" }
      }
    ]
  }
  ```

### `GET /api/timetables`
* **Auth:** None (Public)
* **Query Parameters:** `roomId` (optional)
* **Response (200 OK):** Array of scheduled lecture records from `public.timetables`.

### `GET /api/reports`
* **Auth:** Required | **Roles:** `faculty`, `lab_incharge`, `admin`
* **Response (200 OK):** Array of crowdsourced occupancy reports.

### `POST /api/reports`
* **Auth:** Required | **Roles:** Any authenticated role
* **Body:**
  ```json
  {
    "room_id": "AB1-102",
    "report_type": "unscheduled_occupancy",
    "reported_batch": "Club Session",
    "reported_department": "Robotics Club",
    "is_lab_class": false,
    "purpose": "Hardware testing before expo",
    "occupancy_level": "Full"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "report": { "id": 14, "room_id": "AB1-102", "status": "active" },
    "total_active_reports": 2,
    "is_permanently_flagged": true
  }
  ```

---

## 3. Equipment & Facility Bookings (`server/routes/bookings.js`)

### `GET /api/resources`
* **Auth:** None (Public)
* **Query Parameters:** `lab` (optional lab_id)
* **Response (200 OK):** Array of active machines and workstations with lab details.

### `GET /api/availability`
* **Auth:** Required | **Roles:** Any
* **Query Parameters:** `resourceId` (required), `date` (YYYY-MM-DD, defaults to IST today)
* **Response (200 OK):** `{ "resourceId": "res-3d-bambu-x1", "date": "2026-10-15", "bookings": [...] }`

### `POST /api/bookings/suggest`
* **Auth:** Required | **Roles:** Any
* **Body:**
  ```json
  {
    "resourceId": "res-3d-bambu-x1",
    "kind": "printer_3d",
    "durationMin": 120,
    "notBefore": "2026-10-15T09:00:00.000Z"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "best": {
      "resourceId": "res-3d-bambu-x1",
      "start": "2026-10-15T09:00:00.000Z",
      "end": "2026-10-15T11:00:00.000Z"
    },
    "alternatives": [...]
  }
  ```

### `POST /api/bookings`
* **Auth:** Required | **Roles:** Any
* **Body:**
  ```json
  {
    "resource_id": "res-3d-bambu-x1",
    "start_ts": "2026-10-15T10:00:00.000Z",
    "end_ts": "2026-10-15T11:30:00.000Z",
    "purpose": "Drone mount printing",
    "job_id": "job-1728..."
  }
  ```
* **Response (201 Created):** `{ "success": true, "booking": { ... } }`
* **Error (409 Conflict):**
  ```json
  {
    "error": "slot_taken",
    "message": "The requested slot conflicts with an existing booking.",
    "alternatives": [
      { "resourceId": "res-3d-prusa-mk4", "start": "...", "end": "..." }
    ]
  }
  ```

### `PATCH /api/bookings/:id`
* **Auth:** Required | **Roles:** Owner can cancel; `faculty`, `lab_incharge`, `admin` can approve/reject.
* **Body:** `{ "status": "approved" }` (Allowed: `approved`, `rejected`, `cancelled`, `completed`, `no_show`)
* **Response (200 OK):** `{ "success": true, "booking": { ... } }`

### `POST /api/bookings/:id/checkin`
* **Auth:** Required | **Roles:** Owner only (opens 10 mins before start)
* **Response (200 OK):** `{ "success": true, "message": "Checked in successfully" }`

### `GET /api/innovation/bookings`
* **Auth:** Required | **Roles:** Students see own; staff see department bookings.
* **Response (200 OK):** Array of formatted booking items with student names and slot times.

---

## 4. Hardware Inventory (`server/routes/inventory.js`)

### `GET /api/inventory`
* **Auth:** None (Public)
* **Query Parameters:** `search`, `lab`, `category`
* **Response (200 OK):** Array of inventory items with drawer locations.

### `POST /api/inventory/import`
* **Auth:** Required | **Roles:** `lab_incharge` (own lab only), `admin`
* **Body:**
  ```json
  {
    "lab_id": "lab-pcb-eda",
    "filename": "stock-oct2026.csv",
    "items": [
      {
        "name": "100uF Electrolytic Capacitor",
        "part_no": "CAP-100U-50V",
        "category": "Passives",
        "quantity": 250,
        "location": "Drawer C-02 / Bin 4"
      }
    ]
  }
  ```
* **Response (200 OK):** `{ "success": true, "count": 1, "message": "Successfully imported 1 inventory records." }`

### `GET /api/inventory/purchase-requests`
* **Auth:** Required | **Roles:** `faculty`, `lab_incharge`, `admin`
* **Response (200 OK):** Array of procurement requests.

### `POST /api/inventory/purchase-requests`
* **Auth:** Required | **Roles:** `faculty`, `lab_incharge`, `admin`
* **Body:** `{ "lab_id": "lab-fablab", "item": "PLA+ White Filament Spool 1kg", "qty": 5, "reason": "Low stock" }`
* **Response (201 Created):** `{ "success": true, "request": { ... } }`

---

## 5. Prototyping File Intake (`server/routes/jobs.js`)

### `GET /api/jobs`
* **Auth:** Required | **Roles:** Students see own; staff see lab jobs.
* **Response (200 OK):** Array of submitted job records.

### `POST /api/jobs`
* **Auth:** Required | **Roles:** Any
* **Body:**
  ```json
  {
    "kind": "print_3d",
    "title": "Robotics Chassis Bracket",
    "file_name": "chassis.stl",
    "file_ext": "stl",
    "est_minutes": 95,
    "est_material_g": 38.5,
    "params": { "infill": "20%", "layerHeight": "0.2mm" },
    "lab_id": "lab-fablab"
  }
  ```
* **Response (201 Created):** `{ "success": true, "job": { ... } }`

### `PATCH /api/jobs/:id`
* **Auth:** Required | **Roles:** `faculty`, `lab_incharge`, `admin`
* **Body:** `{ "status": "in_progress", "est_minutes": 100 }`
* **Response (200 OK):** `{ "success": true, "job": { ... } }`

### `POST /api/jobs/verify-content`
* **Auth:** Required | **Roles:** Any
* **Body:** `{ "kind": "print_3d", "base64Header": "<base64_encoded_first_4kb>" }`
* **Response (200 OK):**
  ```json
  {
    "valid": true,
    "format": "binary_stl",
    "triangleCount": 14208,
    "note": "Header inspection matched binary STL signature"
  }
  ```

---

## 6. Classroom Radar & Bookings (`server/routes/rooms.js`)

### `GET /api/rooms/free`
* **Auth:** None (Public)
* **Query Parameters:** `date` (YYYY-MM-DD), `slot` (1 to 8)
* **Response (200 OK):** Array of rooms with neither timetable lectures nor faculty reservations for that slot.

### `POST /api/rooms` (or `POST /api/room-bookings`)
* **Auth:** Required | **Roles:** `faculty`, `admin`
* **Body:** `{ "room_id": "AB1-102", "booking_date": "2026-10-16", "slot_number": 3, "purpose": "Remedial lecture" }`
* **Response (201 Created):** `{ "success": true, "booking": { ... } }`
* **Error (409 Conflict):** Returns timetable clash or prior booking conflict with alternative free rooms.

### `GET /api/room-bookings/mine`
* **Auth:** Required | **Roles:** `faculty`
* **Response (200 OK):** Faculty member's own room reservations.

### `DELETE /api/room-bookings/:id`
* **Auth:** Required | **Roles:** Owner or `admin`
* **Response (200 OK):** `{ "success": true, "message": "Room booking cancelled successfully" }`

---

## 7. Multilingual Grounded Assistant (`server/routes/chat.js`)
*Aliases:* Mounted at `/api/chat` and `/api/ai/chat` (sensitive rate limiter: 25 req/min).

### `POST /api/chat`
* **Auth:** Required | **Roles:** Any
* **Body:**
  ```json
  {
    "message": "Where can I find an ESP32 microcontroller?",
    "preferredLanguage": "en"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "reply": "ESP32-S3 is located in Lab: IoT & Robotics Lab, Drawer R-01 / Tray A (Quantity: 16).",
    "intent": "inventory_search",
    "language": "en"
  }
  ```

---

## 8. Analytics & Admin (`server/routes/analytics.js` & `server/routes/admin.js`)

### `GET /api/analytics/utilization`
* **Auth:** Required | **Roles:** `faculty`, `lab_incharge`, `admin`
* **Query Parameters:** `from`, `to` (timestamps)
* **Response (200 OK):** Machine utilization hours, peak slot distribution, and booking status breakdowns.

### `GET /api/admin/users`
* **Auth:** Required | **Roles:** `admin`
* **Response (200 OK):** List of registered student and staff profiles.

### `PATCH /api/admin/users/:id/role`
* **Auth:** Required | **Roles:** `admin`
* **Body:** `{ "role": "faculty" }`
* **Response (200 OK):** `{ "success": true, "profile": { "id": "...", "role": "faculty" } }`

### `POST /api/admin/timetables/import`
* **Auth:** Required | **Roles:** `admin`
* **Body:** `{ "entries": [ { "room_id": "AB1-101", "day_of_week": "Monday", "slot_number": 1, ... } ] }`
* **Response (200 OK):** `{ "success": true, "count": 48 }`

### `GET /api/admin/audit-log`
* **Auth:** Required | **Roles:** `admin`
* **Response (200 OK):** Last 100 immutable audit trail logs.

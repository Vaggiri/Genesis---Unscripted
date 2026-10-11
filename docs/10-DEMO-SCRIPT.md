# 10 — Live Demonstration Script (8–10 Minutes)

A complete, stage-by-stage demo walkthrough designed for hackathon judges, panel reviews, and faculty evaluations.

---

## 1. Demo Credentials Reference

All accounts share the configured `DEMO_PASSWORD` from your `.env` file (e.g., `YourSecureDemoPassword2026!`):

| Role Identifier | Email | Persona & Department |
| :--- | :--- | :--- |
| **Student Innovator** | `student.demo@cb.students.amrita.edu` | Adithya K. (B.Tech AI & Data Science) |
| **Faculty Member** | `faculty.demo@cb.amrita.edu` | Dr. K. Swaminathan (CSE Department) |
| **Lab In-Charge** | `incharge.demo@cb.amrita.edu` | Er. Rajesh V. (Digital Fabrication Hub) |
| **Administrator** | `admin.demo@cb.amrita.edu` | Prof. M. Ramachandran (Admin Lead) |

---

## 2. Minute-by-Minute Demonstration Flow

| Time | Logged-In User | UI Actions (What to Click) | Audience Screen (What They See) | Presenter Script (What to Say) |
| :---: | :--- | :--- | :--- | :--- |
| **00:00 - 01:15** | None $\rightarrow$ Student | Open app, enter `student.demo@cb.students.amrita.edu`. Navigate to **Hardware Inventory**. Type `10k resistor`. | Search instantly filters to `10k Ohm Resistors`. Badge displays: `Drawer D-04 / Bin 12` with amber badge `>30 Days Since Audit`. | *"Engineering students at Amrita waste hours walking between academic blocks looking for standard parts. In Yukti, typing '10k resistor' immediately pinpoints the exact drawer bin and flags if physical stock hasn't been audited in over a month."* |
| **01:15 - 02:45** | Student | Navigate to **Lab Desk / File Intake**. Drag & drop `chassis.stl`. Then select PCB Mill and drop `.stl`. | STL mesh is parsed in browser. Shows `34.2 cm³` volume, `110 min` print time. When wrong file type selected, amber mismatch alert triggers. | *"Instead of requiring heavy cloud slicers or expensive servers, our in-browser signed tetrahedron engine calculates volume and print duration in milliseconds directly in client memory. Notice the mismatch warning if a student tries uploading a 3D model for PCB milling."* |
| **02:45 - 04:00** | Student | Click **Suggest Earliest Slot** $\rightarrow$ Request 110-minute print. Click **Confirm Slot**. | Interval scheduler selects Bambu Lab X1 at next 15-min IST grid time. Booking badge appears with status `pending`. | *"The scheduler checks active machines across campus working hours (08:30–17:30 IST), automatically snapping to 15-minute grids and skipping maintenance blocks to recommend the tightest slot."* |
| **04:00 - 05:15** | Terminal / Two Tabs | Run `npm run test:concurrency` in terminal (or submit same slot in two tabs simultaneously). | Terminal fires 20 simultaneous requests: Exactly 1 succeeds (`201 Created`); 19 receive `409 Conflict` with alternative slots. | *"What happens when 20 students race for the same machine at slot opening? Most campus systems double-book. Yukti enforces a PostgreSQL btree_gist exclusion constraint at the database kernel level—zero race conditions, and instant alternative recommendations."* |
| **05:15 - 06:15** | Faculty + Student | Open Split Screen: Window A (Faculty: `faculty.demo`), Window B (Student: `student.demo`). Faculty clicks **Approve**. | On Student's screen, the badge shifts from amber `pending` to green `confirmed` **instantly without page reload**. | *"Watch the student's screen on the left. Powered by Supabase Realtime WebSocket events, the moment Dr. Swaminathan approves the booking on the right, the student's status updates live."* |
| **06:15 - 07:15** | Student | Open Chatbot modal. Click Mic icon. Speak Tamil: *"10k resistor enga irukku?"* Then English text: *"Find free classrooms now"*. | Speech transcribed live. Bot replies with localized Tamil text and voice synthesis pointing to Drawer D-04, then lists available rooms. | *"Campus innovation should be accessible in regional languages. Yukti features a lightweight multilingual assistant supporting English, Tamil, Hindi, and Malayalam, grounded directly in live database facts without large GPU dependencies."* |
| **07:15 - 08:30** | Faculty | Navigate to **Classroom Space Radar**. Select Day & Slot 3. Click **Book Free Room**. Try booking an occupied room. | Free rooms (e.g., AB1-102) displayed. Timetable-occupied room rejects with clash notice. Free room books successfully. | *"Faculty can instantly find vacant seminar spaces for remedial classes. If a slot clashes with scheduled lectures in the master timetable, it is automatically blocked."* |
| **08:30 - 09:30** | Admin | Log in as `admin.demo`. Navigate to **Admin Console**. Upload `public/sample-inventory.csv`. View **Audit Log**. | 48 inventory items upserted with deduplication. Immutable audit log displays chronological trail of all actions today. | *"Finally, administrators have total operational visibility. New component shipments are bulk-imported with natural key deduplication, and every single booking, approval, and role change is permanently logged in the audit ledger."* |

---

## 3. Pre-Demo Preparation Checklist

Complete this checklist 60 minutes before stepping into the review room:
* [ ] **Wake Up Supabase:** Visit the Supabase Dashboard project overview to confirm compute is running (not paused).
* [ ] **Warm Up Vercel API:** Execute `curl https://your-app.vercel.app/api/health` to eliminate cold-start latency.
* [ ] **Seed Demo Data & Sample Bookings:**
  ```bash
  npm run seed:users
  ```
  *(Tip: Create 6–8 sample bookings across different machines beforehand so the Utilization Dashboard displays populated analytics graphs).*
* [ ] **Microphone Permission:** In Chrome/Edge, open the app and grant microphone permissions in advance.
* [ ] **Phone Hotspot Standby:** Connect laptop to a dedicated mobile hotspot in case campus Wi-Fi throttles WebSockets.
* [ ] **Local Offline Backup:** Run `npm run dev:all` locally on `localhost:5173` so you can switch instantly if cloud internet drops.

---

## 4. "If Something Goes Wrong, Say This" Emergency Table

| Unexpected Glitch | Root Cause | Immediate Action | What to Say to the Review Panel |
| :--- | :--- | :--- | :--- |
| **Microphone fails to transcribe voice.** | Browser permission blocked or noisy auditorium acoustics. | Switch to typing query directly in the chat input box. | *"Web Speech API relies on browser ambient noise suppression; we provide identical multilingual text input for crowded lab environments."* |
| **Realtime update takes >5 seconds.** | Campus Wi-Fi packet drop or WebSocket renegotiation. | Hit Refresh or wait for the built-in 20s polling fallback. | *"Notice our resilience design: if campus WebSocket connections suffer network latency, the hook automatically falls back to background polling."* |
| **Supabase database pauses unexpectedly.** | Free tier inactivity threshold reached. | Toggle `DEMO_OFFLINE=true` in local `.env` and restart `npm run dev:all`. | *"Our architecture decouples frontend presentation via local resilience mocks, allowing full UI exploration even during cloud database maintenance."* |
| **A slot shows conflict unexpectedly.** | Another user tested the slot earlier. | Click the suggested **Alternative Slot** button. | *"This highlights our exclusion constraint in action—the system actively prevented a scheduling collision and immediately surfaced the next best slot."* |

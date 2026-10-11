# 10-Slide Pitch Deck Outline: Amrita Yukti

A structured presentation slide deck outline for the GENESIS 2026 hackathon review panel.

---

### **Slide 1: Title & Hook**
* **Title:** Amrita Yukti (அம்ரிதா யுக்தி / अमृत युक्ति)
* **Subtitle:** Centralized Innovation Facility Booking & Hardware Inventory Matching Portal
* **Tagline:** *"Bridging Campus Prototyping Silos with Deterministic Scheduling and Grounded Multilingual Intelligence"*
* **Team:** Genesis---Unscripted | Amrita Vishwa Vidyapeetham, Coimbatore
* **Key Visual:** Amrita Maroon identity header with dashboard mockup showing live lab metrics.

---

### **Slide 2: The Campus Reality & Problem Statement**
* **The Silo Dilemma:** Crores worth of specialized equipment (Bambu Lab 3D printers, Voltera PCB mills, RTX 4090 workstations) distributed across departments.
* **The Innovator's Pain:** Hours wasted walking between academic blocks looking for an open slot or a specific 10k resistor.
* **The Administrative Overhead:** WhatsApp message floods, paper sign-up sheets, overlapping double-bookings, and un-audited component bins.
* **The Classroom Drift:** Physical classroom takeovers diverging from the published timetable.

---

### **Slide 3: The Solution — Amrita Yukti**
* **Unified Portal:** Connecting Students, Faculty, Lab In-Charges, and Administrators into a single verified loop.
* **Core Value Pillars:**
  1. *Hardware Discovery:* Exact drawer bin locators with 30-day stale audit warnings.
  2. *Client-Side Pre-Flight:* In-browser 3D volume estimation using signed tetrahedron decomposition.
  3. *Deterministic Scheduling:* Earliest-slot interval scanner snapping to 15-minute grids.
  4. *Kernel Concurrency Lock:* Zero double-bookings via PostgreSQL exclusion constraints.
  5. *Space Radar:* Real-time classroom occupancy cross-referenced against timetables.
  6. *Multilingual Assistant:* Grounded voice bot in English, Tamil, Hindi, and Malayalam.

---

### **Slide 4: Live Demonstration Flow**
* **Step 1:** Student searches "10k resistor" $\rightarrow$ locates `Drawer D-04 / Bin 12`.
* **Step 2:** Drops `.stl` model $\rightarrow$ browser calculates volume and print time instantly.
* **Step 3:** System recommends 10:00–11:00 AM slot on Bambu Lab X1.
* **Step 4:** 20 concurrent booking requests fired $\rightarrow$ 1 succeeds, 19 receive conflict with alternative slots.
* **Step 5:** Faculty approves in split screen $\rightarrow$ student's badge turns green live via Supabase Realtime.
* **Step 6:** Hands-free voice query in Tamil confirms component availability.

---

### **Slide 5: Architecture & Technology Stack**
* **Frontend:** React 19 SPA, Vite 8, Vanilla CSS3 (Amrita maroon tokens), Web Speech API.
* **Backend:** Node.js (ESM), Express 5 REST API, Helmet security headers, dual-tier rate limiting.
* **Database & Auth:** Supabase PostgreSQL 15, Row Level Security, Realtime logical replication.
* **Optional LLM Fallback:** Google Gemini REST API (`gemini-2.5-flash`) with header authentication.
* **Architecture Diagram:** Mermaid topology showing Edge CDN $\rightarrow$ Serverless Lambda $\rightarrow$ Supabase Postgres.

---

### **Slide 6: The Scheduling Algorithm & Concurrency Guarantee**
* **Two-Tier Guarantee:**
  * *Tier 1 (Algorithm):* Scans active machines over 7 working days in 15-minute steps (08:30–17:30 IST), skipping maintenance blocks and minimizing calendar fragmentation.
  * *Tier 2 (Database):* PostgreSQL `EXCLUDE USING gist (resource_id WITH =, tstzrange(start_ts, end_ts) WITH &&)` physically guarantees zero overlapping rows.
* **Complexity:** Bounded by $\text{machines} \times \text{days} \times \text{bookings}$ (<2 ms on campus scale).

---

### **Slide 7: Security & Privilege Hardening**
* **Role Integrity:** Database trigger `guard_profile_update` blocks client role escalation.
* **Self-Approval Prevention:** API validates approver identity; direct client table updates revoked.
* **Domain Lock:** Trigger `handle_new_user` restricts signups to `@cb.amrita.edu` addresses.
* **Defense in Depth:** Dual rate limiting (120 req/min standard, 25 req/min chat), 100 KB payload caps, and immutable audit logs.

---

### **Slide 8: Cost to the College & Deployment Feasibility**
* **Current Operating Cost:** **$0 / month** on Vercel and Supabase free tiers.
* **Campus-Wide Scaling Cost:** ~$25 / month on Supabase Pro for 10,000 students.
* **On-Premise Readiness:** Fully portable Node.js and PostgreSQL stack; zero proprietary lock-in. Can deploy directly to Amrita IT VMware / OpenStack servers.

---

### **Slide 9: Measurable Campus Impact**
* **Hardware Utilization:** Transforms idle machine hours into measurable prototyping throughput.
* **Student Time Saved:** Eliminates redundant physical lab visits and component search delays.
* **Department Transparency:** Centralizes procurement requests and audit logs for NAAC/NBA accreditation data collection.
* **Linguistic Inclusivity:** Enables first-generation rural innovators to interact fluently in their native tongue.

---

### **Slide 10: Engineering Roadmap & Future Scope**
* **Phase 1 (Months 1–2):** Cloud storage bucket integration with signed URLs & Redis rate limiting.
* **Phase 2 (Months 3–6):** Campus AUMS SSO integration & dynamic QR-code kiosk scanning at lab doors.
* **Phase 3 (Months 6–12):** ESP32 physical power relays for machine authorization and multi-campus federation (Amritapuri, Bengaluru).
* **Closing Call to Action:** *"Amrita Yukti transforms campus prototyping from fragmented departmental silos into a cohesive, collaborative innovation ecosystem."*

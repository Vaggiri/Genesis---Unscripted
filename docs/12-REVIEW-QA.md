# 12 — Reviewer Defense Q&A: 40+ Evaluator Questions & Answers

This defense handbook equips the presentation team with short, honest, technically grounded answers for faculty reviews, hackathon judges, and technical evaluators.

---

## Group 1: Problem Definition & Campus Novelty

#### Q1: Why not just use Google Forms and a shared Google Calendar?
**A:** Google Forms cannot enforce database-level mutual exclusion; concurrent submissions cause double-bookings. Calendars do not calculate print volumes, drawer bin locations, or safety certification prerequisites, nor do they provide crowdsourced classroom radar.

#### Q2: What is the core novelty of Amrita Yukti?
**A:** Unifying physical hardware inventory, client-side fabrication pre-flight math, and earliest-available interval scheduling protected by PostgreSQL exclusion constraints, grounded with a multilingual regional voice assistant.

#### Q3: How does this help a student innovator specifically?
**A:** A student finds exact drawer bin locations in seconds, uploads a 3D model to get instant print duration estimates, and secures the earliest available machine slot without wandering between department silos.

#### Q4: How does this reduce faculty and lab in-charge workload?
**A:** Eliminates ad-hoc WhatsApp approvals and paper sign-up sheets. In-charges get an automated queue with pre-calculated print times, bulk CSV inventory imports, and automated no-show releasing.

---

## Group 2: Architecture & Scalability

#### Q5: Why did you choose React + Express instead of Next.js?
**A:** Complete separation of concerns: a lightweight React 19 SPA served via edge CDN and a portable Express 5 REST API. This allows the backend to run on Vercel serverless or migrate directly to Amrita's local Linux servers without vendor lock-in.

#### Q6: How many concurrent users can the system handle?
**A:** Static assets scale infinitely via Vercel CDN. The Express serverless API handles hundreds of requests per second. Database writes are bounded by Supabase PostgreSQL (up to 200 concurrent pool connections on free tier).

#### Q7: Why use Supabase rather than a standalone MongoDB or MySQL database?
**A:** PostgreSQL provides the required `btree_gist` exclusion constraint for double-booking prevention, native Row Level Security (RLS) for tenant isolation, and built-in WebSocket replication (Realtime) without running a custom socket daemon.

#### Q8: How is network traffic managed during slot-opening traffic spikes?
**A:** Assets are cached on Vercel Edge; API runs stateless serverless functions; request bodies are capped at 100 KB; rate limiters enforce 120 req/min; queries use compound indexes.

---

## Group 3: Security & Privacy

#### Q9: How do you prevent students from promoting themselves to Admin?
**A:** Enforced at two independent layers: (1) Express middleware `requireRole('admin')`, and (2) PostgreSQL trigger `guard_profile_update` which raises an exception if a non-admin attempts modifying the `role` column.

#### Q10: Can a student approve their own machine booking?
**A:** No. `PATCH /api/bookings/:id` explicitly checks `existing.user_id === req.user.id && req.role !== 'admin' -> 403 Forbidden`. Furthermore, migration 004 revoked direct client table update permissions in RLS.

#### Q11: How is the Supabase Service Role Key protected?
**A:** It is stored solely as a server-side environment variable (`SUPABASE_SERVICE_ROLE_KEY`). It is never prefixed with `VITE_` and never bundled into client-side code.

#### Q12: How are malicious uploads and zip bombs prevented?
**A:** STL and Gerber files are inspected in the browser using signed tetrahedron math; original binaries are not stored on the server. `inspectGerberZipBuffer` checks uncompressed compression ratios to prevent decompression attacks.

#### Q13: Are student passwords stored in plain text?
**A:** No. Supabase Auth hashes passwords with bcrypt. The application never stores or handles plain-text credentials in localStorage or database tables.

---

## Group 4: Scheduling Algorithm & Concurrency

#### Q14: Is the scheduling algorithm "constant time"?
**A:** No. The scheduler scans active machines over up to 7 working days in 15-minute steps, skipping past existing bookings. Its complexity is $O(\text{machines} \times \text{days} \times \text{bookings})$. On campus scale (5–20 machines), it executes in <2 milliseconds.

#### Q15: How do you guarantee zero double bookings under network races?
**A:** Concurrency is guaranteed by PostgreSQL's `EXCLUDE USING gist (resource_id WITH =, tstzrange(start_ts, end_ts) WITH &&)`. The database kernel enforces atomicity. The scheduler only suggests optimal slots; the database guarantees correctness.

#### Q16: What happens if two students click "Confirm Slot" at the exact same millisecond?
**A:** One transaction succeeds (`201 Created`). The second violates the exclusion constraint, triggering error `23P01`. The backend catches this and returns `409 Conflict` along with newly calculated alternative slots.

#### Q17: Why snap intervals to a 15-minute grid?
**A:** Quantizing slots to `:00`, `:15`, `:30`, `:45` prevents micro-fragmentation (e.g. 7-minute unusable gaps between bookings) and standardizes lab operator handovers.

#### Q18: What is the "leftover gap" tie-break?
**A:** When multiple machines are free at the same start time, the algorithm selects the machine that leaves the smallest gap before its next scheduled booking, packing reservations efficiently.

---

## Group 5: Chatbot & Multilingual NLP

#### Q19: Why didn't you fine-tune an LLM or run a local model like LLaMA?
**A:** Running a 7B parameter LLM on campus servers requires dedicated GPUs and high power. Amrita Yukti uses a deterministic rule and slot engine grounded directly in PostgreSQL, with an optional low-cost Gemini Flash fallback (`gemini-2.5-flash`).

#### Q20: How does language detection work without heavy models?
**A:** Via Unicode script range inspection (`server/lib/chatEngine.js`). Tamil falls in `\u0B80-\u0BFF`, Hindi in `\u0900-\u097F`, and Malayalam in `\u0D00-\u0D7F`.

#### Q21: Can the chatbot hallucinate drawer locations or room vacancies?
**A:** No. Intent extraction queries the real database (`public.inventory_items`, `public.classrooms`). Responses are populated using verified template slots.

#### Q22: What happens if `GEMINI_API_KEY` is empty or Google's API fails?
**A:** The engine gracefully catches the error, logs the status code, and falls back to deterministic rule-based grounded matching. The chatbot never crashes.

---

## Group 6: File Handling & Pre-Flight Math

#### Q23: How do you calculate 3D print volume in the browser?
**A:** Using signed tetrahedron decomposition. For each triangular facet in the STL mesh, the signed volume of the tetrahedron formed with the origin is:
$$V = \frac{1}{6} (\vec{v}_1 \times \vec{v}_2) \cdot \vec{v}_3$$
Summing across all facets yields the exact volume in $cm^3$.

#### Q24: Do you upload the 3D files to Supabase Storage?
**A:** No. Analysis occurs client-side in browser memory. Only metadata (file name, volume, estimated print time, infill parameters) is saved to the database. Uploading originals to cloud buckets is on our roadmap.

#### Q25: How do you verify Gerber files?
**A:** `inspectGerberZipBuffer` inspects the ZIP archive central directory without full decompression, checking for standard Gerber PCB layer extensions (`.gtl`, `.gbl`, `.gts`, `.gbs`, `.gko`).

---

## Group 7: Deployment & Cost to Amrita

#### Q26: What is the monthly operating cost of this system?
**A:** Currently **$0 / month** on Vercel Hobby and Supabase Free tiers. For campus-wide production (10,000 students), Supabase Pro is ~$25/month.

#### Q27: Can this run on Amrita's on-premise servers?
**A:** Yes. The entire stack uses standard Node.js and PostgreSQL. It can be deployed via Docker Compose on Amrita IT's VMware or OpenStack infrastructure with complete data residency.

#### Q28: How do you handle Supabase free-tier inactivity pauses?
**A:** Free projects pause after 7 days without queries. For production, the database is hosted permanently or upgraded to Pro tier. For demos, the team wakes the compute via dashboard beforehand.

---

## Group 8: Edge Cases & Operational Failure Modes

#### Q29: What happens if a student books a machine and doesn't show up?
**A:** `autoReleaseNoShows()` automatically updates approved bookings to `status = 'no_show'` if 15 minutes have passed since `start_ts` without check-in, freeing the machine for others.

#### Q30: How do you stop a student from booking 10 slots ahead of time?
**A:** The backend enforces a hard limit of 5 active bookings (`pending` or `approved`) per student at any one time.

#### Q31: How do you prevent timetable import duplicates?
**A:** Inventory imports use stable natural key hashing `item_key = lower(trim(part_no || name))` with `ON CONFLICT (lab_id, item_key) DO UPDATE`. Timetable entries are replaced per semester.

---

## Group 9: Roadmap & Unimplemented Features

#### Q32: Is QR-code check-in implemented?
**A:** **Roadmap.** Currently, students check in via a button in their portal within 10 minutes of their slot. Hardware QR scanning is planned for phase two.

#### Q33: Does the system integrate with Amrita's AUMS ERP?
**A:** **Roadmap.** Currently uses independent Supabase Auth restricted to `@cb.amrita.edu`. Integration with institutional LDAP/CAS SSO is planned.

#### Q34: Can students pay for 3D printing filament through the portal?
**A:** **Roadmap.** Material usage is tracked in grams (`est_material_g`), but billing/payment gateways are left for future ERP integration.

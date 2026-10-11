# 11 — Testing & Verification Guide

This document describes the automated test suites, concurrency stress scripts, rate-limiting demonstrations, and manual verification checklists for **Amrita Yukti**.

---

## 1. Automated Test Suite (Vitest)

All automated unit tests are executed using **Vitest** without requiring a live database connection or network dependencies.

### Running Automated Tests
```bash
npm test
```

### Complete Test Inventory (18 Passing Tests)

#### Suite 1: Scheduler Engine ([`server/tests/scheduler.test.js`](file:///d:/Project/Hackathon/server/tests/scheduler.test.js) — 9 Tests)
1. `handles empty calendar by scheduling at the earliest grid time inside working hours`: Confirms 15-minute grid alignment at 08:30 UTC.
2. `skips maintenance resources completely`: Ensures machines marked `status: 'maintenance'` are never recommended.
3. `finds slot when gap is exactly equal to duration`: Validates tight interval fitting between 09:30 and 10:30.
4. `finds slot in larger gap and preserves grid alignment`: Validates placement within 3-hour window.
5. `rolls over to next working day when requested after working hours`: Ensures requests at 18:00 roll over to 08:30 next morning.
6. `prefers smaller leftover gap when multiple candidates available at the same time`: Validates tie-break logic minimizing calendar fragmentation.
7. `skips rejected and cancelled bookings`: Ensures non-active reservations free up capacity.
8. `returns alternatives when best slot is found`: Confirms secondary alternative slot generation.
9. `respects IST offset for working hours`: Validates UTC conversion for Indian Standard Time (`UTC+05:30`).

#### Suite 2: Analytics & Utilization Math ([`server/tests/analytics.test.js`](file:///d:/Project/Hackathon/server/tests/analytics.test.js) — 5 Tests)
1. `returns zeros for empty bookings`: Validates graceful zero-state handling.
2. `computes utilization hours accurately`: Validates duration summation across machines.
3. `computes status distribution counts`: Accurately groups `completed`, `approved`, `pending`, `no_show`.
4. `computes peak hour distribution in IST`: Accurately projects UTC timestamps to IST peak hour bins.
5. `filters out cancelled and rejected bookings`: Excludes non-utilized slots from metrics.

#### Suite 3: Gemini Chatbot Fallback ([`server/tests/chatEngine.test.js`](file:///d:/Project/Hackathon/server/tests/chatEngine.test.js) — 4 Tests)
1. `sends API key exclusively in x-goog-api-key header`: Asserts `key=` is never included in the URL query string.
2. `constructs URL with configured GEMINI_MODEL env variable`: Proves custom model names appear in the REST URL.
3. `falls back to unknown without throwing on invalid, empty, or error response`: Validates resilience under HTTP 500 or malformed JSON.
4. `never invokes fetch if GEMINI_API_KEY is not configured`: Confirms zero external calls in default offline mode.

---

## 2. Concurrency & Exclusion Stress Test

Validates PostgreSQL's `btree_gist` exclusion constraint under concurrent race conditions.

### Execution Command
```bash
npm run test:concurrency
```

### Script Mechanism ([`scripts/concurrency-test.mjs`](file:///d:/Project/Hackathon/scripts/concurrency-test.mjs))
* Fires **20 simultaneous HTTP POST requests** using `Promise.all` targeting the exact same resource (`res-3d-bambu-x1`) for the exact same 1-hour interval (`2026-10-15T10:00:00Z` to `11:00:00Z`).
* **Expected Result:**
  * Exactly **1 request** succeeds with `201 Created`.
  * **19 requests** receive `409 Conflict` containing the error code `slot_taken` and dynamically computed alternative slots.
  * **Zero double bookings** committed to the database.

---

## 3. Rate Limiter & Security Stress Test

Demonstrates Express DoS and brute-force mitigation middleware.

### Execution Command
```bash
npm run demo:security
```

### Script Mechanism ([`scripts/brute-force-demo.mjs`](file:///d:/Project/Hackathon/scripts/brute-force-demo.mjs))
* Sends a rapid burst of **50 requests** against the sensitive `/api/chat` route.
* **Expected Result:**
  * First 25 requests process successfully.
  * Requests 26 through 50 are blocked by `sensitiveLimiter` returning HTTP `429 Too Many Requests`.

---

## 4. Static Code Quality & Linter

```bash
# Run oxlint linter
npx oxlint

# Run production build compilation
npm run build
```

* **Acceptance:** `oxlint` must report 0 errors and no new warnings. `vite build` must generate optimized production chunks in `dist/` with exit code 0.

---

## 5. Manual Verification Checklist (By Role)

| Step | Persona | Action | Expected Behavior |
| :---: | :--- | :--- | :--- |
| **1** | Student | Search for "10k resistor" in Inventory tab | Drawer location displays with audit badge. |
| **2** | Student | Drag `.stl` file into File Intake | Mesh volume and print time calculated in browser. |
| **3** | Student | Request earliest slot for 3D printer | Machine recommended at 15-minute grid time. |
| **4** | Faculty | Open Faculty Approvals desk | Student's pending booking appears with student name. |
| **5** | Faculty | Click "Approve" | Status updates to approved; student's screen updates live. |
| **6** | Student | Open Voice Assistant and ask for drawer stock | Grounded response returned via text and synthesized voice. |
| **7** | Faculty | Reserve classroom in Space Radar | Confirmed if room is free; blocked if lecture scheduled. |
| **8** | In-Charge | Upload `public/sample-inventory.csv` | Inventory rows upserted without duplication. |
| **9** | Admin | Promote user role in Admin Console | Profile role updated; non-admin forbidden from doing so. |

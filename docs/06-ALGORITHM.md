# 06 — Earliest-Available Interval Scheduling Algorithm

This document provides a comprehensive technical walkthrough of the scheduling algorithm implemented in [`server/lib/scheduler.js`](file:///d:/Project/Hackathon/server/lib/scheduler.js).

---

## 1. Algorithm Overview & Core Principles

The scheduler solves the **earliest-available contiguous resource interval allocation problem** across a fleet of physical campus prototyping machines (3D printers, PCB mills, AI workstations).

### Core Design Principles
* **Pure & Deterministic Function:** No database calls or network I/O; strictly unit-testable.
* **15-Minute Grid Quantization:** All intervals snap forward to a 15-minute grid (`00`, `15`, `30`, `45`) to prevent fractional fragmentation.
* **Working Hours Bounding:** Slots are constrained strictly between **08:30 and 17:30 IST** (`UTC+05:30`). Slots cannot cross overnight boundaries.
* **Tie-Breaking by Leftover Gap Minimization:** If multiple machines have an open slot at the exact same start timestamp, the scheduler selects the candidate that minimizes the leftover gap before its next booking (reducing fragmentation).
* **Two-Tier Guarantee Architecture:** The algorithm provides an optimal **suggestion**; PostgreSQL's `btree_gist` exclusion constraint enforces an absolute **guarantee** against double bookings.

---

## 2. Algorithm Flowchart

```mermaid
flowchart TD
    Start([Input: candidates, durationMin, notBefore, existingBookings]) --> FilterOK[Filter active candidates: status == 'ok']
    FilterOK --> HasCand{Candidates > 0?}
    HasCand -- No --> ReturnEmpty[Return: best = null, alternatives = []]
    HasCand -- Yes --> DayLoop[Iterate Day 0 to maxDays - 1 (up to 7 days)]
    
    DayLoop --> CalcWorkingHours[Calculate Day Window: 08:30 to 17:30 IST]
    CalcWorkingHours --> SnapGrid[Snap cursor = ceilToGrid(max(notBefore, dayStart), 15m)]
    
    SnapGrid --> CheckCursor{cursor + duration <= dayEnd?}
    CheckCursor -- No --> NextDay[Advance to Next Working Day]
    NextDay --> DayLoop
    
    CheckCursor -- Yes --> MachineLoop[Scan Each Candidate Machine]
    MachineLoop --> FilterBookings[Get bookings overlapping slot: status in 'pending', 'approved']
    
    FilterBookings --> HasOverlap{Overlap found?}
    HasOverlap -- Yes --> SkipPast[Skip cursor forward to end of conflicting booking]
    SkipPast --> CheckCursor
    
    HasOverlap -- No --> FoundSlot[Record Open Slot Candidate]
    FoundSlot --> TieBreak[Calculate leftover gap to next booking]
    TieBreak --> AddSlot[Add to Found Slots List]
    
    AddSlot --> HasSlots{Found any slots for this time?}
    HasSlots -- Yes --> SortSlots[Sort by: 1. start_time, 2. smallest leftover gap]
    SortSlots --> ReturnBest[Return: best slot + up to 4 alternatives]
    HasSlots -- No --> StepGrid[Advance cursor by 15 mins]
    StepGrid --> CheckCursor
```

---

## 3. Mathematical Formulation & Pseudocode

### 3.1 15-Minute Grid Quantization
Given a timestamp $t$ and interval $I = 15 \text{ minutes}$:
$$\text{ceilToGrid}(t, I) = \lceil \frac{t}{I \times 60 \times 1000} \rceil \times (I \times 60 \times 1000)$$

### 3.2 Formal Pseudocode
```python
def findEarliestSlot(candidates, durationMin, notBefore, workingHours, existingBookings, maxDays=7):
    active_machines = [c for c in candidates if c.status == 'ok']
    if not active_machines or durationMin <= 0:
        return { best: None, alternatives: [] }

    found_slots = []
    
    for day_offset in range(0, maxDays):
        day_date = notBefore + day_offset * DAYS
        work_start, work_end = getWorkingHoursWindow(day_date, workingHours, IST_OFFSET)
        
        cursor = ceilToGrid(max(notBefore, work_start), 15)
        
        while cursor + durationMin <= work_end:
            for machine in active_machines:
                conflicts = getOverlappingBookings(machine.id, cursor, cursor + durationMin, existingBookings)
                
                if conflicts is empty:
                    leftover_gap = getNextBookingStart(machine.id, cursor + durationMin) - (cursor + durationMin)
                    found_slots.append({
                        resourceId: machine.id,
                        start: cursor,
                        end: cursor + durationMin,
                        leftoverGap: leftover_gap
                    })
                else:
                    # Skip cursor forward to end of conflicting booking
                    cursor = max(cursor, ceilToGrid(conflicts[0].end_ts, 15))
            
            if len(found_slots) >= TARGET_LIMIT:
                break
            cursor += 15_MINUTES

    # Sort: Primary = earliest start timestamp, Secondary = smallest leftover gap
    sorted_slots = sortBy(found_slots, key=lambda s: (s.start, s.leftoverGap))
    deduped_slots = removeDuplicateStartSlots(sorted_slots)
    
    return {
        best: deduped_slots[0] if deduped_slots else None,
        alternatives: deduped_slots[1:5]
    }
```

---

## 4. Worked Numeric Example (From Unit Test Suite)

This example is verified directly by [`server/tests/scheduler.test.js`](file:///d:/Project/Hackathon/server/tests/scheduler.test.js) (`"finds slot when gap is exactly equal to duration"`):

### Scenario Setup
* **Machine:** `res-printer-1` (Prusa MK4 CoreXY)
* **Requested Duration:** `60 minutes`
* **Requested Not Before:** `2026-10-12T08:30:00Z` (Monday 08:30 UTC)
* **Existing Bookings:**
  1. Booking A: `08:30` to `09:30` (`approved`)
  2. Booking B: `10:30` to `12:00` (`approved`)

### Step-by-Step Execution Trace
1. **Initial Cursor:** `08:30`.
2. **Evaluation at `08:30`:** Target window is `08:30 – 09:30`.
   * Conflict check finds Booking A (`08:30 – 09:30`).
   * Overlap detected $\rightarrow$ algorithm skips cursor to end of Booking A: `09:30`.
3. **Evaluation at `09:30`:** Target window is `09:30 – 10:30`.
   * Slot check: Is `10:30 <= 17:30`? Yes.
   * Conflict check:
     * Booking A ended at `09:30` (No overlap).
     * Booking B starts at `10:30` (No overlap, exact boundary match).
   * Result: **Gap found!**
4. **Leftover Gap Calculation:**
   * Next booking (Booking B) starts at `10:30`.
   * Leftover gap = $10:30 - 10:30 = 0 \text{ minutes}$ (Optimal tight fit, zero fragmentation).
5. **Output Returned:**
   ```json
   {
     "best": {
       "resourceId": "res-printer-1",
       "start": "2026-10-12T09:30:00.000Z",
       "end": "2026-10-12T10:30:00.000Z"
     },
     "alternatives": []
   }
   ```

---

## 5. Computational Complexity Analysis

* **Accurate Computational Cost:**
  > *"The scheduler scans each active machine over up to 7 working days in 15-minute steps, skipping past existing bookings, so its cost grows with $\text{machines} \times \text{days} \times \text{bookings}$ (small on campus-scale data). Correctness under concurrency is guaranteed by the PostgreSQL exclusion constraint, not by the algorithm."*

* **Grid Steps per Day:**
  Working window is 08:30 to 17:30 = 9 hours = 36 steps of 15 minutes.
  Across $7 \text{ days}$, maximum time points evaluated = $7 \times 36 = 252 \text{ steps}$.
* **Comparison with Naive Algorithms:**
  Instead of incrementing blindly by 1 minute ($7 \times 540 = 3,780 \text{ steps}$), the scheduler jumps forward directly to the end of conflicting bookings, reducing search cycles to sub-millisecond execution times.

---

## 6. Concurrency Race & Rejection Handling

When multiple users race for the same recommended slot:
1. Student 1 and Student 2 both receive a suggestion for Bambu Lab X1 at `10:00 – 11:00 AM`.
2. Both submit `POST /api/bookings` simultaneously.
3. PostgreSQL processes Student 1 first: row commits.
4. When Student 2's transaction executes, the PostgreSQL `btree_gist` constraint triggers error `23P01 (exclusion violation)`:
   ```text
   ERROR: 23P01: conflicting key value violates exclusion constraint "facility_bookings_resource_id_tstzrange_excl"
   DETAIL: Key (resource_id, tstzrange(start_ts, end_ts))=(res-3d-bambu-x1, ["2026-10-15 10:00:00+00","2026-10-15 11:00:00+00")) conflicts with existing key...
   ```
5. Express intercepts error `23P01`, automatically executes `findEarliestSlot()` with the freshly committed database state, and responds with `409 Conflict`:
   ```json
   {
     "error": "slot_taken",
     "message": "The requested slot conflicts with an existing booking.",
     "alternatives": [
       { "resourceId": "res-3d-prusa-mk4", "start": "2026-10-15T10:00:00.000Z", "end": "2026-10-15T11:00:00.000Z" }
     ]
   }
   ```
6. The client displays a friendly banner with one-click alternatives, ensuring zero downtime and zero double bookings.

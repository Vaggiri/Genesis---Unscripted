# 14 — Operational Troubleshooting Handbook

This guide resolves common setup, runtime, and demonstration issues encountered in **Amrita Yukti**.

---

## 1. Quick Diagnostic Table: Symptom $\rightarrow$ Cause $\rightarrow$ Fix

| Symptom / Error Message | Probable Root Cause | Resolution / Fix Step |
| :--- | :--- | :--- |
| **`fetch failed` / Database timeouts on `/api/health`** | Supabase free-tier project is paused due to inactivity. | Open [Supabase Dashboard](https://supabase.com/dashboard) and click **Restore Project**. Wait 60 seconds until status returns to Active. |
| **`Port 5000 is already in use`** | A previous Node instance is running in the background. | **Windows:** Run `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess \| Stop-Process -Force`<br>**Linux/Mac:** Run `lsof -ti:5000 \| xargs kill -9` |
| **`Port 5173 is already in use`** | An orphaned Vite dev server process is holding the port. | Terminate the process using the commands above for port 5173, or let Vite auto-switch to 5174. |
| **`401 Unauthorized` on all API calls** | Missing or expired Supabase JWT; or user logged out. | Log out and log back in to refresh JWT session. Confirm `VITE_SUPABASE_ANON_KEY` matches between `.env` and Supabase dashboard. |
| **`403 Forbidden` on role-protected actions** | User profile role does not match required role. | In Supabase SQL Editor, check `SELECT role FROM public.profiles WHERE id = '...';` or promote via Admin console. |
| **Realtime updates do not arrive live** | Migration `005_realtime.sql` was not run, or WebSocket blocked by campus firewall. | (1) Run `005_realtime.sql` in Supabase SQL editor to ensure `facility_bookings` is in publication.<br>(2) Check browser console. The hook will automatically fall back to 20s polling if WebSockets are blocked. |
| **`❌ Error: set DEMO_PASSWORD (min 12 chars)`** | `DEMO_PASSWORD` is missing or shorter than 12 characters in `.env`. | Add `DEMO_PASSWORD=YourSecureDemoPassword2026!` in `.env` and re-run `npm run seed:users`. |
| **Voice assistant button does not transcribe audio** | Microphone permissions denied or browser does not support Web Speech API. | (1) Use Google Chrome or Microsoft Edge.<br>(2) Click the lock icon in the address bar $\rightarrow$ **Site Settings** $\rightarrow$ Allow **Microphone**.<br>(3) Type text in input as fallback. |
| **File Intake shows "File type mismatch"** | File extension or magic bytes do not match selected process (e.g., `.stl` chosen for PCB). | Change process dropdown to "3D Print" for `.stl`, or "PCB Mill" for `.zip` Gerber archives. |
| **CORS errors in browser console** | Frontend origin does not match `ALLOWED_ORIGINS` in `.env`. | Ensure `ALLOWED_ORIGINS=http://localhost:5173` in `.env` when running locally. |
| **`Sign-up restricted to Amrita college email addresses`** | User attempted signing up with `@gmail.com` or non-Amrita domain. | Sign up using an email ending in `@cb.amrita.edu` or `@cb.students.amrita.edu`. |
| **`Only administrators can change roles`** | Non-admin user attempted modifying `role` column in `public.profiles`. | Role changes are guarded by trigger `guard_profile_update`. Must be executed by an Admin user or via Supabase dashboard. |
| **Utilization dashboard displays all zeros** | Database has zero recorded bookings. | Analytics are computed dynamically from real bookings. Create 5–8 bookings (via student portal or seed scripts) to view graphs. |
| **`npm ci` fails with lockfile mismatch** | `package-lock.json` is out of sync with `package.json`. | Run `npm install` to synchronize dependencies cleanly. |

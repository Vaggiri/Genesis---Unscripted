# 08 — Setup Guide: Zero to Running

This step-by-step setup guide is designed to take any team member, reviewer, or developer from a clean environment to a fully operational local instance of **Amrita Yukti**.

---

## 1. Prerequisites

Before starting, ensure your system has the following installed:
* **Node.js:** Node `v20.x` or later (LTS recommended, check with `node -v`).
* **Package Manager:** `npm` (v10+).
* **Git:** Installed and authenticated with GitHub.
* **Accounts:**
  * Free [Supabase Account](https://supabase.com).
  * (Optional) [Google AI Studio Account](https://aistudio.google.com) for Gemini API key.
  * (Optional) [Vercel Account](https://vercel.com) for cloud deployment.

### System Verification Commands
* **Windows (PowerShell):**
  ```powershell
  node --version
  npm --version
  git --version
  ```
* **macOS / Linux (Bash):**
  ```bash
  node --version
  npm --version
  git --version
  ```

---

## 2. Clone Repository & Install Dependencies

```bash
git clone https://github.com/Vaggiri/Genesis---Unscripted.git
cd Genesis---Unscripted
npm ci
```

---

## 3. Environment Variables Reference

Copy the sample environment file:
```bash
cp .env.example .env
```

### Complete Environment Variable Table

| Variable Name | Consumed By | Required? | Where to Obtain (Dashboard Location) | Example Value / Placeholder | Browser Safe? |
| :--- | :--- | :---: | :--- | :--- | :---: |
| `VITE_SUPABASE_URL` | Frontend & Scripts | **Yes** | Supabase -> Project Settings -> API -> Project URL | `https://xyzcompany.supabase.co` | **Yes** (Bundled in client) |
| `VITE_SUPABASE_ANON_KEY` | Frontend & Scripts | **Yes** | Supabase -> Project Settings -> API -> `anon` public key | `eyJhbGciOi...` | **Yes** (Guarded by RLS) |
| `SUPABASE_URL` | Backend | **Yes** | Supabase -> Project Settings -> API -> Project URL | `https://xyzcompany.supabase.co` | **No** (Server only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend & Seed | **Yes** | Supabase -> Project Settings -> API -> `service_role` secret | `eyJhbGciOi...` | ⛔ **NEVER EXPOSE TO CLIENT** |
| `PORT` | Backend | No | Local Express port (default `5000`) | `5000` | **No** |
| `ALLOWED_ORIGINS` | Backend | No | CORS origins allowed (default `http://localhost:5173`) | `http://localhost:5173` | **No** |
| `DEMO_PASSWORD` | Seed script | **Yes** | Any password you choose (min 12 chars) | `YourSecureDemoPassword2026!` | **No** |
| `GEMINI_API_KEY` | Backend | Optional | Google AI Studio -> API Keys | `AIzaSy...` | ⛔ **NEVER EXPOSE TO CLIENT** |
| `GEMINI_MODEL` | Backend | Optional | Supported Flash model (default: `gemini-2.5-flash`) | `gemini-2.5-flash` | **No** |
| `DEMO_OFFLINE` | Backend | Optional | Mock mode if Supabase is offline (default `false`) | `false` | **No** |

> [!CAUTION]
> **Security Rule:** Any variable starting with `VITE_` is baked into the public browser JavaScript bundle. Never prepend `VITE_` to `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY`.

---

## 4. How to Obtain Every Token Step-by-Step

### 4.1 Supabase Setup (Database, Auth, Realtime)
1. **Create Project:**
   * Go to [database.new](https://database.new) and log in.
   * Click **New Project**. Name it `amrita-yukti`.
   * Set a strong database password and select region `South Asia (Mumbai)` for minimal latency.
2. **Copy Credentials:**
   * In your project sidebar, click **Project Settings** (gear icon) $\rightarrow$ **API**.
   * Under **Project URL**, copy the URL $\rightarrow$ paste into `VITE_SUPABASE_URL` and `SUPABASE_URL`.
   * Under **Project API keys**, copy the `anon` / `public` key $\rightarrow$ paste into `VITE_SUPABASE_ANON_KEY`.
   * Under **Project API keys**, reveal and copy the `service_role` / `secret` key $\rightarrow$ paste into `SUPABASE_SERVICE_ROLE_KEY`.
3. **Run SQL Migrations (in order):**
   * In Supabase sidebar, open **SQL Editor**.
   * Open each migration file from `supabase/migrations/` and run them one by one:
     1. `001_init.sql` (Creates 16 tables, btree_gist extension, indexes)
     2. `002_rls.sql` (Applies base Row Level Security policies)
     3. `003_seed_sample.sql` (Seeds default labs, machines, and component bins)
     4. `004_security_fixes.sql` (Hardens RLS, triggers, domain check, and role locks)
     5. `005_realtime.sql` (Enables `supabase_realtime` publication on `facility_bookings`)
4. **Configure Authentication Settings:**
   * In sidebar, click **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
   * For the demo/hackathon environment: toggle **Confirm email** to `OFF` (so seeded accounts are immediately active).
5. **Seed Demo Accounts:**
   * In your `.env` file, ensure `DEMO_PASSWORD=YourSecureDemoPassword2026!` is set.
   * Run the seeding CLI:
     ```bash
     npm run seed:users
     ```
   * This creates 4 accounts:
     * `student.demo@cb.students.amrita.edu` (Role: `student`)
     * `faculty.demo@cb.amrita.edu` (Role: `faculty`)
     * `incharge.demo@cb.amrita.edu` (Role: `lab_incharge`)
     * `admin.demo@cb.amrita.edu` (Role: `admin`)
6. **Assign Lab In-Charge ID (Optional):**
   * If you wish `incharge.demo` to supervise FabLab:
     ```sql
     UPDATE public.labs
     SET incharge_id = (SELECT id FROM public.profiles WHERE roll_no = 'AMR-STAFF-112')
     WHERE id = 'lab-fablab';
     ```

### 4.2 Google Gemini API Setup (Optional Fallback)
1. Navigate to [Google AI Studio](https://aistudio.google.com).
2. Click **Get API key** $\rightarrow$ **Create API key in new project**.
3. Copy the key and set in your `.env`:
   ```env
   GEMINI_API_KEY=AIzaSyYourGeneratedGeminiKey
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. *Note:* If left blank, the chatbot functions fully using deterministic rule-based grounded matching.

---

## 5. Running the Application Locally

Start both the Express backend (port 5000) and the Vite frontend (port 5173) with a single command:
```bash
npm run dev:all
```

* **Frontend:** Open `http://localhost:5173`
* **Backend API Health:** Open `http://localhost:5000/api/health`

### How the Vite Dev Proxy Works
[`vite.config.js`](file:///d:/Project/Hackathon/vite.config.js) automatically forwards client requests matching `/api/*` to the Express backend:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

---

## 6. Verification Checklist

1. **API Health Check:**
   Visit `http://localhost:5000/api/health`. Should return `{"status":"ok","supabase_configured":true}`.
2. **User Authentication:**
   Log into `http://localhost:5173` using each seeded account with your `DEMO_PASSWORD`:
   * Student: `student.demo@cb.students.amrita.edu`
   * Faculty: `faculty.demo@cb.amrita.edu`
   * Lab In-Charge: `incharge.demo@cb.amrita.edu`
   * Admin: `admin.demo@cb.amrita.edu`
3. **Database Connectivity:**
   Navigate to the **Hardware Inventory** tab. Confirm items like `10k Ohm Resistors` and `ESP32-S3` appear with their drawer labels.
4. **Booking Lifecycle:**
   Submit a booking as Student $\rightarrow$ Approve it in Faculty portal $\rightarrow$ Confirm student badge updates live.

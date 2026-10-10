# 🏫 Amrita Yukti
### Centralized Innovation Facility Booking & Utilization Portal

> **Amrita Vishwa Vidyapeetham** — Campus Innovation Hackathon Project  
> An AI-driven cross-departmental laboratory, prototyping facility, and hardware inventory matching portal.  
> *(Derived from Sanskrit **Yukti** — Meaning Ingenuity, Skillful Innovation, and Creative Synergy)*

---

## 📌 Problem Statement Alignment
Traditional campus portals require students to manually hunt across isolated departmental silos to figure out where specialized equipment, licensed software (e.g. Vivado, Altium, PyTorch GPU rigs), or 3D printers exist.

**Amrita Yukti** solves this by:
1. **Natural Language Facility Matcher (Chat-First):** Students simply state their project goals or components needed (e.g., *"Training a YOLO drone perception model with PyTorch"* or *"Testing an analog op-amp circuit with a 100MHz DSO"*).
2. **Autonomous Toolchain & Stock Verification:** The system matches the exact campus facility, verifies component inventory and machine availability, and recommends immediate open time slots.
3. **Faculty & Lab In-Charge Approvals:** Real-time cross-tab request routing enabling lab supervisors to review, verify inventory, and approve slot allocations.
4. **Campus Space Radar:** Interactive real-time occupancy heatmaps showing live equipment utilization and free desks.

---

## 🛠️ In-Depth Technical Stack

For full technical specifications, see [**TECH_STACK.md**](./TECH_STACK.md).

* **Frontend:** React 19 (`19.2.8`), Vite 8 (`8.3.4`), Vanilla CSS3 Design System with Amrita Identity Tokens, Lucide React, React-Markdown with GFM & breaks plugins.
* **Backend:** Node.js (ESM), Express.js 5 (`5.3.0`), Reverse Proxy AI Gateway.
* **Database & Cache:** Supabase (PostgreSQL 15) with an offline-resilient in-memory fallback and cross-tab window event synchronization.
* **AI & NLP:** OmniRoute local LLM engine (`vag` model checkpoint on port `:20128`), OpenAI v1 compliant REST API.
* **Networking & DevOps:** ngrok HTTP tunnel forwarding, Concurrently process orchestration, Oxlint linter, Vercel-ready deployment.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
PORT=5000
VITE_OMNIROUTE_BASE_URL=http://localhost:20128/v1
VITE_OMNIROUTE_MODEL=vag
```

### 3. Run Application
Run backend API and frontend client concurrently:
```bash
npm run dev:all
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`

---

## 👥 User Roles & Demo Credentials

* **Student Innovator:** Roll No: `CB.EN.U4CSE23012` | Password: `student123`
* **Faculty & Lab In-Charge:** Emp ID: `AMR-FAC-ECE04` | Password: `faculty123`
* **Portal Administrator:** Username: `admin` | Password: `admin123`

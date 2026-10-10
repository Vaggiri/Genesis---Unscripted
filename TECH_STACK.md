# 🛠️ Amrita InnovateX — Technical Architecture & Stack Specification

**Problem Statement:** Centralized Innovation Facility Booking & Utilization Portal  
**Platform Category:** AI-Powered Campus Facility & Equipment Allocator  
**Institution:** Amrita Vishwa Vidyapeetham  

---

## 1. 🎨 Frontend Tier (Client Interface)

| Component | Technology | Version | Purpose & Architecture Rationale |
| :--- | :--- | :--- | :--- |
| **Core Framework** | **React** | `19.2.8` | High-performance Single Page Application (SPA) leveraging React 19 Hooks (`useState`, `useEffect`, `useCallback`) for reactive UI state. |
| **Build Engine & Bundler** | **Vite** | `8.3.4` | Native ECMAScript Modules (ESM) with instant Hot Module Replacement (HMR) and Rolldown/Rollup optimized chunk splitting. |
| **Styling & Design System** | **Vanilla CSS3** | Custom | Zero framework overhead (no Tailwind/Bootstrap runtime bloat). Utilizes CSS custom property tokens (`--amrita-maroon: #A4123F`), glassmorphism, fluid typography, and sub-second FCP (First Contentful Paint). |
| **Responsive Engine** | **CSS Media Queries** | Native | Dual-mode navigation: desktop segmented pill bar + native mobile bottom navigation bar (`max-width: 768px`) with iOS safe-area handling. |
| **Iconography** | **Lucide React** | `1.55.0` | High-resolution, tree-shaken SVG icon primitives. |
| **Markdown Parser** | **React-Markdown** | `10.1.0` | Real-time AST-based Markdown compilation for streaming LLM responses. |
| **GFM Syntax Extensions** | **remark-gfm** | `4.0.1` | Enables tables, strikethroughs, autolinks, and task list elements. |
| **Line-Break Normalizer** | **remark-breaks** | `4.0.0` | Renders conversational soft returns (`\n`) as HTML line breaks. |

---

## 2. ⚡ Backend Tier (API & AI Gateway)

| Component | Technology | Version | Purpose & Architecture Rationale |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | **Node.js** | `v20+ LTS` | Server-side JavaScript runtime configured with native ES Modules (`"type": "module"`). |
| **Web Application Server** | **Express.js** | `5.3.0` | Next-generation Express 5 kernel with native async/await error propagation and low latency routing. |
| **Cross-Origin Security** | **CORS** | `2.8.6` | Configured to allow decoupled communication between client, local backend, and ngrok tunnel endpoints. |
| **Payload Ingestion** | **express.json** | Native | Parses incoming JSON chat queries and booking transaction bodies. |
| **Tunnel Interstitial Bypass** | **Custom Middleware** | In-House | Injects `'ngrok-skip-browser-warning': 'true'` to eliminate free-tier tunnel warning screens. |
| **API Gateway Role** | **LLM Proxy & Booking Hub** | In-House | Shields upstream AI endpoints, prevents browser CORS restrictions, and guarantees transactional reservation state. |

---

## 3. 🗄️ Database & State Persistence Tier

| Tier Component | Engine | Specifications |
| :--- | :--- | :--- |
| **Primary Cloud Database** | **Supabase (PostgreSQL 15)** | Relational tables for facility inventories, lab machine specs, student records, and booking transactions. Uses `@supabase/supabase-js` (`v2.117.3`). Supports PostgreSQL Row Level Security (RLS) for tenant isolation. |
| **Resilient Hybrid Fallback** | **In-Memory Store + LocalStorage** | Self-healing architecture: if network disconnects or cloud credentials are intentionally unconfigured during judging, portal runs 100% offline with zero demo interruption. |
| **Multi-Tab Realtime Sync** | **Window Storage Event Bus** | Inter-tab broadcast listener syncing student reservations instantly with the faculty approval inbox in real-time without page reload. |

---

## 4. 🧠 Artificial Intelligence & Semantic Matching

| Module | Implementation | Description |
| :--- | :--- | :--- |
| **Model Serving Engine** | **OmniRoute Gateway** | OpenAI v1 compliant API running locally on port `:20128` (`/v1/chat/completions`). |
| **Active Model / Checkpoint** | **`vag`** | Fine-tuned / quantized language model specialized in understanding engineering project requirements (e.g., Vivado DSP, YOLO PyTorch, LM741 circuits, 3D printing STL specs). |
| **Grounding & RAG Pipeline** | **Domain-Specific Registry** | Chat queries are cross-referenced with cataloged equipment specs, software toolchains, and live daily time slots across campus departments. |
| **Deterministic Fallback** | **Rule-Based Heuristic Matcher** | Guarantees instant facility suggestion even during LLM cold start or local GPU throttling. |

---

## 5. 🌐 DevOps, Networking & Tooling

* **Reverse Tunneling:** **ngrok HTTP Bridge** (`ngrok http 20128`) exposing localhost model endpoints for mobile phone evaluation and cloud review.
* **Process Supervisor:** **Concurrently (`10.0.6`)** orchestrating simultaneous execution of frontend Vite (`:5173`) and Express backend (`:5000`) via `npm run dev:all`.
* **Static Analysis & Linting:** **Oxlint (`1.81.0`)** ultra-fast Rust-based linter.
* **Deployment Target:** **Vercel** serverless hosting ready with `vercel.json` SPA rewrite rules.

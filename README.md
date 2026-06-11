# SkillVerse — AI-Powered Vernacular Skill Passport & Local Gig Marketplace

SkillVerse is a venture-backed mobile-first PWA and API platform built to empower India’s ~450 million blue/grey-collar workforce. By replacing traditional resumes with dynamic, AI-verified **Skill Passports**, and incorporating voice-based assessments in local languages, SkillVerse bridges the trust gap between workers and local employers.

---

## 🛠️ The Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Vanilla CSS | Premium cosmic glassmorphic UI, optimized for low-bandwidth mobile viewports |
| **Backend** | Node.js, Express, TypeScript | High-concurrency event-loop suitable for real-time web socket communication |
| **Database** | MongoDB | Highly flexible schema mapping distinct trade profiles with native geospatial indexes |
| **Broker/Queue** | BullMQ & Redis | Asynchronous voice-processing pipeline isolated from the main API thread |
| **Real-time** | Socket.io | Double-blind text/audio communication between workers and hiring managers |
| **Storage** | Local Filesystem / AWS S3 | Abstracted storage client strategy supporting seamless cloud deployment |

---

## 🏗️ Architectural Core Design

SkillVerse is architected as a **Modular Monolith with Clean Architecture** to maximize initial development speed and maintain clean domain separation. 

```text
src/
├── config/              # DB connection, Env configs, AWS & Redis clients
├── core/                # Shared application exceptions, constants, and utilities
├── modules/             # High-Cohesion Domain Modules (Clean Architecture)
│   ├── auth/            # Phone-only verifyOtp, roles, and session tokens
│   ├── worker/          # Skill Passport schemas, public profiles, and resume downloads
│   ├── assessment/      # Asynchronous voice assessment grading & Whisper/LLM engines
│   ├── job/             # Proximity sorted jobs, category filters, and quick voice applications
│   └── chat/            # Real-time WebSocket messaging and application notifications
└── shared/              # Reusable Express middlewares (Auth, RateLimit, Validator)
```

### Key Engineering Decisions
1. **Asynchronous Voice Assessment Pipeline (BullMQ)**: Auto-transcribing regional dialects and executing technical LLM evaluations are time-consuming tasks (5-15s). To prevent API gateway timeouts and Node.js thread blocking, submissions return a `202 Accepted` status immediately, queuing the job to background workers.
2. **Dynamic Proxy Routing**: Built-in environment-based API resolution (`BACKEND_URL` fallback) supporting local development and Docker multi-service container communication seamlessly.
3. **Geospatial Search Engine**: Leveraging MongoDB's `$nearSphere` geospatial queries on a `2dsphere` index (`[longitude, latitude]`) to deliver sub-second, distance-sorted job listings within a localized radius.
4. **macOS AirPlay Compatibility**: The host mapping runs the backend on port `5001` (containerized on `5000`) to completely bypass macOS port conflicts.

---

## 🚀 Quick Start Guide

### Option A: Running Containerized via Docker (Recommended)
Make sure **Docker Desktop** is running on your system, then launch the stack with a single command:
```bash
docker compose up --build
```
*   **Frontend PWA Client**: [http://localhost:3000](http://localhost:3000)
*   **Backend Server API**: [http://localhost:5001](http://localhost:5001)

### Option B: Running Natively
Ensure local MongoDB and Redis instances are running on your host machine:
```bash
# 1. Start database services
brew services start mongodb-community
brew services start redis

# 2. Run both frontend and backend concurrently
npm run dev
```

---

## 📁 System Documentation Reference
Explore the comprehensive, three-phase PM and architectural specifications under the `docs/` folder:
*   [Phase 1: Product Requirement Document (PRD) & Market Analysis](file:///Users/hensi/Desktop/PROJECTS%20Tech/skillverse/docs/phase1_prd.md)
*   [Phase 2: Complete System Architecture & Database Design](file:///Users/hensi/Desktop/PROJECTS%20Tech/skillverse/docs/phase2_architecture.md)
*   [Phase 3: Development Roadmap & Features List](file:///Users/hensi/Desktop/PROJECTS%20Tech/skillverse/docs/phase3_roadmap.md)

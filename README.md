# OpsForge ⚡

> **Build better. Ship smarter.**  
> A production-grade, AI-powered developer and team productivity platform engineered for agile sprint planning, real-time Kanban collaboration, workload analytics, and intelligent project decomposition.

[![CI Status](https://github.com/your-username/opsforge/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/opsforge/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101.svg?logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Executive Summary

**OpsForge** is a full-stack SaaS platform designed to bridge the gap between project management, real-time developer coordination, and AI-assisted engineering operations. 

Unlike basic CRUD project boards or superficial chatbot wrappers, OpsForge implements:
- **Zero-Flicker Optimistic Kanban**: Smooth drag-and-drop state synchronization powered by `@hello-pangea/dnd` and TanStack Query v5 cache reconciliation.
- **Bi-Directional WebSocket Sync**: Room-partitioned real-time event distribution (`project:{id}`, `user:{id}`, `org:{id}`) updating boards, notifications, and presence without page reloads.
- **Pluggable AI Copilot**: A multi-tiered AI layer with an official Google Gemini (`gemini-1.5-flash`) provider and a deterministic, offline-resilient heuristic intelligence engine grounded in live MongoDB data.
- **Strict Role-Based Authorization (RBAC)**: Fine-grained access control across 4 distinct organizational roles (`admin`, `project_manager`, `developer`, `member`) enforced on every REST route.
- **Production DevOps**: Containerized via multi-stage Dockerfiles, covered by automated Vitest integration test suites, and validated through GitHub Actions CI/CD.

---

## 🚀 Live Demo & Role-Based Accounts

The platform includes an automated database seeder (`npm run seed`) creating pre-populated workspaces, tasks, discussions, audit histories, and 4 test accounts.

The login page provides **1-Click Demo Login** buttons for instant reviewer access:

| Role | Demo Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@opsforge.demo` | `Demo1234!` | Full workspace administration, member invitations, role management, project deletion, org analytics |
| **Project Manager** | `manager@opsforge.demo` | `Demo1234!` | Project creation, sprint roadmaps, task assignments, project-level velocity reports |
| **Developer** | `developer@opsforge.demo` | `Demo1234!` | Task execution, status transitions, commenting, triggering AI copilots & subtask breakdowns |
| **Member** | `member@opsforge.demo` | `Demo1234!` | View assigned deliverables, add comments, receive personalized real-time notifications |

---

## 🏗️ System Architecture

OpsForge is structured as a clean, decoupled monorepo separating client and server concerns:

```
opsforge/
├── client/                     # Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── components/         # Reusable UI primitives (Button, Modal, Badge, etc.)
│   │   │   ├── kanban/         # Drag-and-drop Kanban board, columns, and cards
│   │   │   └── layout/         # Responsive Sidebar, Header, Global Search, AppLayout
│   │   ├── contexts/           # AuthContext, SocketContext (real-time), ToastContext
│   │   ├── pages/              # 17 Complete Production Pages
│   │   ├── services/           # Axios API client, query keys, WebSocket event hooks
│   │   └── tests/              # React Testing Library & Vitest test suites
│   ├── index.html              # HTML entrypoint with metadata and favicon
│   └── vite.config.ts          # Manual code splitting chunks (vendor, charts, dnd, icons)
│
├── server/                     # Backend REST API & WebSocket Server
│   ├── src/
│   │   ├── controllers/        # Express handlers (Auth, Projects, Tasks, Analytics, AI)
│   │   ├── middleware/         # JWT auth guard, RBAC role guard, Zod validation, rate limiter
│   │   ├── models/             # Mongoose schemas (User, Organization, Project, Task, etc.)
│   │   ├── routes/             # Versioned REST endpoints (/api/v1/...)
│   │   ├── services/           # Business logic, Socket.IO emitter, AI provider engine
│   │   │   └── ai/             # Pluggable AI layer: Gemini + Heuristic fallback
│   │   ├── sockets/            # Real-time connection handlers and room multiplexers
│   │   ├── scripts/seed.ts     # Idempotent demo database generator
│   │   └── tests/              # Backend integration test suite with Vitest & Supertest
│   └── tsconfig.json           # Strict TypeScript configuration
│
├── docs/                       # Architecture, API specifications, AI design, and Deployment
├── .github/workflows/          # Automated GitHub Actions CI/CD pipeline
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # Container orchestration with local MongoDB
└── package.json                # Monorepo orchestration scripts
```

---

## ⚡ Core Features & Capabilities

### 1. Interactive Kanban Board (`@hello-pangea/dnd`)
- 5 Workflow columns: **Backlog**, **Todo**, **In Progress**, **In Review**, and **Done**.
- **Optimistic UI Updates**: Cards animate and reorder instantly on drop; persistent backend mutations occur asynchronously with automated rollback upon network failure.
- Rich card metadata: Unique issue key (`OPS-1`), priority badges, labels, due date urgency indicators (with overdue flags), subtask completion ratios, and assignee avatars.

### 2. Real-Time Collaboration & Presence (Socket.IO)
- **Room Isolation**: Clients automatically join `project:{id}` rooms upon navigation and leave upon unmounting.
- **Live Board Updates**: Moving a task instantly updates all active teammates' screens without page reloads.
- **Team Presence**: Online/offline indicators in the Team Roster with dynamic socket connection heartbeats.
- **Instant In-App Notifications**: Real-time toast alerts and notification counter increments when assigned to a task or mentioned.

### 3. AI Engineering Copilot (`@google/genai` + Heuristic Engine)
- **Goal-to-Task Decomposition**: Generates comprehensive engineering sprints (database schemas, API endpoints, frontend views, test coverage) from high-level product prompts.
- **Review Prior to Import**: Interactive table allows selecting, modifying, and importing AI-generated tasks directly into the project backlog.
- **Subtask Breakdown**: Generates atomic implementation checklists for complex technical tasks.
- **Workload Prioritization Matrix**: Computes continuous priority scores (1–100) based on upcoming deadlines, active work in progress, and unassigned critical risks.
- **Executive Project Summaries**: Synthesizes roadmap health, risks, completed milestones, and velocity metrics.
- **100% Offline / Quota Resilience**: Seamless automated fallback to the internal heuristic engine if external API keys are unavailable.

### 4. Productivity Analytics Dashboard (Recharts)
- Responsive data visualizations with flexible date ranges (7 Days, 30 Days, 90 Days):
  - **Task Completion Velocity**: Area chart tracking finished tasks over time.
  - **Status & Priority Distribution**: Donut and bar charts highlighting pipeline health.
  - **Team Workload Breakdown**: Bar chart mapping active deliverables per developer to identify bottlenecks.
  - High-level metric cards: Total tasks, active projects, completion rate (%), and overdue count.

### 5. Enterprise Security & Quality
- **JWT Authentication**: Secure token verification with HTTP Bearer authorization headers and password hashing via BCrypt (10 salt rounds).
- **Zod Schema Validation**: Strict input parsing and validation across all POST/PUT/PATCH endpoints.
- **Defensive Middleware**: Helmet HTTP security headers, CORS origin restrictions, and Express rate limiting.

---

## 🛠️ Technology Stack Breakdown

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, TypeScript 5, Tailwind CSS, React Router v6, TanStack Query v5, Recharts, Lucide React, Axios |
| **Backend** | Node.js 18+, Express.js 4, TypeScript, MongoDB, Mongoose 8, Socket.IO 4, Zod, BCrypt, Helmet, CORS |
| **AI Layer** | Google Gemini API (`gemini-1.5-flash`), Pluggable `IAIProvider` interface, Heuristic fallback engine |
| **Testing** | Vitest, Supertest, React Testing Library, jsdom |
| **DevOps** | Docker (multi-stage), Docker Compose, GitHub Actions CI, Vercel SPA deployment |

---

## 💻 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)
- [npm](https://www.npmjs.com/) (v9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/opsforge.git
cd opsforge
```

### 2. Install All Dependencies
```bash
npm run install:all
```
*(Installs dependencies concurrently across root, server, and client)*

### 3. Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```
Default configuration works out-of-the-box for local development:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/opsforge
JWT_SECRET=super-secret-development-jwt-key-replace-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=gemini
GEMINI_API_KEY=
```
*(Note: If `GEMINI_API_KEY` is left blank, OpsForge automatically activates the built-in Heuristic AI engine with zero downtime or setup hurdles)*

### 4. Seed the Database
Populate the database with realistic demo teams, projects, tasks, comments, and audit histories:
```bash
npm run seed
```

### 5. Launch the Development Environment
```bash
npm run dev
```
- **Frontend SPA**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001/api`
- **Health Check**: `http://localhost:5001/api/health`

Log in immediately using any of the 1-Click Demo buttons on the login page!

---

## 🧪 Testing Suite

OpsForge maintains high test coverage across both server-side integration flows and client UI components.

### Run All Tests:
```bash
npm test
```

### Individual Test Suites:
```bash
# Run backend integration tests (Auth, Projects, Tasks, AI, RBAC):
npm --prefix server run test

# Run frontend UI tests (Components, Pages, Buttons, Forms):
npm --prefix client run test
```

---

## 🐳 Docker Deployment

To launch the full production stack via Docker Compose:

```bash
docker compose up -d --build
```
This builds an optimized production container serving the compiled Express API and Vite assets, backed by a persistent MongoDB service.

---

## 📚 Detailed Documentation

Comprehensive architectural and engineering documentation is available in the [`docs/`](docs/) directory:

- [**System Architecture (`docs/architecture.md`)**](docs/architecture.md) — Detailed micro-architecture, data flow, WebSocket room topology, and database schemas.
- [**REST API Reference (`docs/api.md`)**](docs/api.md) — Complete specifications for all 35+ endpoints, request/response contracts, and status codes.
- [**AI Architecture & Copilot (`docs/ai.md`)**](docs/ai.md) — LLM prompt design, JSON schema enforcement, heuristic scoring formulas, and offline fallback mechanics.
- [**Production Deployment Guide (`docs/deployment.md`)**](docs/deployment.md) — Step-by-step guides for Vercel, Render, Railway, and MongoDB Atlas.

---

## 💼 Engineering Resume Highlights

If discussing this project in technical interviews, key architectural achievements to highlight include:

1. **Optimistic UI Synchronization**: Designed an optimistic state pipeline with `@hello-pangea/dnd` and TanStack Query v5 that updates Kanban columns in 0ms, synchronizes with the server asynchronously, and reconciles WebSocket cache invalidations cleanly.
2. **Room-Partitioned Real-Time Engine**: Built a scalable Socket.IO messaging topology that isolates updates to specific project and user channels, eliminating extraneous broadcasts.
3. **Resilient AI Abstraction**: Architected a provider-agnostic intelligence interface with structured JSON schemas and an automatic fallback heuristic engine, ensuring 100% uptime regardless of third-party API availability.
4. **Defensive Monorepo Security**: Enforced multi-tier RBAC on every sensitive endpoint, hardened HTTP headers via Helmet, sanitized database queries, and implemented strict Zod validation schemas.
5. **Production Bundle Optimization**: Configured Vite with custom Rollup manual chunks, reducing initial bundle transfer size and keeping all chunks under 450 kB (gzip ~113 kB).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

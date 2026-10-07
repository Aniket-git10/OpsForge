# OpsForge System Architecture Documentation

## 1. High-Level Architecture Overview

OpsForge is engineered as a modern, decoupled full-stack SaaS platform designed for high responsiveness, real-time collaboration, and resilient AI-assisted sprint planning.

```
+-------------------------------------------------------------------------------+
|                                CLIENT TIER                                    |
|   React 18 SPA + Vite + TypeScript + Tailwind CSS                             |
|   - Declarative routing via React Router v6                                   |
|   - Server state caching & optimistic mutations via TanStack Query v5         |
|   - Drag-and-drop Kanban via @hello-pangea/dnd                                |
|   - Real-time client listeners via Socket.IO-Client                           |
|   - Analytics visualizations via Recharts                                     |
+-------------------------------------------------------------------------------+
                                      |
                       HTTP / REST   |   WebSocket (ws://)
                                      v
+-------------------------------------------------------------------------------+
|                                SERVER TIER                                    |
|   Node.js + Express.js + TypeScript                                           |
|   - Security Layer: Helmet, CORS, Rate Limiters, Cookie Parser                |
|   - Auth & Session: JWT validation, BCrypt hashing, RBAC Guards               |
|   - Validation: Zod schemas for body, query, and params                       |
|   - REST Controllers: Auth, Projects, Tasks, Comments, Activity, Analytics    |
|   - Real-time Engine: Socket.IO Server with JWT handshake & room management   |
+-------------------------------------------------------------------------------+
                |                                               |
                v                                               v
+-------------------------------+               +-------------------------------+
|          DATA TIER            |               |           AI TIER             |
|   MongoDB + Mongoose 8        |               |   Pluggable AI Abstraction    |
|   - Compound indexes          |               |   - Primary: Google Gemini    |
|   - Audit activities          |               |   - Fallback: Heuristic NLP   |
|   - Sequential project keys   |               |     & live database stats     |
+-------------------------------+               +-------------------------------+
```

## 2. Real-Time Collaboration Model

OpsForge utilizes room-based message distribution with Socket.IO:
1. **User Channel (`user:{userId}`)**: Receives personal alerts (task assigned to you, mention, status change).
2. **Organization Channel (`org:{orgId}`)**: Receives presence updates (`presence:update`) tracking who is actively online.
3. **Project Workspace (`project:{projectId}`)**: Broadcasts live Kanban movements (`task:moved`), card creations (`task:created`), edits (`task:updated`), and discussions (`comment:new`).

When a client receives a real-time event, TanStack Query invalidates the active query keys in the background, updating UI components with zero page reloads.

## 3. Security & Role-Based Authorization (RBAC)

The system implements a four-tier authorization hierarchy enforced on every sensitive endpoint:
- **Admin**: Full workspace control, member invitation, role changes, project archiving.
- **Project Manager**: Project creation, roadmap updates, sprint management, member assignment.
- **Developer**: Task execution, status transitions, commenting, triggering AI copilots.
- **Member**: Permitted task views, assigned deliverable updates, notifications.

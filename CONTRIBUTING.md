# Contributing to OpsForge

Thank you for your interest in contributing to OpsForge!

## Development Guidelines

1. **Monorepo Architecture**:
   - `/server`: Node.js, Express, Mongoose, Socket.IO, Zod, Vitest.
   - `/client`: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, Recharts.

2. **Branching & Commit Messages**:
   Follow Conventional Commits:
   - `feat: implement kanban board`
   - `fix: handle socket reconnection on project leave`
   - `test: add auth integration tests`
   - `docs: update deployment documentation`

3. **Running Checks Locally**:
   ```bash
   npm test
   npm run build
   ```

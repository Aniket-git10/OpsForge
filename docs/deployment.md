# OpsForge Production Deployment Guide

This guide covers production deployment configurations for OpsForge across popular free-tier/low-cost platforms (Vercel, Render/Railway, MongoDB Atlas) as well as Docker container orchestration.

---

## 1. Architecture & Hosting Topology

```
+-----------------------------+           +-----------------------------+
|      Vercel / Netlify       |           |       Render / Railway      |
|     (Frontend React SPA)    | --------> |     (Backend Node Server)   |
|   https://opsforge.app      |  HTTPS/WS |   https://api.opsforge.app  |
+-----------------------------+           +-----------------------------+
                                                         |
                                                         v
                                          +-----------------------------+
                                          |      MongoDB Atlas M0       |
                                          |     (Cloud Database)        |
                                          |   mongodb+srv://cluster...  |
                                          +-----------------------------+
```

---

## 2. Cloud Database Setup: MongoDB Atlas (Free Tier)

1. Register or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **M0 Free Cluster** in your preferred region.
3. Under **Security > Database Access**, add a database user:
   - Username: `opsforge_app`
   - Password: `<generate-strong-password>`
   - Role: `Read and write to any database`
4. Under **Security > Network Access**, click **Add IP Address**:
   - For cloud providers (Render, Railway, Vercel), allow access from anywhere: `0.0.0.0/0`.
5. Under **Deployments > Database**, click **Connect**:
   - Choose **Drivers (Node.js)** and copy your connection string:
     ```
     mongodb+srv://opsforge_app:<password>@cluster0.abcde.mongodb.net/opsforge?retryWrites=true&w=majority
     ```

---

## 3. Backend Deployment: Render.com / Railway

### Option A: Render Web Service

1. Create a new **Web Service** linked to your GitHub repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add **Environment Variables**:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables optimized Express settings |
   | `PORT` | `10000` (or leave default) | Render injects `PORT` automatically |
   | `MONGO_URI` | `mongodb+srv://opsforge_app:...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `<32-char-random-string>` | e.g. generated via `openssl rand -hex 32` |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `CORS_ORIGIN` | `https://your-opsforge-frontend.vercel.app` | Exact production frontend URL |
   | `AI_PROVIDER` | `gemini` (or `heuristic`) | Heuristic will automatically work if no key |
   | `GEMINI_API_KEY` | `AIzaSy...` (Optional) | Free from Google AI Studio |

---

### Option B: Railway

1. Click **New Project > Deploy from GitHub repo**.
2. Set Root Directory to `/server`.
3. Add the same Environment Variables listed above. Railway automatically provisions an HTTPS endpoint and handles WebSocket upgrades without extra configuration.

---

## 4. Frontend Deployment: Vercel

1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://your-opsforge-backend.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://your-opsforge-backend.onrender.com` |
4. **SPA Rewrites**:
   The repository already includes `client/vercel.json` to route all dynamic SPA paths to `index.html`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Click **Deploy**. Vercel will build the frontend assets with code splitting and deploy to a global edge CDN.

---

## 5. Docker Orchestration (Self-Hosted / VPS)

OpsForge includes a production multi-stage `Dockerfile` and `docker-compose.yml`.

### Running Locally or on a VPS:

1. Clone the repository and configure `.env`:
   ```bash
   cp .env.example .env
   # Edit .env with your production credentials
   ```

2. Build and launch the container stack:
   ```bash
   docker compose up -d --build
   ```

3. Verify service health:
   ```bash
   docker compose ps
   curl http://localhost:5001/api/health
   ```

4. View logs:
   ```bash
   docker compose logs -f app
   ```

---

## 6. Database Seeding in Production

To populate your production or staging database with the demo organization, realistic projects, tasks, and role-based test accounts:

```bash
# From local machine with Atlas MONGO_URI set:
MONGO_URI="mongodb+srv://opsforge_app:<password>@cluster0.abcde.mongodb.net/opsforge" npm run seed
```

This provisions:
- Workspace: **OpsForge Demo Engineering**
- Accounts: `admin@opsforge.demo`, `manager@opsforge.demo`, `developer@opsforge.demo`, `member@opsforge.demo`
- Password: `Demo1234!`
- 3 Projects: Platform Infrastructure (`OPS`), Mobile App (`MOB`), SRE Reliability (`SRE`)
- 9 Tasks across Backlog, Todo, In Progress, In Review, and Done.

---

## 7. Automated CI/CD Pipeline

The `.github/workflows/ci.yml` pipeline triggers automatically on all pushes and pull requests to `main`:
1. Launches an isolated ephemeral MongoDB 7 service container.
2. Checks out code and installs dependencies for root, server, and client.
3. Runs the backend Vitest integration suite (19 tests).
4. Runs the frontend React Testing Library suite (5 tests).
5. Executes `tsc` and Vite production bundle optimization.

This guarantees that breaking changes, type errors, or bundle regressions can never be merged into production.

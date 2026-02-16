# Event Management Assignment

Monorepo scaffold for Bellcorp Event Management assignment.

Structure:
- `backend/` — Express + SQLite API
- `frontend/` — React + Vite app

This repo uses SQLite (per your preference) and contains a single README.

Local development
1. Backend

Install and seed the database, then start the server:

```powershell
cd backend
npm install
npm run seed
npm run dev
```

The backend runs on port `4000` by default.

2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite dev server typically runs on `http://localhost:5173`.

Notes
- Use the demo credentials created by the seed script: `demo@bellcorp.test` / `password123`.
- To change allowed frontend origin, set `FRONTEND_ORIGIN` in `backend/.env`.
- Only one README is present at the repository root.

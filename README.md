# ShopEZ — Full-Stack E-commerce (Local)

Lightweight MERN example app (backend + React frontend) for local development.

## Prerequisites
- Node.js (v18+ recommended)
- npm (use `npm.cmd` on Windows PowerShell if execution policy blocks `npm`)
- MongoDB Server installed and running locally (or set `MONGO_URI` to Atlas)

## Quick start (local)

1. Start MongoDB (Windows):

```powershell
# If installed as a service
net start MongoDB

# Or run mongod directly for testing
mkdir C:\data\db -Force
mongod --dbpath "C:\data\db"
```

2. Seed the database (from project root):

```powershell
cd backend
npm.cmd install
npm.cmd run seed
```

3. Start backend (dev):

```powershell
cd backend
npm.cmd run dev
```

4. Start frontend (dev):

```powershell
cd frontend
npm.cmd install
npm.cmd start
```

Open http://localhost:3000 (frontend) — it fetches API from http://localhost:5000/api by default.

## Environment
- Backend: copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`.
- Frontend: `frontend/.env` contains `REACT_APP_API_URL=http://localhost:5000/api`.

## Git
- Repo remote set to your GitHub origin already. To push local commits:

```powershell
git add .
git commit -m "Add README and run instructions"
git push -u origin main
```

## Notes
- This project includes a `seed` script to populate a small catalog and test users.
- For production use, switch `MONGO_URI` to a managed cluster (MongoDB Atlas) and secure `JWT_SECRET`.

If you want, I can add CI, a Docker Compose file, or deploy this to a cloud service — tell me which one.

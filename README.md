# Timeline Tracker

A minimal, dark-themed tracker for placement drives. Each company/process is a
glowing vertical timeline (git-graph style); every important date becomes a
node you can click for details. Data lives in your own MongoDB cluster, so
it's the same across every device.

**Stack:** React + Vite (frontend) · Node/Express + Mongoose (backend) · MongoDB Atlas

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and paste your MongoDB Atlas connection string into `MONGODB_URI`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/placement-tracker?retryWrites=true&w=majority
```

(In Atlas: make sure your current IP — or `0.0.0.0/0` for access from anywhere —
is allow-listed under Network Access, and that the DB user has read/write
permissions.)

Run it:

```bash
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/api/health`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` already points at `http://localhost:5000` for local dev — leave it as is.

```bash
npm run dev
```

Open `http://localhost:5173`.

## 3. Using the app

- **+ New timeline** in the sidebar → name it (e.g. a company name) → you're
  immediately prompted to add its first date.
- Each timeline row has **+** (add another date), **✎** (rename), **✕** (delete).
- Click any glowing node on the graph to see its time and message, or to edit/delete it.
- The graph auto-scrolls to today on load, marked with a dashed amber line.
- Every timeline gets a random neon color when created.

## 4. Deploying to Render

This repo includes a `render.yaml` Blueprint that provisions both services in one go.

1. Push this project to a GitHub repo.
2. In Render: **New → Blueprint**, point it at the repo.
3. Render creates two services:
   - `placement-tracker-api` (Node web service, backend)
   - `placement-tracker-web` (static site, frontend)
4. Set the environment variables it asks for:
   - On the **api** service: `MONGODB_URI` (your Atlas string), `CLIENT_ORIGIN` (your frontend's Render URL, e.g. `https://placement-tracker-web.onrender.com`)
   - On the **web** service: `VITE_API_URL` (your backend's Render URL, e.g. `https://placement-tracker-api.onrender.com`)
5. Deploy. Once both are live, open the frontend URL — it works from any device/browser, all reading/writing the same MongoDB cluster.

No Blueprint? You can create the two services manually in the Render dashboard
using the same root directories/commands as in `render.yaml`.

## Project structure

```
placement-tracker/
├── backend/          Express API (Timeline + embedded date nodes)
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/          React + Vite UI
│   └── src/
│       ├── components/
│       ├── App.jsx
│       └── api.js
└── render.yaml        One-click deploy blueprint
```

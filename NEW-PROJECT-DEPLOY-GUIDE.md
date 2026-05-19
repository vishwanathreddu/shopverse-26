# Full guide: Build a MERN app & deploy (steps 1 → end)

Use this checklist for **any** full-stack project like ShopVerse:
- **Frontend:** React + Vite (or Next.js)
- **Backend:** Node + Express API
- **Database:** MongoDB

**Free stack:** GitHub + MongoDB Atlas + Render (API) + Vercel (website)

---

## Phase 0 — Build the app on your computer

| Step | What to do |
|------|------------|
| 0.1 | Create project folders: `backend/`, `frontend/` |
| 0.2 | Backend: Express, Mongoose, JWT auth, `.env.example` |
| 0.3 | Frontend: React, Vite, call API with `axios` + `VITE_API_URL` |
| 0.4 | Test locally: MongoDB (Docker or local) → `npm run dev` both sides |
| 0.5 | Add `README.md`, `.gitignore` (ignore `node_modules`, `.env`, `dist`) |
| 0.6 | Optional: seed script (`npm run seed`) for demo data |

**Local env example:**

```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/myapp
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=dev-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-change-in-production

# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

---

## Phase 1 — Put code on GitHub

| Step | What to do |
|------|------------|
| 1.1 | `cd your-project` |
| 1.2 | `git init` → `git branch -m main` |
| 1.3 | `git add .` → `git commit -m "Initial commit"` |
| 1.4 | GitHub → [github.com/new](https://github.com/new) → repo name → **Public** → **no README** |
| 1.5 | Connect & push: |

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

| 1.6 | Refresh GitHub — all files visible |

---

## Phase 2 — Online database (MongoDB Atlas)

| Step | What to do |
|------|------------|
| 2.1 | Sign up: [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register) |
| 2.2 | Create **free M0** cluster → wait until **Available** |
| 2.3 | **Network Access** → **Allow Access from Anywhere** (`0.0.0.0/0`) |
| 2.4 | **Database Access** → Add user (username + **save password**) |
| 2.5 | **Database** → **Connect** → **Drivers** → copy connection string |
| 2.6 | Edit string: replace `<password>`, add database name before `?`: |

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority
```

| 2.7 | Seed production DB **once** from your PC: |

```bash
cd backend
# Put Atlas URI in .env as MONGODB_URI=...
npm install
npm run seed
```

**Never commit `.env` or paste passwords in chat.**

---

## Phase 3 — Deploy API (Render)

| Step | What to do |
|------|------------|
| 3.1 | [dashboard.render.com](https://dashboard.render.com) → sign up with **GitHub** |
| 3.2 | **New +** → **Web Service** → select your repo |
| 3.3 | Settings: |

| Field | Value |
|-------|--------|
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

> Use `--include=dev` so TypeScript types install during build (`NODE_ENV=production` skips them otherwise).

| 3.4 | Environment variables: |

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET` | long random string (32+ chars) |
| `JWT_REFRESH_SECRET` | different random string |
| `CLIENT_URL` | `https://placeholder.vercel.app` *(fix in Phase 5)* |
| `JWT_ACCESS_EXPIRES` | `15m` |
| `JWT_REFRESH_EXPIRES` | `7d` |

| 3.5 | **Create** → wait until **Live** |
| 3.6 | Test: `https://YOUR-SERVICE.onrender.com/api/health` → JSON success |

**Backend `package.json` must have:**

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js"
}
```

**Cross-origin cookies (Vercel + Render):** in production use `sameSite: 'none'`, `secure: true` for refresh cookies, and `app.set('trust proxy', 1)`.

---

## Phase 4 — Deploy website (Vercel)

| Step | What to do |
|------|------------|
| 4.1 | [vercel.com](https://vercel.com) → sign up with **GitHub** |
| 4.2 | **Add New** → **Project** → import repo |
| 4.3 | **Root Directory** → `frontend` |
| 4.4 | Environment variable: |

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-SERVICE.onrender.com/api` |

| 4.5 | **Deploy** → copy URL e.g. `https://my-app.vercel.app` |
| 4.6 | Add `vercel.json` in frontend for SPA routing (optional): |

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Phase 5 — Connect frontend ↔ backend

| Step | What to do |
|------|------------|
| 5.1 | Render → your API → **Environment** |
| 5.2 | Set `CLIENT_URL` = your **exact** Vercel URL (no trailing slash) |

```text
CLIENT_URL=https://my-app.vercel.app
```

| 5.3 | Save → Render redeploys (~2 min) |
| 5.4 | Open Vercel site → test login, API calls, checkout |

**If CORS or login fails:** `CLIENT_URL` mismatch is the #1 cause.

---

## Phase 6 — Resume & README

| Step | What to do |
|------|------------|
| 6.1 | Edit GitHub `README.md` top section: |

```markdown
**Live demo:** [my-app.vercel.app](https://my-app.vercel.app)
**GitHub:** [YOUR_USERNAME/YOUR_REPO](https://github.com/YOUR_USERNAME/YOUR_REPO)
```

| 6.2 | Push: `git add README.md && git commit -m "docs: live links" && git push` |
| 6.3 | Resume bullet example: |

```text
ProjectName — MERN stack (React, TypeScript, Node.js, MongoDB)
Live: https://my-app.vercel.app | Code: https://github.com/YOUR_USERNAME/YOUR_REPO
```

---

## Quick reference — URLs you will have

| Service | URL pattern |
|---------|-------------|
| GitHub | `https://github.com/USER/REPO` |
| Atlas | connection string only (not public) |
| Render API | `https://something.onrender.com` |
| Vercel app | `https://something.vercel.app` |
| Health check | `https://something.onrender.com/api/health` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Render build fails (TypeScript / `@types`) | Build: `npm install --include=dev && npm run build` |
| `/api/health` Not Found | API not Live; wrong URL; deploy failed |
| Blank products / CORS error | Set `CLIENT_URL` on Render = Vercel URL |
| Login works then fails | Cookie `sameSite` / `CLIENT_URL` / cold start on Render |
| Slow first load | Render free tier cold start (~30s) — normal |
| Empty database | Run `npm run seed` with Atlas `MONGODB_URI` |

---

## Security reminders

- [ ] Never commit `.env`
- [ ] Use strong `JWT_*` secrets in production
- [ ] Rotate DB password if it was shared
- [ ] Atlas: restrict IP later if you move off free Render

---

## ShopVerse example (your live project)

| Item | Link |
|------|------|
| Live site | https://shopverse-26.vercel.app |
| API | https://shopverse-26-api.onrender.com |
| GitHub | https://github.com/vishwanathreddu/shopverse-26 |

---

## Optional later

- Custom domain (Vercel → Domains)
- Stripe keys for real payments
- Resend / SMTP for emails
- GitHub Actions CI (tests on push)
- Render paid plan (no cold start)

---

**Print this file or keep it in every new repo as `DEPLOY-GUIDE.md`.**

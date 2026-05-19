# ShopVerse — Deploy for GitHub & Resume

Deploy the **free tier** stack: **MongoDB Atlas** + **Render** (API) + **Vercel** (frontend).

Estimated time: **30–45 minutes** (one-time setup).

---

## Overview

| Piece | Service | URL example |
|-------|---------|-------------|
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | `mongodb+srv://...` |
| Backend API | [Render](https://render.com) | `https://shopverse-api.onrender.com` |
| Frontend | [Vercel](https://vercel.com) | `https://shopverse.vercel.app` |
| Code | [GitHub](https://github.com) | `https://github.com/YOUR_USERNAME/shopverse` |

---

## Step 1 — Push to GitHub

From the project folder:

```bash
cd /home/vishwanath/Desktop/vishwanath/Documents/shopverse

git init
git add .
git commit -m "ShopVerse: MERN e-commerce portfolio app"

# Create repo on GitHub (browser or CLI):
gh repo create shopverse --public --source=. --remote=origin --push
```

Or create an empty repo on GitHub named `shopverse`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/shopverse.git
git branch -M main
git push -u origin main
```

---

## Step 2 — MongoDB Atlas

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a **free M0** cluster.
3. **Database Access** → Add user (username + password). Save the password.
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for Render.
5. **Database** → **Connect** → **Drivers** → copy the connection string.
6. Replace `<password>` with your user password and set the database name:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/shopverse?retryWrites=true&w=majority
   ```

---

## Step 3 — Seed production data (once)

From your machine, with Atlas URI:

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI to your Atlas string only (other vars optional for seed)

npm install
npm run seed
```

This creates demo products and accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopverse.dev | Admin123! |
| User | demo@shopverse.dev | Demo123! |

---

## Step 4 — Deploy backend (Render)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect your **GitHub** repo `shopverse`.
3. Settings:

   | Field | Value |
   |-------|--------|
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |
   | Health Check Path | `/api/health` |

4. **Environment variables** (Environment tab):

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your Atlas connection string |
   | `JWT_ACCESS_SECRET` | Random 32+ chars ([generator](https://generate-secret.vercel.app/32)) |
   | `JWT_REFRESH_SECRET` | Different random 32+ chars |
   | `CLIENT_URL` | `https://YOUR-APP.vercel.app` *(update after Step 5)* |
   | `JWT_ACCESS_EXPIRES` | `15m` |
   | `JWT_REFRESH_EXPIRES` | `7d` |

   Optional later: `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CLOUDINARY_*`

5. **Create Web Service**. Note the URL, e.g. `https://shopverse-api.onrender.com`.

6. Test: open `https://shopverse-api.onrender.com/api/health` → should return `{"success":true,...}`.

> **Note:** Free Render services spin down after inactivity; first request may take ~30s.

---

## Step 5 — Deploy frontend (Vercel)

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import `shopverse` from GitHub.
2. Settings:

   | Field | Value |
   |-------|--------|
   | Framework Preset | Vite |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. **Environment variable**:

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | `https://shopverse-api.onrender.com/api` |

   Use your actual Render URL from Step 4.

4. **Deploy**. Copy the Vercel URL, e.g. `https://shopverse-xyz.vercel.app`.

---

## Step 6 — Link frontend ↔ backend (CORS)

1. In **Render** → your service → **Environment** → set:

   ```
   CLIENT_URL=https://shopverse-xyz.vercel.app
   ```

   (Exact Vercel URL, no trailing slash.)

2. **Save** → Render redeploys automatically.

3. In **Vercel**, confirm `VITE_API_URL` points to Render `/api`.

4. Open the Vercel site → **Sign in** with `demo@shopverse.dev` / `Demo123!` → browse, cart, checkout.

---

## Step 7 — Resume & README

Add to your resume / LinkedIn:

```text
ShopVerse — Full-stack MERN e-commerce (TypeScript, JWT, Stripe-ready, admin panel)
Live: https://YOUR-APP.vercel.app
GitHub: https://github.com/YOUR_USERNAME/shopverse
```

Update `README.md` at the top:

```markdown
**Live demo:** https://YOUR-APP.vercel.app  
**Repo:** https://github.com/YOUR_USERNAME/shopverse
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | `CLIENT_URL` on Render must exactly match Vercel URL |
| 401 / session drops | Redeploy Render after setting `CLIENT_URL`; cookies use `SameSite=None` in prod |
| API slow first load | Render free tier cold start — normal |
| Empty product list | Run `npm run seed` against Atlas `MONGODB_URI` |
| Build fails on Render | Root Directory must be `backend` |

---

## Optional upgrades

- **Custom domain** on Vercel → update `CLIENT_URL` on Render to match.
- **Stripe** test keys for real checkout flow.
- **Resend** for order confirmation emails in production.
- **Render paid** plan to avoid cold starts for demos.

---

## Quick checklist

- [ ] GitHub repo pushed
- [ ] Atlas cluster + `MONGODB_URI`
- [ ] `npm run seed` against Atlas
- [ ] Render API live (`/api/health` OK)
- [ ] Vercel frontend live
- [ ] `CLIENT_URL` = Vercel URL
- [ ] `VITE_API_URL` = Render `/api`
- [ ] Login works on live site
- [ ] README updated with live + repo links

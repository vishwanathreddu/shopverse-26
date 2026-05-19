# Start here — deploy ShopVerse (simple)

Your code is **ready on your computer**. We only need 4 websites (all free).

Do **one step**, then tell the AI "done step 1" (or paste any error).

---

## Step 1 — Put code on GitHub (you do this once)

1. Open: **https://github.com/new**
2. Repository name: `shopverse`
3. Choose **Public**
4. **Do NOT** tick "Add a README"
5. Click **Create repository**
6. GitHub shows commands. Use these in your terminal:

```bash
cd /home/vishwanath/Desktop/vishwanath/Documents/shopverse
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/shopverse.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your real GitHub username.

7. Refresh GitHub — you should see all project files.

**When Step 1 is done, go to Step 2 in the next message.**

---

## Step 2 — Database (MongoDB Atlas)

1. Open: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up (free)
3. Create a **free M0** cluster (defaults are fine)
4. Left menu → **Database Access** → **Add New Database User**
   - Username: `shopverse`
   - Password: click **Autogenerate** → **copy and save it**
5. Left menu → **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
6. Left menu → **Database** → your cluster → **Connect** → **Drivers**
7. Copy the connection string. It looks like:
   `mongodb+srv://shopverse:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
8. Change the end to use database name `shopverse`:
   `mongodb+srv://shopverse:PASSWORD@cluster0.xxxxx.mongodb.net/shopverse?retryWrites=true&w=majority`
   (Replace `PASSWORD` with the password you saved.)

9. On your computer, seed the database:

```bash
cd /home/vishwanath/Desktop/vishwanath/Documents/shopverse/backend
nano .env
```

Paste one line (use YOUR connection string):

```
MONGODB_URI=mongodb+srv://shopverse:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/shopverse?retryWrites=true&w=majority
```

Save (Ctrl+O, Enter, Ctrl+X), then:

```bash
npm install
npm run seed
```

You should see "Seed completed".

---

## Step 3 — Backend API (Render)

1. Open: **https://dashboard.render.com** → sign up with **GitHub**
2. **New +** → **Web Service** → connect repo **shopverse**
3. Fill in:

| Field | Value |
|-------|--------|
| Name | `shopverse-api` |
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |

4. Scroll to **Environment Variables** → Add:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | (paste your Atlas string from Step 2) |
| `JWT_ACCESS_SECRET` | any long random text, e.g. `mySecretAccessKey2026ShopVerse32chars` |
| `JWT_REFRESH_SECRET` | different random text |
| `CLIENT_URL` | `https://placeholder.vercel.app` (we fix after Step 4) |

5. Click **Create Web Service**
6. Wait until **Live** (green). Copy your URL, e.g. `https://shopverse-api.onrender.com`
7. Test in browser: `https://shopverse-api.onrender.com/api/health` → should show JSON success.

---

## Step 4 — Website (Vercel)

1. Open: **https://vercel.com** → sign up with **GitHub**
2. **Add New** → **Project** → import **shopverse**
3. **Root Directory** → Edit → choose `frontend`
4. **Environment Variables** → add:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://shopverse-api.onrender.com/api` |

(use YOUR Render URL from Step 3 + `/api` at the end)

5. Click **Deploy**
6. Copy your site URL, e.g. `https://shopverse-abc.vercel.app`

---

## Step 5 — Connect frontend and backend

1. Go back to **Render** → your service → **Environment**
2. Change `CLIENT_URL` to your **Vercel URL** (no slash at end):
   `https://shopverse-abc.vercel.app`
3. Save → Render redeploys (wait ~2 min)
4. Open your Vercel URL → **Sign in**:
   - Email: `demo@shopverse.dev`
   - Password: `Demo123!`

If login works, you are **live** for your resume.

---

## Resume text (copy after Step 5)

```
ShopVerse — MERN e-commerce (React, Node, MongoDB, TypeScript)
Live: https://YOUR-VERCEL-URL.vercel.app
Code: https://github.com/YOUR_USERNAME/shopverse
```

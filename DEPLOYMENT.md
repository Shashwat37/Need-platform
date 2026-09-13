# NEED Platform — Deployment Guide

This project has two parts that are deployed separately:

| Part | Platform | Why |
|------|----------|-----|
| **Backend** (Flask + SQLite) | [Render](https://render.com) | Needs a persistent process and filesystem |
| **Frontend** (React + Vite) | [Vercel](https://vercel.com) | Serves static files, zero config |

Both platforms have a **free tier** that is sufficient for a demo/prototype.

---

## Step 1 — Deploy Backend to Render

### Option A — Blueprint (recommended, one click)
1. Go to [render.com/dashboard](https://dashboard.render.com)
2. **New → Blueprint**
3. Connect your GitHub repo (`Shashwat37/neend-platform`)
4. Render will find `render.yaml` at the root and configure everything automatically
5. Review the settings → **Apply**

### Option B — Manual Web Service
1. Go to [render.com/dashboard](https://dashboard.render.com)
2. **New → Web Service**
3. Connect `Shashwat37/neend-platform`
4. Fill in:
   - **Name:** `neend-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Plan:** Free
5. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | (click Generate) |
   | `FLASK_ENV` | `production` |
   | `CORS_ORIGINS` | `https://need-platform-five.vercel.app` |
   | `AUTO_SEED` | `true` *(auto-seeds demo data on first boot)* |
   | `OTP_DEMO_MODE` | `true` |
   | `DEFAULT_DEMO_OTP` | `123456` |
   *(Leave `DATABASE_URL` empty to use default persistent SQLite)*
6. **Create Web Service** → wait ~2-3 minutes for the first build

### Demo database seeding
With `AUTO_SEED=true`, the platform automatically initializes and seeds all demo data (workers, services, categories, users) upon initial startup. No manual shell commands are needed!

### Verify backend is live
Visit `https://<your-render-url>/api/health` — you should see:
```json
{ "service": "need-backend", "status": "ok" }
```

---

## Step 2 — Deploy Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → select `Shashwat37/neend-platform`
3. Framework will be auto-detected as **Vite**
4. Set **Root Directory** to `frontend`
5. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-render-url>/api` |
6. Click **Deploy** → wait ~1 minute

Copy the Vercel URL (e.g. `https://need-platform-five.vercel.app`).

---

## Step 3 — Wire Them Together

1. Go back to **Render → neend-backend → Environment**
2. Update `CORS_ORIGINS` to your exact Vercel URL:
   ```
   https://need-platform-five.vercel.app
   ```
3. Click **Save Changes** — Render redeploys automatically

---

## Step 4 — Verify End-to-End

1. Open your Vercel URL in the browser
2. The home page stats (workers, services) should show real numbers from the database
3. Log in as `ananya@example.com` / `demo123` — you should land on the customer dashboard

If the home page shows zeros → the database is not seeded. Run `python seed.py` in the Render Shell.

---

## Common Issues

| Problem | Fix |
|---------|-----|
| First request takes 30–50 sec | Normal — Render free tier cold-starts after 15 min idle |
| CORS error in browser console | `CORS_ORIGINS` on Render does not match your Vercel URL exactly — check for trailing slash |
| Login works but session is lost immediately | `FLASK_ENV` is not set to `production` on Render — secure cookies require HTTPS |
| `python seed.py` fails on Render Shell | Make sure the build succeeded first; check Render Logs tab |
| Vercel build fails | Ensure **Root Directory** is set to `frontend` in Vercel project settings |

---

## Local Development (no change)

Nothing changes for local development:

```bash
# Terminal 1 — backend
cd backend
python app.py

# Terminal 2 — frontend
cd frontend
npm run dev
```

The `.env` files (not in git) still control local settings.


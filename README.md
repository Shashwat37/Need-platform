<h1 align="center">
  <br>
  🛠️ NEED
  <br>
</h1>

<p align="center">
  <strong>A cooperative-owned digital marketplace connecting customers with verified local service providers</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Vite-5.4.8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Student%20Prototype-orange?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/Payment-Simulated-yellow?style=flat-square" alt="Payment">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

---

On a normal service app, a private company owns the platform and takes a large cut of every job.
On **NEED**, the workers are members of the cooperative that owns the platform — the commission is small, and a slice of each job is saved into the worker's own **welfare wallet**.

> ⚠️ **This is a student project prototype** built for a college demonstration.
> The payment flow is fully simulated. Invoices, welfare splits and wallet balances are real database records, but **no real money moves** and no bank or UPI provider is connected.

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Quick Start (Windows)](#-quick-start-windows)
5. [Manual Installation](#-manual-installation)
6. [Running the App](#-running-the-app)
7. [Database Setup](#-database-setup)
8. [Demo Accounts](#-demo-accounts)
9. [API Reference](#-api-reference)
10. [AI Features](#-ai-features)
11. [Build Progress](#-build-progress)
12. [Troubleshooting](#-troubleshooting)
13. [Future Scope](#-future-scope)
14. [Contributing](#-contributing)

---

## ✨ Features

### For Customers
- 🔍 Browse **20 services** across Home, Appliance and Other categories
- 🔎 Search verified workers and filter by service, city, rating or experience
- 📅 Book a worker for a chosen date and time, with an option to mark it **urgent**
- ⚡ Or let the system **auto-assign** the top-rated available verified partner
- 💳 Simulated UPI / card / cash payment that produces an itemised **invoice**
- 💝 Add a **tip** at checkout — goes to the worker in full, no cut taken

### For Workers
- 📝 Register as a worker, then wait for the cooperative to **verify** the account
- ✅ **Accept or decline** every job — a job is assigned, never forced
- 🟢 Toggle **online / offline**, so no job arrives while unavailable
- 📊 Track earnings, completed jobs and running rating
- 💰 **Welfare wallet** that grows with every job — set aside for insurance and emergencies

### For Cooperative Admin
- 🏛️ Approve or reject worker **verification requests**
- 📈 Monitor bookings, payments and welfare contributions across the platform

### Shared
- 🏅 Verification badges in three states: **Verified**, **Pending**, **Rejected**

### ⏳ Not Yet Built
Listed here so nothing in this README oversells the demo:

- Customer ratings and reviews (Step 9 — partially done)
- Support tickets and disputes (Step 12)
- AI chatbot (Step 13) and demand forecasting (Step 14)
- Hindi / multilingual support (Step 15)
- Document upload for worker verification
- Real GPS distance calculation (workers have lat/lon stored, but no distance is computed)

---

## 🛠️ Tech Stack

| Layer       | Choice                    | Why                                                           |
|-------------|---------------------------|---------------------------------------------------------------|
| Frontend    | React 18 + JavaScript     | Component-based; JS keeps setup simple                        |
| Build Tool  | Vite 5                    | Starts in under a second, instant HMR on save                 |
| Styling     | Tailwind CSS 3            | Styles live next to markup — nothing is hard to find          |
| Routing     | React Router 6            | Real URLs like `/login` without a page reload                 |
| HTTP Client | Axios                     | One configured instance instead of `fetch` boilerplate        |
| Icons       | Lucide React              | Clean icon set, imported one at a time                        |
| Backend     | Python Flask 3            | Small enough to read end-to-end in one sitting                |
| Database    | SQLite via SQLAlchemy     | A single file, no server to install                           |
| Passwords   | Werkzeug hashing          | Ships with Flask; passwords never stored as plain text        |

**Deliberately not used:** Docker, JWT refresh-token rotation, Redis, Celery, microservices.

---

## 📁 Project Structure

```
need-platform/
├── backend/
│   ├── app.py              # Entry point — creates and starts the Flask app
│   ├── auth.py             # Register, login, session check, logout
│   ├── config.py           # Config class, reads from .env
│   ├── models.py           # All 10+ database tables in one readable file
│   ├── routes.py           # All API endpoints (prefixed /api)
│   ├── seed.py             # Fills the database with realistic demo data
│   ├── requirements.txt    # Python packages (pinned versions)
│   ├── .env.example        # Template — copy to .env and fill in keys
│   └── instance/
│       └── database.db     # Created automatically — NOT in git
│
├── frontend/
│   ├── index.html          # The single HTML shell React attaches to
│   ├── package.json        # JavaScript dependencies
│   ├── vite.config.js      # Dev server + proxy settings
│   ├── tailwind.config.js  # Design system — colours, fonts, shadows
│   ├── postcss.config.js   # Wires Tailwind into the build pipeline
│   ├── .env.example        # Template — copy to .env and fill in keys
│   └── src/
│       ├── main.jsx        # React entry point
│       ├── App.jsx         # URL → page map (React Router)
│       ├── index.css       # Tailwind imports + reusable .btn / .card classes
│       ├── components/     # Reusable UI pieces (modals, navbar, etc.)
│       ├── context/
│       │   └── AuthContext.jsx   # Global auth state shared with every page
│       ├── pages/          # One file per screen / route
│       ├── services/
│       │   └── api.js      # Every backend call lives here
│       └── utils/          # Helper utilities
│
├── setup-windows.bat       # One-time setup script (Windows)
├── setup-mac.sh            # One-time setup script (macOS/Linux)
├── start-demo.bat          # Starts backend + frontend at once (Windows)
├── start-demo.sh           # Starts backend + frontend at once (macOS/Linux)
├── run-backend.bat/.sh     # Starts Flask only
├── run-frontend.bat/.sh    # Starts Vite only
├── .gitignore
└── README.md
```

### Three Golden Rules Before Editing

| Rule | Detail |
|------|--------|
| 📡 **All backend calls go through `api.js`** | If the backend address changes, that is the only file to edit |
| 🎨 **All colours come from `tailwind.config.js`** | Use `text-brand-600`, not `text-[#0E6E62]` |
| 💵 **Money split lives in `routes.py` constants** | `WELFARE_RATE`, `WORKER_SHARE`, `WALLET_LIQUID_SHARE`, etc. Change these on the server — but also update the hardcoded copies in `PaymentModal.jsx` and `BookingModal.jsx` |

---

## ⚡ Quick Start (Windows)

```bash
# 1. Clone the repository
git clone https://github.com/vikram91176-web/neend-platform.git
cd neend-platform

# 2. One-time setup (creates venv, installs packages, seeds the database)
setup-windows.bat

# 3. Every time you want to run the app
start-demo.bat
```

`start-demo.bat` opens two terminal windows (backend + frontend) and launches the browser automatically.

### macOS / Linux

```bash
git clone https://github.com/vikram91176-web/neend-platform.git
cd neend-platform
chmod +x setup-mac.sh start-demo.sh
./setup-mac.sh
./start-demo.sh
```

---

## 🔧 Manual Installation

You need **Python 3.9+** and **Node.js 18+**. Verify with:

```bash
python --version
node --version
```

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate       # Windows (PowerShell / CMD)
source venv/bin/activate    # macOS / Linux

# Install Python packages
pip install -r requirements.txt

# Copy the environment template
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

### 2. Frontend Setup

Open a **second terminal**:

```bash
cd frontend
npm install
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

---

## 🚀 Running the App

### Backend (Terminal 1)

```bash
cd backend
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
```

Verify: open http://localhost:5000/api/health → `{ "status": "ok" }`

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.4.8  ready in 420 ms
  ➜  Local: http://localhost:5173/
```

> ⚠️ **Both terminals must run simultaneously** — backend on port 5000, frontend on port 5173.

---

## 🗄️ Database Setup

Tables are created automatically on first startup. No manual migration needed.

To populate with demo data (20 services, 20 workers, 5 customers, 1 admin):

```bash
cd backend
python seed.py
```

> ⚠️ **Warning:** `seed.py` deletes everything and starts fresh.

**To fully reset:** delete `backend/instance/database.db`, then run `python seed.py` again.

---

## 👥 Demo Accounts

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| 🔴 Admin   | `admin@need.in`        | `admin123` |
| 🟢 Customer | `ananya@example.com`  | `demo123`  |
| 🔵 Worker  | `rahul@example.com`    | `demo123`  |

All 20 demo workers and 5 demo customers use `demo123`.

### Worker Verification States

| State       | Count | Who                                              |
|-------------|-------|--------------------------------------------------|
| ✅ Verified  | 17    | Appear in search, can be booked                  |
| ⏳ Pending   | 2     | Farhan Ali (Barber), Geeta Rani (Gardener)       |
| ❌ Rejected  | 1     | Mohit Saini (Car Washing)                        |

> **3 services cannot be booked on a fresh seed:** Barber, Gardener, Car Washing. Log in as admin → verify a worker → that service becomes bookable instantly.

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### 🔓 Public

| Method | Endpoint | Returns |
|--------|----------|---------|
| `GET` | `/api/health` | `{status: "ok"}` |
| `GET` | `/api/services` | All 20 services |
| `GET` | `/api/services/categories` | Services grouped by category |
| `GET` | `/api/stats` | Live platform counts |
| `GET` | `/api/workers` | Worker search (`?service=`, `?city=`, `?sort=`) |
| `GET` | `/api/services/<id>/workers` | Verified workers for a service |

### 🔐 Auth

| Method | Endpoint | Action |
|--------|----------|--------|
| `POST` | `/api/auth/register` | Create account + auto-login |
| `POST` | `/api/auth/login` | Validate password + start session |
| `GET` | `/api/auth/me` | Current user (401 if not logged in) |
| `POST` | `/api/auth/logout` | Clear session |

### 👤 Customer *(requires login)*

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/api/customer/dashboard` | Profile, stats, bookings, services |
| `POST` | `/api/bookings` | Create booking (auto-assigns if no worker chosen) |
| `POST` | `/api/bookings/<id>/cancel` | Cancel a pre-start booking |
| `POST` | `/api/payments/checkout` | Simulate payment + write invoice |

### 👷 Worker *(requires login)*

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/api/worker/dashboard` | Profile, wallet, stats, jobs |
| `POST` | `/api/worker/availability` | Toggle online / offline |
| `POST` | `/api/bookings/<id>/worker-action` | `accept` / `decline` / `start` / `complete` |

### 🏛️ Admin *(requires login)*

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/api/admin/dashboard` | Full platform overview |
| `POST` | `/api/admin/workers/<id>/verify` | Approve or reject worker |
| `POST` | `/api/admin/tickets/<id>/status` | Update support ticket |

### 🔒 Shared *(customer, assigned worker, or admin)*

| Method | Endpoint | Returns |
|--------|----------|---------|
| `GET` | `/api/bookings/<id>` | Full booking details |
| `GET` | `/api/bookings/<id>/payment` | Payment status + invoice ID |
| `GET` | `/api/payments/invoices/<invoice_id>` | Itemised receipt with welfare split |

> **Key design note:** Marking a job `complete` via `worker-action` is the accounting event — worker gets credited 90% and the 10% welfare contribution is recorded. Checkout only records what the customer paid.

---

## 🤖 AI Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Support Chatbot** | Keyword-rule matching, escalates to ticket on no-match | 🔜 Step 13 |
| **Demand Forecasting** | Reads past bookings, reports busiest services/slots | 🔜 Step 14 |

Both will live in `backend/ai.py` — this file does not exist yet.

---

## 📈 Build Progress

| Step | Feature | Status |
|------|---------|--------|
| 1 | Project setup, landing page, navigation | ✅ Done |
| 2 | Registration and login | ✅ Done |
| 3 | Customer dashboard | ✅ Done |
| 4 | Worker dashboard | ✅ Done |
| 5 | Admin dashboard | ✅ Done |
| 6 | Service catalogue and worker search | ✅ Done |
| 7 | Booking flow | ✅ Done |
| 8 | Simulated payment and invoice | ✅ Done |
| 9 | Ratings and tips | 🔶 Tips ✅, ratings pending |
| 10 | Welfare wallet | ✅ Done (save only, no withdrawal yet) |
| 11 | Worker verification | ✅ Done *(built early, out of order)* |
| 12 | Help and support | ⏳ Planned |
| 13 | AI chatbot | ⏳ Planned |
| 14 | AI demand forecasting | ⏳ Planned |
| 15 | Multilingual support | ⏳ Planned |
| 16 | Integration testing | ⏳ Planned |
| 17 | Final polish | ⏳ Planned |

---

## 🔍 Troubleshooting

| Problem | Fix |
|---------|-----|
| 🔴 Red banner "Cannot reach backend on port 5000" | Flask is not running: `cd backend && python app.py` |
| 📊 Home page numbers all show 0 | Database is empty: `cd backend && python seed.py` |
| ❌ "No verified partner for Barber/Gardener/Car Washing" | Intentional — log in as admin and verify the worker |
| 🔒 "Your account is not verified" | Logged in as Farhan, Geeta or Mohit — verify them in admin first |
| ⏳ Booking stuck at "Auto-assigning…" | Old booking; run `python seed.py` for a clean database |
| 🐍 `ModuleNotFoundError: No module named 'flask'` | venv not active — activate it, then `pip install -r requirements.txt` |
| 💻 `'python' is not recognized` | Try `python3`, or reinstall Python with "Add to PATH" checked |
| 🛡️ PowerShell: "running scripts is disabled" | Use CMD, or run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| 🚫 PowerShell: `&&` not valid | Use separate lines or `;` between commands |
| 🎵 Port 5000 in use (macOS AirPlay) | Change port in `app.py` to 5001; set `VITE_API_URL=http://localhost:5001/api` in `frontend/.env` |
| 🎨 Page loads but has no styling | `npm install` again, then `npm run dev` |
| ⬜ Blank white page | Open browser console (F12) — the first red error names the file and line |

---

## 🔭 Future Scope

Things a real deployment would need (honestly listed as *not built*):

- 💳 Real payment gateway (Razorpay or UPI)
- 📱 SMS and email notifications for booking updates
- 🐘 PostgreSQL instead of SQLite for concurrent users
- 📍 Real GPS distance calculation
- 📲 Native mobile app — most workers are phone-first
- 🪪 Document verification with OCR
- 🏥 Insurance integration for the welfare wallet
- 🗳️ Cooperative voting on commission rates
- 🤖 Trained recommendation model

---


---

## 🚀 Live Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [need-platform-five.vercel.app](https://need-platform-five.vercel.app) |
| Backend API | Render | [neend-backend.onrender.com](https://neend-backend.onrender.com) |

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide to deploy the backend on Render and the frontend on Vercel (both free tier).
## 🤝 Contributing

1. **Fork** the repo and create your branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add worker ratings endpoint"
   ```
3. **Push** and open a Pull Request.

### Commit Message Convention

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code restructure (no logic change) |
| `style:` | Formatting / whitespace |
| `test:` | Adding or fixing tests |

---

## 📄 License

This project is released under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ as a college project · No real money involved · Demo use only</p>



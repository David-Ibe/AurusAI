# AurusAI

Personal gold trading intelligence platform for XAU/USD.

## Quick Start

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Run `supabase/rls_policies.sql` in the SQL Editor (enables inserts/updates)
4. Copy project URL and anon key to `.env`

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp ../.env.example .env   # Edit with your keys
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### 4. API Keys

| Service | Purpose |
|---------|---------|
| Supabase | Database (trades, levels, calendar, news, reports) |
| FMP | Macro data (treasury, indicators) |
| Massive | Economic calendar (Polygon.io TMX Corporate Events) |
| Anthropic | Claude AI (calendar analysis, news impact, reports) |
| TwelveData | Gold price (XAU/USD) |
| NewsAPI | News fetch |

### 5. Scheduler (optional)

The scheduler runs automatically on backend start. Set `AURUS_DISABLE_SCHEDULER=true` in `.env` to disable (e.g. for dev).

| Job | Schedule |
|-----|----------|
| Price watcher | Every 60 sec |
| News sync | Every 5 min |
| Calendar sync | Daily 06:00 WAT |
| Daily brief | 06:30 WAT |
| Weekly report | Sunday 19:00 WAT |

## API Reference

### Macro
- **GET** `/api/macro` — Treasury rates + economic indicators

### Price
- **GET** `/api/price` — Current XAU/USD price

### Calendar
- **GET** `/api/calendar/events?from_date=&to_date=` — List events
- **POST** `/api/calendar/sync?use_ai=false` — Sync from Massive (TMX Corporate Events)

### News
- **GET** `/api/news?limit=20&min_impact=` — List news
- **POST** `/api/news/sync?use_ai=true` — Sync from NewsAPI

### Levels
- **GET** `/api/levels?active_only=true` — List key levels
- **POST** `/api/levels` — Add level `{price, type, label?, alert_threshold?}`
- **PATCH** `/api/levels/{id}` — Update level
- **DELETE** `/api/levels/{id}` — Deactivate level

### Trades
- **GET** `/api/trades?limit=50&outcome=` — List trades
- **POST** `/api/trades` — Add trade
- **PATCH** `/api/trades/{id}` — Update/close trade
- **GET** `/api/trades/insights` — Post-trade intelligence (Claude)

### Reports
- **GET** `/api/reports?limit=10` — List reports
- **POST** `/api/reports/daily` — Generate daily brief
- **POST** `/api/reports/weekly` — Generate weekly report

## Deployment

### Frontend (Vercel)

1. **Connect GitHub** — Go to [vercel.com](https://vercel.com) → Add New Project → Import `David-Ibe/AurusAI`
2. **Configure build**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment variable**
   - Add `VITE_API_URL` = your backend URL (e.g. `https://your-backend.onrender.com`) once the backend is deployed on Render
4. Deploy — Vercel will build and deploy on every push to `master`

### Backend (Render)

Deploy the FastAPI backend to [Render](https://render.com). Set all env vars from `.env.example`.

**Python version:** The repo includes `.python-version` (3.12.7) so Render avoids Python 3.14 (pydantic has no wheels yet). If the build still uses 3.14, add env var `PYTHON_VERSION=3.12.7` in the Render dashboard.

## Project Structure

```
aurusai/
├── backend/
│   └── app/
│       ├── routers/     # API endpoints
│       ├── services/    # Business logic, external APIs
│       ├── jobs/        # Price watcher
│       └── scheduler.py # APScheduler setup
├── frontend/
├── supabase/
└── .env.example
```

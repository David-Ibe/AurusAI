# AurusAI Troubleshooting

## "Nothing is working" — API fixes

Your backend logs show these external API issues. Here's how to fix them.

### 1. Economic Calendar (403 from Massive)
**Problem:** Polygon/Massive TMX Corporate Events returns 403 — your plan may not include this endpoint.

**Fix (primary):** Massive is the primary source. Ensure your Polygon/Massive plan includes TMX Corporate Events. Check at [polygon.io](https://polygon.io) or [massive.com](https://massive.com).

**Fix (fallback):** If Massive doesn't work, add **FMP Economic Calendar** (free tier):

1. Sign up at [financialmodelingprep.com](https://financialmodelingprep.com/register)
2. Get your free API key (250 calls/day)
3. Add to `backend/.env`:
   ```
   FMP_API_KEY=your-fmp-key-here
   ```
4. Restart the backend and click **Sync** on the Calendar page

The calendar tries Massive first, then FMP as fallback.

---

### 2. News (401 from NewsAPI)
**Problem:** NewsAPI returns 401 Unauthorized — invalid or restricted key.

**Fix:**
1. Go to [newsapi.org](https://newsapi.org/register) and get a new API key
2. **Free tier limits:** Only works from `localhost` — run frontend with `npm run dev` (Vite proxy forwards to backend)
3. Update `backend/.env`:
   ```
   NEWSAPI_API_KEY=your-new-key
   ```
4. Restart the backend and click **Sync** on the News page

---

### 3. Gold Price ("Unable to fetch price")
**Problem:** Both TwelveData and FMP fail — no XAU/USD price in the panel.

**Fix A — Add FMP as fallback (recommended):**  
1. Sign up at [financialmodelingprep.com](https://financialmodelingprep.com/register)  
2. Get your free API key (250 calls/day)  
3. Add to `backend/.env`:
   ```
   FMP_API_KEY=your-fmp-key-here
   ```
4. Restart the backend — price uses TwelveData first, then FMP (GCUSD gold) as fallback.

**Fix B — TwelveData only:**  
1. Check your plan at [twelvedata.com](https://twelvedata.com)  
2. XAU/USD is often limited on the free tier; paid plans (from ~$79/mo) include commodities.  
3. Verify in `backend/.env`:
   ```
   TWELVEDATA_API_KEY=your-key
   ```

**Fix C — API keys missing:**  
If you see "Add TWELVEDATA_API_KEY or FMP_API_KEY to backend/.env", add at least one of these keys. FMP free tier is usually enough for development.

**Fix D — FMP 429 Too Many Requests:**  
FMP free tier = 250 calls/day. Price is cached 5 minutes server-side; frontend polls every 60s. If you hit 429:
1. Wait for daily limit reset (midnight UTC)
2. Avoid refreshing the dashboard excessively
3. Consider upgrading FMP or using TwelveData paid plan for XAU/USD

---

### 4. Insights (needs trades)
**Requirement:** At least 5 **closed** trades (outcome ≠ "open") in the Journal.

**Fix:** Log trades in the Journal, close them with outcome (win/loss/breakeven), then click **Get Insights**.

---

## Quick checklist

| Feature    | Key needed              | Where to get it                    |
|-----------|--------------------------|------------------------------------|
| Calendar  | `MASSIVE_API_KEY` (primary) / `FMP_API_KEY` (fallback) | polygon.io / financialmodelingprep.com |
| News      | `NEWSAPI_API_KEY`       | newsapi.org (free, localhost only) |
| Price     | `TWELVEDATA_API_KEY`    | twelvedata.com                     |
| Insights  | `ANTHROPIC_API_KEY`     | anthropic.com (Claude)             |
| Macro     | `MASSIVE_API_KEY`       | polygon.io (treasury/inflation)    |

---

## Verify backend is running
```bash
cd backend
uvicorn app.main:app --reload
```
Backend should be on http://127.0.0.1:8000. Frontend Vite proxy forwards `/api` to it.

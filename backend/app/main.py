"""
AurusAI — Personal Gold Trading Intelligence Platform
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import alerts, calendar, levels, macro, news, price, reports, trades
from app.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AurusAI backend starting")
    if os.getenv("AURUS_DISABLE_SCHEDULER", "").lower() != "true":
        try:
            start_scheduler()
        except Exception as e:
            logger.warning("Scheduler failed to start", extra={"error": str(e)})
    yield
    stop_scheduler()
    logger.info("AurusAI backend shutting down")


app = FastAPI(
    title="AurusAI",
    description="Personal gold trading intelligence platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(macro.router, prefix="/api/macro", tags=["macro"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(levels.router, prefix="/api/levels", tags=["levels"])
app.include_router(price.router, prefix="/api/price", tags=["price"])
app.include_router(trades.router, prefix="/api/trades", tags=["trades"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])


@app.get("/")
async def root():
    return {"status": "ok", "app": "AurusAI"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}

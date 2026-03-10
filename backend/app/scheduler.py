"""
APScheduler setup - all scheduled jobs.
Timezone: Africa/Lagos (WAT)
"""

import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.config import settings

try:
    from zoneinfo import ZoneInfo
    TZ = ZoneInfo(settings.timezone)
except Exception:
    TZ = settings.timezone  # fallback to string
from app.jobs.price_watcher import run_price_watcher
from app.services.report_service import run_daily_brief_sync, run_weekly_report_sync

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def _run_news_sync() -> None:
    """Sync news every 5 min."""
    try:
        from app.services.news_service import sync_news

        import asyncio

        asyncio.run(sync_news(use_ai=False, limit=10))
    except Exception as e:
        logger.error("News sync job failed", extra={"error": str(e)})


def _run_calendar_sync() -> None:
    """Sync calendar daily."""
    try:
        from app.services.calendar_service import sync_calendar

        import asyncio
        from datetime import datetime, timedelta

        from_date = datetime.utcnow().strftime("%Y-%m-%d")
        to_date = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
        asyncio.run(sync_calendar(from_date, to_date, use_ai=False))
    except Exception as e:
        logger.error("Calendar sync job failed", extra={"error": str(e)})


def start_scheduler() -> None:
    """Start APScheduler with all jobs."""
    global _scheduler
    if _scheduler is not None:
        return

    _scheduler = BackgroundScheduler(timezone=TZ)

    # Price watcher: every 60 seconds
    _scheduler.add_job(run_price_watcher, IntervalTrigger(seconds=60), id="price_watcher")

    # News: every 5 minutes
    _scheduler.add_job(_run_news_sync, IntervalTrigger(minutes=5), id="news_sync")

    # Calendar: daily at 06:00
    _scheduler.add_job(_run_calendar_sync, CronTrigger(hour=6, minute=0, timezone=TZ), id="calendar_sync")

    # Daily brief: 06:30 WAT
    _scheduler.add_job(
        run_daily_brief_sync,
        CronTrigger(hour=6, minute=30, timezone=TZ),
        id="daily_brief",
    )

    # Weekly report: Sunday 19:00 WAT
    _scheduler.add_job(
        run_weekly_report_sync,
        CronTrigger(day_of_week="sun", hour=19, minute=0, timezone=TZ),
        id="weekly_report",
    )

    _scheduler.start()
    logger.info("Scheduler started", extra={"timezone": settings.timezone})


def stop_scheduler() -> None:
    """Stop scheduler on shutdown."""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("Scheduler stopped")

"""
Report generation: weekly reports and daily morning briefs.
"""

import logging
from datetime import datetime, timedelta
from typing import Any

from app.db.supabase_client import get_supabase
from app.services.claude_ai import generate_daily_brief, generate_weekly_report
from app.services.massive_client import fetch_inflation_expectations, fetch_treasury_yields
from app.services.news_client import fetch_news
from app.services.twelvedata_client import fetch_gold_price

logger = logging.getLogger(__name__)


async def _build_report_context() -> dict[str, Any]:
    """Gather data for report generation (uses Massive/Polygon for macro)."""
    price = await fetch_gold_price()
    treasury = await fetch_treasury_yields()
    inflation = await fetch_inflation_expectations()
    news = await fetch_news(limit=5)

    return {
        "gold_price": price,
        "treasury_rates": treasury[0] if treasury else {},
        "inflation_expectations": inflation[0] if inflation else {},
        "cpi_latest": inflation[0] if inflation else {},
        "recent_news": [{"title": n.get("title"), "source": n.get("source", {}).get("name")} for n in news[:5]],
        "date": datetime.utcnow().isoformat(),
    }


async def run_daily_brief() -> dict[str, Any]:
    """Generate and store daily morning brief."""
    context = await _build_report_context()
    content = generate_daily_brief(context)

    supabase = get_supabase()
    supabase.table("reports").insert(
        {"content": content, "delivered_at": datetime.utcnow().isoformat()}
    ).execute()

    logger.info("Daily brief generated and stored")
    return content


def run_daily_brief_sync() -> None:
    """Sync wrapper for scheduler."""
    import asyncio

    asyncio.run(run_daily_brief())


async def run_weekly_report() -> dict[str, Any]:
    """Generate and store weekly intelligence report."""
    context = await _build_report_context()
    week_start = (datetime.utcnow() - timedelta(days=datetime.utcnow().weekday())).strftime("%Y-%m-%d")
    context["week_start"] = week_start
    content = generate_weekly_report(context)

    supabase = get_supabase()
    supabase.table("reports").insert(
        {"week_start": week_start, "content": content, "delivered_at": datetime.utcnow().isoformat()}
    ).execute()

    logger.info("Weekly report generated and stored")
    return content


def run_weekly_report_sync() -> None:
    """Sync wrapper for scheduler."""
    import asyncio

    asyncio.run(run_weekly_report())


async def get_reports(limit: int = 10) -> list[dict[str, Any]]:
    """Get stored reports."""
    supabase = get_supabase()
    result = supabase.table("reports").select("*").order("delivered_at", desc=True).limit(limit).execute()
    return result.data or []

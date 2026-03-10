"""
Economic calendar service.
Primary: Massive (TMX). Fallback: FMP. Demo: built-in gold-relevant events when APIs fail.
"""

import logging
from datetime import datetime, timedelta
from typing import Any

from app.config import settings
from app.db.supabase_client import get_supabase
from app.services.claude_ai import analyze_calendar_event
from app.services.fmp_client import fetch_economic_calendar as fetch_fmp_calendar
from app.services.massive_client import fetch_economic_calendar as fetch_massive_calendar

logger = logging.getLogger(__name__)

# Demo events (gold-relevant) when external APIs fail
def _get_demo_events(from_date: str, to_date: str) -> list[dict[str, Any]]:
    """Key economic events for gold traders — CPI, NFP, FOMC, etc."""
    events = [
        ("US CPI m/m", "HIGH", "Inflation gauge; gold reactive"),
        ("US Core CPI m/m", "HIGH", "Ex food/energy"),
        ("US Non-Farm Payrolls", "HIGH", "Employment; high volatility"),
        ("US Unemployment Rate", "HIGH", "Jobs report component"),
        ("FOMC Interest Rate Decision", "HIGH", "Fed policy; major mover"),
        ("FOMC Minutes", "MEDIUM", "Fed tone"),
        ("US Retail Sales m/m", "MEDIUM", "Consumer spending"),
        ("US Preliminary GDP q/q", "MEDIUM", "Growth estimate"),
        ("US PMI Manufacturing", "MEDIUM", "Sector activity"),
        ("US PPI m/m", "MEDIUM", "Producer inflation"),
    ]
    from_dt = datetime.strptime(from_date, "%Y-%m-%d")
    to_dt = datetime.strptime(to_date, "%Y-%m-%d")
    days = max(1, (to_dt - from_dt).days + 1)
    result = []
    for i, (name, impact, note) in enumerate(events[: min(10, days * 2)]):
        d = from_dt + timedelta(days=i % days)
        result.append({
            "event_name": name,
            "event_time": d.strftime("%Y-%m-%d") + "T13:30:00Z",
            "impact_rating": impact,
            "explanation": note,
            "historical_pattern": "",
            "watch_for": "",
        })
    return result


def _parse_fmp_event(raw: dict[str, Any]) -> dict[str, Any] | None:
    """Map FMP economic calendar to calendar_cache schema."""
    # FMP: date, country, event, actual, estimate, previous, change, changePercentage
    event_date = raw.get("date") or raw.get("releaseDate") or raw.get("eventDate")
    if not event_date:
        return None
    if isinstance(event_date, str) and "T" not in event_date and len(event_date) <= 10:
        event_date = f"{event_date}T12:00:00Z"
    event_name = (
        raw.get("event")
        or raw.get("title")
        or raw.get("name")
        or raw.get("indicator")
        or "Economic release"
    )
    country = raw.get("country") or raw.get("currency") or ""
    if country:
        event_name = f"{country} {event_name}"
    # Impact: HIGH for major (CPI, NFP, FOMC, etc), MED for others
    low = (event_name or "").lower()
    if any(x in low for x in ["cpi", "nfp", "employment", "fomc", "fed", "interest rate", "gdp"]):
        impact_rating = "HIGH"
    elif any(x in low for x in ["pmi", "retail", "housing", "consumer"]):
        impact_rating = "MEDIUM"
    else:
        impact_rating = "LOW"
    return {
        "event_name": str(event_name).strip() or "Unknown",
        "event_time": str(event_date),
        "impact_rating": impact_rating,
        "explanation": raw.get("description", "")[:200] if raw.get("description") else "",
        "historical_pattern": "",
        "watch_for": "",
    }


def _parse_massive_event(raw: dict[str, Any]) -> dict[str, Any]:
    """Map Massive TMX corporate event to calendar_cache schema."""
    # Massive TMX: date (YYYY-MM-DD), name, type, company_name, ticker
    event_date = raw.get("date") or raw.get("event_time") or raw.get("releaseDate")
    if isinstance(event_date, str) and "T" not in event_date:
        event_date = f"{event_date}T12:00:00Z"
    event_type = raw.get("type") or ""
    company = raw.get("company_name") or raw.get("ticker") or ""
    name = raw.get("name") or ""
    event_name = f"{company} - {name}" if company and name else name or company or "Unknown"
    # Map event type to impact: earnings_* = HIGH, dividend = MEDIUM, else LOW
    if "earnings" in event_type.lower():
        impact_rating = "HIGH"
    elif "dividend" in event_type.lower() or "shareholder" in event_type.lower():
        impact_rating = "MEDIUM"
    else:
        impact_rating = "LOW"
    return {
        "event_name": event_name.strip(" -") or "Unknown",
        "event_time": event_date,
        "impact_rating": impact_rating,
        "explanation": f"{event_type.replace('_', ' ').title()}" if event_type else "",
        "historical_pattern": "",
        "watch_for": "",
    }


async def sync_calendar(from_date: str | None = None, to_date: str | None = None, use_ai: bool = False) -> int:
    """
    Fetch events: try FMP first (if key set), else Massive. Upsert into calendar_cache.
    """
    if not from_date:
        from_date = datetime.utcnow().strftime("%Y-%m-%d")
    if not to_date:
        to_date = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")

    raw_events: list[dict[str, Any]] = []
    use_fmp = False
    if settings.massive_api_key:
        raw_events = await fetch_massive_calendar(from_date, to_date)
        if raw_events:
            logger.info("Using Massive TMX calendar (primary)", extra={"count": len(raw_events)})
    if not raw_events and settings.fmp_api_key:
        raw_events = await fetch_fmp_calendar(from_date, to_date)
        if raw_events:
            use_fmp = True
            logger.info("Using FMP economic calendar (fallback)", extra={"count": len(raw_events)})

    if not raw_events:
        logger.warning("No events from Massive or FMP. Using demo calendar.")
        # Use demo events so calendar is never empty
        demo_rows = _get_demo_events(from_date, to_date)
        if demo_rows:
            supabase = get_supabase()
            from_ts = f"{from_date}T00:00:00"
            to_ts = f"{to_date}T23:59:59"
            supabase.table("calendar_cache").delete().gte("event_time", from_ts).lte("event_time", to_ts).execute()
            supabase.table("calendar_cache").insert(demo_rows).execute()
            return len(demo_rows)
        return 0

    supabase = get_supabase()
    from_ts = f"{from_date}T00:00:00"
    to_ts = f"{to_date}T23:59:59"
    supabase.table("calendar_cache").delete().gte("event_time", from_ts).lte("event_time", to_ts).execute()
    count = 0
    for raw in raw_events:
        try:
            if use_fmp:
                row = _parse_fmp_event(raw)
                if not row:
                    continue
            else:
                row = _parse_massive_event(raw)
            event_name = row["event_name"]
            country = raw.get("company_name") or raw.get("ticker") or raw.get("country") or raw.get("currency") or ""

            if use_ai and event_name and event_name != "Unknown":
                try:
                    analysis = analyze_calendar_event(
                        event_name=event_name,
                        event_country=country,
                        impact=row["impact_rating"],
                    )
                    row["impact_rating"] = analysis.get("impact_rating", row["impact_rating"])
                    row["explanation"] = analysis.get("explanation", row["explanation"])
                    row["historical_pattern"] = analysis.get("historical_pattern", "")
                    row["watch_for"] = analysis.get("watch_for", "")
                except Exception as e:
                    logger.warning("Claude analysis skipped", extra={"event": event_name, "error": str(e)})

            # Insert (schema has no unique constraint; sync replaces by delete+insert below)
            supabase.table("calendar_cache").insert(row).execute()
            count += 1
        except Exception as e:
            logger.warning("Failed to upsert event", extra={"raw": raw, "error": str(e)})
            continue

    logger.info("Calendar sync complete", extra={"count": count})
    return count


async def get_calendar_events(from_date: str | None = None, to_date: str | None = None) -> list[dict[str, Any]]:
    """Get events from calendar_cache for date range."""
    if not from_date:
        from_date = datetime.utcnow().strftime("%Y-%m-%d")
    if not to_date:
        to_date = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")

    from_ts = f"{from_date}T00:00:00"
    to_ts = f"{to_date}T23:59:59"

    supabase = get_supabase()
    result = (
        supabase.table("calendar_cache")
        .select("*")
        .gte("event_time", from_ts)
        .lte("event_time", to_ts)
        .order("event_time")
        .execute()
    )

    return result.data or []

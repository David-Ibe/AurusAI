"""
Economic calendar API.
"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Query

from app.services.calendar_service import get_calendar_events, sync_calendar

router = APIRouter()


@router.get("/events")
async def list_events(
    from_date: str | None = Query(None, description="YYYY-MM-DD"),
    to_date: str | None = Query(None, description="YYYY-MM-DD"),
):
    """Get economic calendar events for date range."""
    if not from_date:
        from_date = datetime.utcnow().strftime("%Y-%m-%d")
    if not to_date:
        to_date = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
    events = await get_calendar_events(from_date, to_date)
    return {"events": events}


@router.post("/sync")
async def sync(
    from_date: str | None = Query(None),
    to_date: str | None = Query(None),
    use_ai: bool = Query(False, description="Enrich with Claude analysis"),
):
    """Sync calendar from Massive into database."""
    count = await sync_calendar(from_date, to_date, use_ai=use_ai)
    return {"synced": count}

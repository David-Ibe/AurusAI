"""Alerts API - level, news, calendar alerts."""

from fastapi import APIRouter, Query

from app.db.supabase_client import get_supabase

router = APIRouter()


@router.get("")
@router.get("/")
def list_alerts(limit: int = Query(20, le=100)):
    """List recent alerts."""
    supabase = get_supabase()
    result = (
        supabase.table("alerts")
        .select("*")
        .order("fired_at", desc=True)
        .limit(limit)
        .execute()
    )
    return {"alerts": result.data or []}

"""Reports API - daily briefs and weekly reports."""

from fastapi import APIRouter, Query

from app.services.report_service import get_reports, run_daily_brief, run_weekly_report

router = APIRouter()


@router.get("")
@router.get("/")
async def list_reports(limit: int = Query(10, le=50)):
    """List stored reports."""
    reports = await get_reports(limit=limit)
    return {"reports": reports}


@router.post("/daily")
async def trigger_daily():
    """Manually trigger daily brief generation."""
    content = await run_daily_brief()
    return content


@router.post("/weekly")
async def trigger_weekly():
    """Manually trigger weekly report generation."""
    content = await run_weekly_report()
    return content

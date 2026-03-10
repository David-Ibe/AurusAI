"""News API router."""

from fastapi import APIRouter, Query

from app.services.news_service import get_news, sync_news

router = APIRouter()


@router.get("")
@router.get("/")
async def list_news(
    limit: int = Query(20, le=100),
    min_impact: int | None = Query(None, ge=1, le=10),
):
    """Get news from cache."""
    items = await get_news(limit=limit, min_impact=min_impact)
    return {"news": items}


@router.post("/sync")
async def sync(use_ai: bool = Query(True), limit: int = Query(20)):
    """Sync news from NewsAPI."""
    count = await sync_news(use_ai=use_ai, limit=limit)
    return {"synced": count}

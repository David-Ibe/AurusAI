"""
News impact analyzer: fetch NewsAPI, Claude analysis, store in news_cache.
"""

import logging
from datetime import datetime
from typing import Any

from app.db.supabase_client import get_supabase
from app.services.claude_ai import analyze_news_impact
from app.services.news_client import fetch_news

logger = logging.getLogger(__name__)


def _normalize_headline(headline: str) -> str:
    return (headline or "").strip() or "No headline"


async def sync_news(use_ai: bool = True, limit: int = 20) -> int:
    """
    Fetch news from NewsAPI, run Claude impact analysis, store in news_cache.
    Skip if already processed. Alert if impact_score >= 7.
    Returns count of new items stored.
    """
    articles = await fetch_news(limit=limit)
    if not articles:
        return 0

    supabase = get_supabase()
    count = 0

    for art in articles:
        headline = _normalize_headline(art.get("title"))
        if not headline or headline == "No headline":
            continue

        url = art.get("url") or ""
        source = (art.get("source") or {}).get("name", "") if isinstance(art.get("source"), dict) else ""
        published = art.get("publishedAt") or datetime.utcnow().isoformat()

        # Check if already in cache (by headline + url)
        existing = supabase.table("news_cache").select("id").eq("headline", headline).limit(1).execute()
        if existing.data and len(existing.data) > 0:
            continue

        impact_score = 5
        impact_assessment = ""

        if use_ai:
            try:
                analysis = analyze_news_impact(
                    headline=headline,
                    description=art.get("description") or "",
                    source=source,
                )
                impact_score = int(analysis.get("impact_score", 5))
                impact_assessment = analysis.get("impact_assessment", "")
            except Exception as e:
                logger.warning("News analysis skipped", extra={"headline": headline[:50], "error": str(e)})

        try:
            supabase.table("news_cache").insert(
                {
                    "headline": headline,
                    "source": source,
                    "url": url,
                    "published_at": published,
                    "impact_score": impact_score,
                    "impact_assessment": impact_assessment,
                    "processed": True,
                    "alert_sent": False,
                }
            ).execute()
            count += 1

            if impact_score >= 7:
                msg = f"[{impact_score}/10] {headline}"
                supabase.table("alerts").insert(
                    {"type": "news", "message": msg, "channel": "both", "metadata": {"impact_score": impact_score}}
                ).execute()
                logger.info("High-impact news alert", extra={"headline": headline[:50], "score": impact_score})
        except Exception as e:
            logger.warning("Failed to insert news", extra={"headline": headline[:50], "error": str(e)})

    logger.info("News sync complete", extra={"count": count})
    return count


async def get_news(limit: int = 20, min_impact: int | None = None) -> list[dict[str, Any]]:
    """Get news from cache, optionally filtered by impact."""
    supabase = get_supabase()
    q = supabase.table("news_cache").select("*").order("published_at", desc=True).limit(limit)
    if min_impact is not None:
        q = q.gte("impact_score", min_impact)
    result = q.execute()
    return result.data or []

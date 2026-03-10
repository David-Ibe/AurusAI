"""
NewsAPI client for gold/macro-relevant news.
"""

import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

KEYWORDS = [
    "gold",
    "XAU",
    "Federal Reserve",
    "inflation",
    "interest rates",
    "US dollar",
    "DXY",
    "Treasury yields",
    "geopolitical",
    "safe haven",
]


async def fetch_news(limit: int = 20) -> list[dict[str, Any]]:
    """Fetch news from NewsAPI for gold trading relevance."""
    if not settings.newsapi_api_key:
        logger.warning("NewsAPI key not set")
        return []

    url = "https://newsapi.org/v2/everything"
    params = {
        "q": " OR ".join(KEYWORDS),
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": min(limit, 100),
    }
    headers = {"X-Api-Key": settings.newsapi_api_key}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            articles = data.get("articles") or []
            logger.info("NewsAPI fetched", extra={"count": len(articles)})
            return articles
    except httpx.HTTPError as e:
        logger.error("NewsAPI failure", extra={"error": str(e)})
        return []
    except Exception as e:
        logger.error("NewsAPI fetch error", extra={"error": str(e)})
        return []

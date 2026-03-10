"""
Massive (Polygon.io) API client for economic calendar and macro data.
Uses TMX Corporate Events (calendar), Treasury Yields, and Inflation Expectations.
Auth: apiKey query param. Base: api.polygon.io
"""

import logging
from datetime import datetime
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Polygon.io and Massive share the same API; polygon.io is the primary base
POLYGON_BASE = "https://api.polygon.io"
MASSIVE_BASE = "https://api.massive.com"  # TMX calendar; same key works on both


async def fetch_economic_calendar(from_date: str, to_date: str) -> list[dict[str, Any]]:
    """
    Fetch calendar events from Massive TMX Corporate Events.
    Tries api.polygon.io first, then api.massive.com.
    """
    if not settings.massive_api_key:
        logger.warning("Massive API key not set")
        return []

    params = {
        "apiKey": settings.massive_api_key,
        "date.gte": from_date,
        "date.lte": to_date,
        "limit": 500,
        "sort": "date.asc",
    }
    bases = [POLYGON_BASE, MASSIVE_BASE]
    all_results: list[dict[str, Any]] = []

    for base in bases:
        url = f"{base}/tmx/v1/corporate-events"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                request_url = url
                request_params = params
                while request_url:
                    resp = await client.get(request_url, params=request_params)
                    resp.raise_for_status()
                    data = resp.json()
                    results = data.get("results") or []
                    all_results.extend(results)

                    next_url = data.get("next_url")
                    if next_url and results:
                        request_url = next_url if next_url.startswith("http") else f"{base}{next_url}"
                        request_params = {}
                    else:
                        break

            if all_results:
                logger.info("Massive calendar fetched", extra={"count": len(all_results), "base": base})
                return all_results
        except httpx.HTTPError as e:
            logger.warning("Massive calendar from %s failed: %s, trying next base", base, str(e))
            all_results = []
        except Exception as e:
            logger.warning("Massive calendar from %s error: %s", base, str(e))
            all_results = []

    return []


async def fetch_treasury_yields() -> list[dict[str, Any]]:
    """Fetch latest US Treasury yields from Polygon/Massive Fed endpoint."""
    if not settings.massive_api_key:
        logger.warning("Massive API key not set")
        return []

    url = f"{POLYGON_BASE}/fed/v1/treasury-yields"
    today = datetime.utcnow().strftime("%Y-%m-%d")
    params = {
        "apiKey": settings.massive_api_key,
        "date.lte": today,
        "limit": 1,
        "sort": "date.desc",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            results = data.get("results") or []
            logger.info("Massive treasury yields fetched", extra={"count": len(results)})
            return results
    except httpx.HTTPError as e:
        logger.error("Massive treasury API failure", extra={"error": str(e)})
        return []
    except Exception as e:
        logger.error("Massive treasury fetch error", extra={"error": str(e)})
        return []


async def fetch_inflation_expectations() -> list[dict[str, Any]]:
    """Fetch inflation expectations from Polygon/Massive Fed endpoint."""
    if not settings.massive_api_key:
        return []

    url = f"{POLYGON_BASE}/fed/v1/inflation-expectations"
    today = datetime.utcnow().strftime("%Y-%m-%d")
    params = {
        "apiKey": settings.massive_api_key,
        "date.lte": today,
        "limit": 1,
        "sort": "date.desc",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            results = data.get("results") or []
            logger.info("Massive inflation expectations fetched", extra={"count": len(results)})
            return results
    except httpx.HTTPError as e:
        logger.error("Massive inflation API failure", extra={"error": str(e)})
        return []
    except Exception as e:
        logger.error("Massive inflation fetch error", extra={"error": str(e)})
        return []

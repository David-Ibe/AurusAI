"""
Financial Modeling Prep API client.
Uses endpoints available on the free Basic plan: Treasury Rates, Economic Indicators.
"""

import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

FMP_BASE = "https://financialmodelingprep.com/stable"


async def fetch_treasury_rates() -> list[dict[str, Any]]:
    """Fetch latest US Treasury rates (2Y, 10Y, etc.). Free tier."""
    url = f"{FMP_BASE}/treasury-rates"
    params = {"apikey": settings.fmp_api_key}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            result = data if isinstance(data, list) else []
            logger.info("FMP treasury rates fetched", extra={"count": len(result)})
            return result
    except httpx.HTTPError as e:
        logger.error("FMP treasury API failure", extra={"error": str(e)})
        return []
    except Exception as e:
        logger.error("FMP treasury fetch error", extra={"error": str(e)})
        return []


async def fetch_economic_calendar(from_date: str, to_date: str) -> list[dict[str, Any]]:
    """Fetch economic calendar events. Free tier."""
    if not settings.fmp_api_key:
        return []
    url = f"{FMP_BASE}/economic-calendar"
    params = {"apikey": settings.fmp_api_key, "from": from_date, "to": to_date}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            result = data if isinstance(data, list) else []
            logger.info("FMP economic calendar fetched", extra={"count": len(result)})
            return result
    except httpx.HTTPError as e:
        logger.error("FMP calendar API failure", extra={"error": str(e)})
        return []
    except Exception as e:
        logger.error("FMP calendar fetch error", extra={"error": str(e)})
        return []


async def fetch_gold_price() -> float | None:
    """Fetch current gold (XAU/USD) price via FMP commodities. Fallback for TwelveData."""
    if not settings.fmp_api_key:
        return None
    url = f"{FMP_BASE}/quote"
    params = {"apikey": settings.fmp_api_key, "symbol": "GCUSD"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            if data and isinstance(data, list) and len(data) > 0:
                price = data[0].get("price")
                if price is not None:
                    return float(price)
        return None
    except Exception as e:
        logger.debug("FMP gold price fetch failed", extra={"error": str(e)})
        return None


async def fetch_economic_indicator(name: str) -> list[dict[str, Any]]:
    """Fetch economic indicator by name (GDP, CPI, etc.). Free tier."""
    url = f"{FMP_BASE}/economic-indicators"
    params = {"apikey": settings.fmp_api_key, "name": name}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            result = data if isinstance(data, list) else []
            logger.info("FMP economic indicator fetched", extra={"indicator": name, "count": len(result)})
            return result
    except httpx.HTTPError as e:
        logger.error("FMP indicator API failure", extra={"indicator": name, "error": str(e)})
        return []
    except Exception as e:
        logger.error("FMP indicator fetch error", extra={"indicator": name, "error": str(e)})
        return []

"""
TwelveData API client for gold (XAU/USD) price.
"""

import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

TWELVEDATA_BASE = "https://api.twelvedata.com"


async def fetch_gold_price() -> float | None:
    """Fetch current XAU/USD price. Returns latest close or None on failure."""
    if not settings.twelvedata_api_key:
        logger.warning("TwelveData API key not set")
        return None

    url = f"{TWELVEDATA_BASE}/time_series"
    params = {
        "symbol": "XAU/USD",
        "interval": "1min",
        "apikey": settings.twelvedata_api_key,
        "outputsize": 1,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            values = data.get("values") or []
            if values:
                close = values[0].get("close")
                if close is not None:
                    return float(close)
            logger.warning("TwelveData: no price in response")
            return None
    except httpx.HTTPError as e:
        logger.error("TwelveData API failure", extra={"error": str(e)})
        return None
    except Exception as e:
        logger.error("TwelveData fetch error", extra={"error": str(e)})
        return None

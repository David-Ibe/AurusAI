"""Live gold price API."""

import time

from fastapi import APIRouter

from app.config import settings
from app.services.fmp_client import fetch_gold_price as fetch_gold_price_fmp
from app.services.twelvedata_client import fetch_gold_price as fetch_gold_price_twelvedata

router = APIRouter()

# In-memory cache: (price, expiry_timestamp). Reduces API calls for FMP free tier (250/day).
_PRICE_CACHE_TTL = 300  # 5 minutes — ~288 price calls/day max
_price_cache: tuple[float | None, float] = (None, 0.0)


def _build_price_error() -> str:
    """Build actionable error message when both providers fail."""
    has_td = bool(settings.twelvedata_api_key)
    has_fmp = bool(settings.fmp_api_key)
    if not has_td and not has_fmp:
        return "Add TWELVEDATA_API_KEY or FMP_API_KEY to backend/.env"
    return (
        "Both providers failed — FMP may be rate-limited (429). Free tier: 250 calls/day. "
        "Price is cached 5min; wait and refresh, or upgrade plan."
    )


@router.get("")
@router.get("/")
async def get_price():
    """Get current XAU/USD price. Cached 5min. Tries TwelveData first, FMP as fallback."""
    global _price_cache
    now = time.monotonic()
    cached_price, expiry = _price_cache
    if cached_price is not None and now < expiry:
        return {"price": round(cached_price, 2), "symbol": "XAU/USD"}

    # FMP first — TwelveData free tier often returns 200 with no XAU/USD price
    price = await fetch_gold_price_fmp()
    if price is None:
        price = await fetch_gold_price_twelvedata()
    if price is None:
        return {"price": None, "error": _build_price_error()}

    _price_cache = (price, now + _PRICE_CACHE_TTL)
    return {"price": round(price, 2), "symbol": "XAU/USD"}

"""
Macro data service: Treasury yields and Inflation expectations.
Uses Massive/Polygon.io Fed endpoints (same API key as calendar).
"""

import logging
from typing import Any

from app.services.massive_client import (
    fetch_inflation_expectations,
    fetch_treasury_yields,
)

logger = logging.getLogger(__name__)


def _normalize_treasury(raw: dict[str, Any]) -> dict[str, Any]:
    """Map Polygon treasury fields to a structure the frontend expects."""
    return {
        "date": raw.get("date"),
        "rate": raw.get("yield_10_year"),
        "yield_10_year": raw.get("yield_10_year"),
        "yield_2_year": raw.get("yield_2_year"),
        "yield_1_year": raw.get("yield_1_year"),
        "yield_1_month": raw.get("yield_1_month"),
    }


def _normalize_inflation(raw: dict[str, Any]) -> dict[str, Any]:
    """Map Polygon inflation fields to a structure the frontend expects."""
    return {
        "date": raw.get("date"),
        "market_10_year": raw.get("market_10_year"),
        "market_5_year": raw.get("market_5_year"),
        "model_5_year": raw.get("model_5_year"),
    }


async def get_macro_data() -> dict[str, Any]:
    """
    Fetch macro data for gold trading context using Massive/Polygon.
    Treasury yields + inflation expectations (replaces FMP).
    """
    treasury = await fetch_treasury_yields()
    inflation = await fetch_inflation_expectations()

    latest_treasury = _normalize_treasury(treasury[0]) if treasury else {}
    latest_inflation = _normalize_inflation(inflation[0]) if inflation else {}

    return {
        "treasury_rates": latest_treasury,
        "inflation_expectations": latest_inflation,
        "indicators": {
            "gdp": {},
            "cpi": latest_inflation,
            "unemployment": {},
        },
    }

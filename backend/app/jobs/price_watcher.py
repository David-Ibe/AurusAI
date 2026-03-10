"""
Price watcher job: check gold price vs key levels every 60 seconds.
Fires level alerts when distance <= alert_threshold.
"""

import logging

from app.db.supabase_client import get_supabase
from app.services.twelvedata_client import fetch_gold_price

logger = logging.getLogger(__name__)


def run_price_watcher() -> None:
    """Check price vs levels, fire alerts if within threshold."""
    price = None
    try:
        import asyncio

        price = asyncio.run(fetch_gold_price())
    except Exception as e:
        logger.error("Price watcher: fetch failed", extra={"error": str(e)})
        return

    if price is None:
        return

    supabase = get_supabase()
    levels = supabase.table("levels").select("*").eq("active", True).execute()
    if not levels.data:
        return

    for level in levels.data:
        level_price = float(level.get("price", 0))
        threshold = float(level.get("alert_threshold", 2))
        dist = abs(price - level_price)
        if dist <= threshold:
            msg = f"XAU/USD ${price:.2f} approaching {level.get('type', 'level')} ${level_price:.2f}"
            try:
                supabase.table("alerts").insert(
                    {
                        "type": "level",
                        "message": msg,
                        "channel": "both",
                        "metadata": {"price": price, "level_id": level.get("id")},
                    }
                ).execute()
                logger.info("Level alert fired", extra={"level": level.get("label"), "price": price})
            except Exception as e:
                logger.warning("Failed to insert alert", extra={"error": str(e)})

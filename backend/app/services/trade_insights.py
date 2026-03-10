"""
Post-trade intelligence: analyze trade history for performance patterns.
"""

import json
import logging
from typing import Any

from app.db.supabase_client import get_supabase
from app.prompts.trade_insights import trade_insights_prompt
from app.services.claude_ai import get_client

logger = logging.getLogger(__name__)
MODEL = "claude-sonnet-4-20250514"


async def get_trade_insights() -> dict[str, Any]:
    """
    Analyze closed trades to discover performance patterns.
    Cached; regenerates when new trades added.
    """
    supabase = get_supabase()
    result = supabase.table("trades").select("*").neq("outcome", "open").execute()
    trades = result.data or []

    if len(trades) < 5:
        return {
            "insights": "Add more closed trades (at least 5) to generate performance insights.",
            "trade_count": len(trades),
        }

    # Build summary for Claude
    summary = []
    for t in trades[:50]:
        summary.append(
            {
                "outcome": t.get("outcome"),
                "session": t.get("session"),
                "news_day": t.get("news_day"),
                "direction": t.get("direction"),
                "setup": t.get("setup_description", "")[:50],
            }
        )

    client = get_client()
    prompt = trade_insights_prompt(summary=summary)

    try:
        logger.info("Claude AI call: trade_insights")
        response = client.messages.create(
            model=MODEL,
            max_tokens=800,
            temperature=0.2,
            top_p=0.9,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        result = json.loads(text)
        result["trade_count"] = len(trades)
        return result
    except Exception as e:
        logger.error("Trade insights failed", extra={"error": str(e)})
        return {
            "insights": "Unable to generate insights.",
            "error": str(e),
            "trade_count": len(trades),
        }

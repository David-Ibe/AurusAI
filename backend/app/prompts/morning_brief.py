import json
from typing import Any


def morning_brief_prompt(context: dict[str, Any]) -> str:
    return f"""Generate a pre-market morning brief for an XAU/USD trader.

Context:
{json.dumps(context, indent=2)}

Respond ONLY with valid JSON. No markdown. No backticks.
Format:
{{
  "gold_price": "Current price and 24h change",
  "macro_context": "DXY, yields, dollar tone",
  "bias": "Neutral/Bullish/Bearish and why",
  "key_levels": {{"resistance": number, "support": number}},
  "events_today": ["Event - Time - Impact"],
  "note": "1-2 sentences of actionable advice"
}}"""

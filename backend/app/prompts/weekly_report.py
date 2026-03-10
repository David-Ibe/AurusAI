import json
from typing import Any


def weekly_report_prompt(context: dict[str, Any]) -> str:
    return f"""Generate a weekly gold (XAU/USD) trading intelligence report.

Context:
{json.dumps(context, indent=2)}

Include these sections in valid JSON format (no markdown, no backticks):
{{
  "week_summary": "2-3 sentences on the week",
  "major_drivers": ["Driver 1", "Driver 2"],
  "technical_picture": "Brief technical outlook",
  "important_news": ["News item 1"],
  "upcoming_catalysts": ["Catalyst 1"],
  "key_levels": {{"resistance": number, "support": number}},
  "trade_setup_ideas": ["Idea 1", "Idea 2"]
}}"""

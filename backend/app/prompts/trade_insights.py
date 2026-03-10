import json
from typing import Any


def trade_insights_prompt(summary: list[dict[str, Any]]) -> str:
    return f"""Analyze this XAU/USD trader's performance. Provide actionable insights.

Trades summary (last 50):
{json.dumps(summary, indent=2)}

Respond ONLY with valid JSON. No markdown. No backticks.
Format:
{{
  "best_setup": "Description of when trader performs best",
  "weak_setup": "Description of when trader loses most",
  "session_performance": "Best/worst sessions",
  "news_day_impact": "How news days affect performance",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}"""

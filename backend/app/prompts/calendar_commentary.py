def calendar_commentary_prompt(
    event_name: str,
    event_country: str | None = None,
    impact: str | None = None,
) -> str:
    return f"""Analyze this economic calendar event for a gold (XAU/USD) trader.

Event: {event_name}
Country: {event_country or "Unknown"}
Reported Impact: {impact or "Unknown"}

Respond ONLY with valid JSON. No markdown. No explanation. No backticks.
Format:
{{
  "impact_rating": "HIGH" or "MEDIUM" or "LOW",
  "explanation": "1-2 sentences on why this matters for gold",
  "historical_pattern": "How gold typically reacts to this event",
  "watch_for": "What the trader should watch for around release time"
}}"""

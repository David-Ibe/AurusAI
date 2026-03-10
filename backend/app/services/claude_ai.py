"""
Centralized Claude AI service.
All AI interactions go through this module.
"""

import json
import logging
from typing import Any, Optional

import anthropic

from app.config import settings
from app.prompts.calendar_commentary import calendar_commentary_prompt
from app.prompts.morning_brief import morning_brief_prompt
from app.prompts.news_impact import news_impact_prompt
from app.prompts.weekly_report import weekly_report_prompt

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"


def get_client() -> anthropic.Anthropic:
    """Get Anthropic client."""
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def analyze_calendar_event(
    event_name: str,
    event_country: Optional[str] = None,
    impact: Optional[str] = None,
) -> dict[str, Any]:
    """
    Use Claude to analyze an economic calendar event for gold trading relevance.
    Returns dict with: impact_rating, explanation, historical_pattern, watch_for
    """
    client = get_client()
    prompt = calendar_commentary_prompt(
        event_name=event_name,
        event_country=event_country,
        impact=impact,
    )

    try:
        logger.info("Claude AI call: analyze_calendar_event", extra={"event": event_name})
        response = client.messages.create(
            model=MODEL,
            max_tokens=500,
            temperature=0.2,
            top_p=0.9,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        result = json.loads(text)
        return result
    except json.JSONDecodeError as e:
        logger.warning("Claude JSON parse failed, using fallback", extra={"error": str(e)})
        return {
            "impact_rating": impact or "MEDIUM",
            "explanation": f"Economic release: {event_name}. Monitor for volatility.",
            "historical_pattern": "Gold often sees increased volatility around major releases.",
            "watch_for": "Price reaction in first 15-30 minutes after release.",
        }
    except Exception as e:
        logger.error("Claude AI call failed", extra={"error": str(e), "event": event_name})
        return {
            "impact_rating": impact or "MEDIUM",
            "explanation": f"Economic release: {event_name}.",
            "historical_pattern": "Monitor for volatility.",
            "watch_for": "Price reaction after release.",
        }


def analyze_news_impact(headline: str, description: str = "", source: str = "") -> dict[str, Any]:
    """
    Use Claude to assess news impact on gold (XAU/USD).
    Returns dict with: impact_score (1-10), impact_assessment
    """
    client = get_client()
    prompt = news_impact_prompt(
        headline=headline,
        description=description,
        source=source,
    )

    try:
        logger.info("Claude AI call: analyze_news_impact", extra={"headline": headline[:50]})
        response = client.messages.create(
            model=MODEL,
            max_tokens=300,
            temperature=0.2,
            top_p=0.9,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        result = json.loads(text)
        return result
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("Claude news analysis failed, using fallback", extra={"error": str(e)})
        return {
            "impact_score": 5,
            "impact_assessment": f"News: {headline[:80]}. Monitor for gold correlation.",
        }


def generate_weekly_report(context: dict[str, Any]) -> dict[str, Any]:
    """Generate weekly intelligence report for gold trader."""
    client = get_client()
    prompt = weekly_report_prompt(context=context)

    try:
        logger.info("Claude AI call: generate_weekly_report")
        response = client.messages.create(
            model=MODEL,
            max_tokens=1200,
            temperature=0.2,
            top_p=0.9,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        return json.loads(text)
    except Exception as e:
        logger.error("Weekly report failed", extra={"error": str(e)})
        return {"week_summary": "Report generation failed.", "error": str(e)}


def generate_daily_brief(context: dict[str, Any]) -> dict[str, Any]:
    """Generate pre-market morning brief."""
    client = get_client()
    prompt = morning_brief_prompt(context=context)

    try:
        logger.info("Claude AI call: generate_daily_brief")
        response = client.messages.create(
            model=MODEL,
            max_tokens=800,
            temperature=0.2,
            top_p=0.9,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        return json.loads(text)
    except Exception as e:
        logger.error("Daily brief failed", extra={"error": str(e)})
        return {"macro_context": "Brief generation failed.", "note": str(e)}

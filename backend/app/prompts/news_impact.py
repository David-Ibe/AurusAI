def news_impact_prompt(headline: str, description: str = "", source: str = "") -> str:
    return f"""Assess this news item for a gold (XAU/USD) trader.

Headline: {headline}
Description: {description or "N/A"}
Source: {source or "Unknown"}

Respond ONLY with valid JSON. No markdown. No explanation. No backticks.
Format:
{{
  "impact_score": <integer 1-10, 10=highest impact on gold>,
  "impact_assessment": "1-2 sentences on gold relevance and likely market reaction"
}}"""

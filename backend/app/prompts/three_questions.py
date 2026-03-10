import json
from typing import Any


def three_questions_prompt(context: dict[str, Any]) -> str:
    """
    Placeholder for future AI-driven Three Questions (trade / wait / stay out).
    Currently ThreeQuestions uses rule-based logic in the frontend.
    """
    return f"""Analyze this context for an XAU/USD trader and advise: Should I trade? Should I wait? Should I stay out?

Context:
{json.dumps(context, indent=2)}
"""

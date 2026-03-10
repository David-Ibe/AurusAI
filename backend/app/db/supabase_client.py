"""
Supabase database client.
"""

import logging
from typing import Optional

from supabase import create_client, Client

from app.config import settings

logger = logging.getLogger(__name__)

_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get Supabase client. Creates one if not exists."""
    global _client
    if _client is None:
        if not settings.supabase_url or not settings.supabase_key:
            raise ValueError("Supabase URL and key must be set in environment")
        _client = create_client(settings.supabase_url, settings.supabase_key)
        logger.info("Supabase client initialized")
    return _client

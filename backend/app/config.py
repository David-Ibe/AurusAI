"""
Application configuration.
"""

from pathlib import Path

from pydantic_settings import BaseSettings

# Load .env from backend/ or project root
_backend_dir = Path(__file__).resolve().parent.parent
_env_path = _backend_dir / ".env"
if not _env_path.exists():
    _env_path = _backend_dir.parent / ".env"


class Settings(BaseSettings):
    """App settings from environment variables."""

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # FMP (Financial Modeling Prep) - Treasury rates, economic indicators
    fmp_api_key: str = ""

    # Massive (Polygon.io) - Economic calendar (TMX Corporate Events)
    massive_api_key: str = ""

    # Anthropic Claude
    anthropic_api_key: str = ""

    # TwelveData (gold price)
    twelvedata_api_key: str = ""

    # NewsAPI
    newsapi_api_key: str = ""

    # Timezone for scheduler
    timezone: str = "Africa/Lagos"

    class Config:
        env_file = str(_env_path) if _env_path.exists() else ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

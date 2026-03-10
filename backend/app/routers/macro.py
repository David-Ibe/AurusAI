"""
Macro data API router.
Treasury rates and economic indicators (FMP free tier).
"""

from fastapi import APIRouter

from app.services.macro_service import get_macro_data

router = APIRouter()


@router.get("")
@router.get("/")
async def get_macro():
    """Get treasury rates and key economic indicators for gold trading context."""
    return await get_macro_data()

"""Trade journal API."""

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.db.supabase_client import get_supabase
from app.services.trade_insights import get_trade_insights

router = APIRouter()


class TradeCreate(BaseModel):
    entry_price: float
    direction: str
    lot_size: float | None = None
    rr_ratio: float | None = None
    setup_description: str | None = None
    session: str | None = None
    news_day: bool = False
    notes: str | None = None


class TradeUpdate(BaseModel):
    exit_price: float | None = None
    outcome: str | None = None
    pnl_dollars: float | None = None
    notes: str | None = None


@router.get("")
@router.get("/")
def list_trades(
    limit: int = Query(50, le=200),
    outcome: str | None = Query(None),
):
    """List trades."""
    supabase = get_supabase()
    q = supabase.table("trades").select("*").order("entry_time", desc=True).limit(limit)
    if outcome:
        q = q.eq("outcome", outcome)
    result = q.execute()
    return {"trades": result.data or []}


@router.post("")
def create_trade(body: TradeCreate):
    """Create a trade (open position)."""
    if body.direction not in ("long", "short"):
        raise HTTPException(400, "direction must be long or short")
    if body.session and body.session not in ("london", "new_york", "asian", "overlap"):
        raise HTTPException(400, "session must be london, new_york, asian, or overlap")

    supabase = get_supabase()
    row = {
        "entry_price": body.entry_price,
        "direction": body.direction,
        "lot_size": body.lot_size,
        "rr_ratio": body.rr_ratio,
        "setup_description": body.setup_description,
        "session": body.session,
        "news_day": body.news_day,
        "notes": body.notes,
        "outcome": "open",
        "entry_time": datetime.utcnow().isoformat(),
    }
    result = supabase.table("trades").insert(row).execute()
    return result.data[0] if result.data else {}


@router.patch("/{trade_id}")
def update_trade(trade_id: UUID, body: TradeUpdate):
    """Update trade (e.g. close position)."""
    supabase = get_supabase()
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(400, "No updates provided")
    if body.outcome and body.outcome not in ("win", "loss", "breakeven", "open"):
        raise HTTPException(400, "outcome must be win, loss, breakeven, or open")
    if "exit_price" in updates or "outcome" in updates:
        updates["exit_time"] = datetime.utcnow().isoformat()
    result = supabase.table("trades").update(updates).eq("id", str(trade_id)).execute()
    return result.data[0] if result.data else {}


@router.get("/insights")
async def insights():
    """Get post-trade performance insights (Claude)."""
    return await get_trade_insights()

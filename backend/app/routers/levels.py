"""Key levels API - support/resistance for gold."""

from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.supabase_client import get_supabase

router = APIRouter()


class LevelCreate(BaseModel):
    price: float
    type: str
    label: str | None = None
    alert_threshold: float = 2.0


class LevelUpdate(BaseModel):
    price: float | None = None
    type: str | None = None
    label: str | None = None
    active: bool | None = None
    alert_threshold: float | None = None


@router.get("")
@router.get("/")
def list_levels(active_only: bool = True):
    """List key levels."""
    supabase = get_supabase()
    q = supabase.table("levels").select("*").order("price")
    if active_only:
        q = q.eq("active", True)
    result = q.execute()
    return {"levels": result.data or []}


@router.post("")
def create_level(body: LevelCreate):
    """Add a key level."""
    if body.type not in ("support", "resistance"):
        raise HTTPException(400, "type must be support or resistance")
    supabase = get_supabase()
    result = (
        supabase.table("levels")
        .insert(
            {
                "price": body.price,
                "type": body.type,
                "label": body.label or "",
                "alert_threshold": body.alert_threshold,
                "active": True,
            }
        )
        .execute()
    )
    return result.data[0] if result.data else {}


@router.patch("/{level_id}")
def update_level(level_id: UUID, body: LevelUpdate):
    """Update a level."""
    supabase = get_supabase()
    updates = {}
    if body.price is not None:
        updates["price"] = body.price
    if body.type is not None:
        if body.type not in ("support", "resistance"):
            raise HTTPException(400, "type must be support or resistance")
        updates["type"] = body.type
    if body.label is not None:
        updates["label"] = body.label
    if body.active is not None:
        updates["active"] = body.active
    if body.alert_threshold is not None:
        updates["alert_threshold"] = body.alert_threshold
    if not updates:
        raise HTTPException(400, "No updates provided")
    result = supabase.table("levels").update(updates).eq("id", str(level_id)).execute()
    return result.data[0] if result.data else {}


@router.delete("/{level_id}")
def delete_level(level_id: UUID):
    """Soft-delete (deactivate) a level."""
    supabase = get_supabase()
    supabase.table("levels").update({"active": False}).eq("id", str(level_id)).execute()
    return {"ok": True}

"""Admin-only batch management: create batches, assign registered learners, track capacity."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import current_admin
from lib.db import db
from models.batches import (
    BATCH_MODES,
    BATCH_STATUSES,
    Batch,
    BatchAssignRequest,
    BatchCreate,
    BatchMember,
    BatchUpdate,
)

router = APIRouter(prefix="/admin/batches")


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


async def _with_enrolled(doc: dict) -> dict:
    doc["enrolled"] = await db.registrations.count_documents({"batch_id": doc["id"]})
    return doc


@router.get("", response_model=list[Batch])
async def list_batches(admin: dict = Depends(current_admin), program: Optional[str] = None):
    query = {"program": program} if program and program != "all" else {}
    docs = await db.batches.find(query).sort("start_date", 1).to_list(500)
    return [Batch(**await _with_enrolled(_clean(d))) for d in docs]


@router.post("", response_model=Batch, status_code=201)
async def create_batch(payload: BatchCreate, admin: dict = Depends(current_admin)):
    if payload.mode not in BATCH_MODES:
        raise HTTPException(status_code=400, detail="Unknown batch mode")
    if payload.status not in BATCH_STATUSES:
        raise HTTPException(status_code=400, detail="Unknown batch status")
    try:
        datetime.strptime(payload.start_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="start_date must be YYYY-MM-DD")
    batch = Batch(**payload.model_dump())
    await db.batches.insert_one(batch.model_dump())
    return batch


@router.patch("/{batch_id}", response_model=Batch)
async def update_batch(batch_id: str, payload: BatchUpdate, admin: dict = Depends(current_admin)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if payload.status and payload.status not in BATCH_STATUSES:
        raise HTTPException(status_code=400, detail="Unknown batch status")
    if payload.mode and payload.mode not in BATCH_MODES:
        raise HTTPException(status_code=400, detail="Unknown batch mode")
    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")
    doc = await db.batches.find_one_and_update(
        {"id": batch_id}, {"$set": updates}, return_document=True
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Batch not found")
    return Batch(**await _with_enrolled(_clean(doc)))


@router.delete("/{batch_id}")
async def delete_batch(batch_id: str, admin: dict = Depends(current_admin)):
    result = await db.batches.delete_one({"id": batch_id})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Batch not found")
    await db.registrations.update_many({"batch_id": batch_id}, {"$unset": {"batch_id": ""}})
    return {"ok": True}


@router.get("/{batch_id}/members", response_model=list[BatchMember])
async def batch_members(batch_id: str, admin: dict = Depends(current_admin)):
    if not await db.batches.find_one({"id": batch_id}):
        raise HTTPException(status_code=404, detail="Batch not found")
    docs = await db.registrations.find({"batch_id": batch_id}).sort("full_name", 1).to_list(500)
    return [
        BatchMember(
            registration_id=d["registration_id"],
            full_name=d.get("full_name", ""),
            email=d.get("email", ""),
            phone=d.get("phone", ""),
            learner_type=d.get("learner_type", "student"),
            status=d.get("status", "New"),
        )
        for d in docs
    ]


@router.post("/{batch_id}/assign", response_model=Batch)
async def assign_to_batch(
    batch_id: str, payload: BatchAssignRequest, admin: dict = Depends(current_admin)
):
    batch = await db.batches.find_one({"id": batch_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    already = await db.registrations.count_documents({"batch_id": batch_id})
    incoming = await db.registrations.count_documents(
        {"registration_id": {"$in": payload.registration_ids}, "batch_id": {"$ne": batch_id}}
    )
    if already + incoming > batch["capacity"]:
        raise HTTPException(
            status_code=400,
            detail=f"Batch capacity is {batch['capacity']}; {already} already enrolled",
        )

    result = await db.registrations.update_many(
        {"registration_id": {"$in": payload.registration_ids}},
        {"$set": {"batch_id": batch_id, "batch_assigned_at": datetime.now(timezone.utc)}},
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="No matching registrations")
    return Batch(**await _with_enrolled(_clean(batch)))


@router.post("/{batch_id}/unassign", response_model=Batch)
async def unassign_from_batch(
    batch_id: str, payload: BatchAssignRequest, admin: dict = Depends(current_admin)
):
    batch = await db.batches.find_one({"id": batch_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    await db.registrations.update_many(
        {"registration_id": {"$in": payload.registration_ids}, "batch_id": batch_id},
        {"$unset": {"batch_id": "", "batch_assigned_at": ""}},
    )
    return Batch(**await _with_enrolled(_clean(batch)))

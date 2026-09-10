"""Pydantic v2 models for training batches. Mirrored in frontend/src/lib/types.ts."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

BATCH_MODES = ["Online", "Offline", "Hybrid"]
BATCH_STATUSES = ["Planned", "Enrolling", "Running", "Completed", "Cancelled"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


class BatchCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    program: str
    mode: str = "Online"
    timing: str = Field(min_length=2, max_length=80)
    start_date: str
    capacity: int = Field(default=25, ge=1, le=500)
    status: str = "Enrolling"


class BatchUpdate(BaseModel):
    name: Optional[str] = None
    mode: Optional[str] = None
    timing: Optional[str] = None
    start_date: Optional[str] = None
    capacity: Optional[int] = Field(default=None, ge=1, le=500)
    status: Optional[str] = None


class Batch(BatchCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=_now)
    enrolled: int = 0


class BatchAssignRequest(BaseModel):
    registration_ids: list[str] = Field(min_length=1)


class BatchMember(BaseModel):
    registration_id: str
    full_name: str
    email: str
    phone: str
    learner_type: str
    status: str


class FollowUpItem(BaseModel):
    registration_id: str
    full_name: str
    phone: str
    email: str
    program: str
    learner_type: str
    status: str
    follow_up_date: str
    notes: str = ""
    bucket: str  # overdue | today | upcoming


class FollowUpBoard(BaseModel):
    today: list[FollowUpItem]
    overdue: list[FollowUpItem]
    upcoming: list[FollowUpItem]
    unscheduled: int

"""Admin dashboard endpoints — all guarded by the httpOnly session cookie."""

import csv
import io
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import FileResponse, StreamingResponse

from lib.auth import (
    COOKIE_KWARGS,
    SESSION_COOKIE,
    create_session,
    current_admin,
    destroy_session,
    verify_password,
)
from lib.db import db
from models.leads import (
    AdminStats,
    AdminUser,
    CountItem,
    Enquiry,
    LEAD_STATUSES,
    LoginRequest,
    Registration,
    RegistrationUpdate,
)

router = APIRouter(prefix="/admin")

PROGRAM_LABELS = {
    "data-analyst": "Data Analyst",
    "data-scientist": "Data Scientist",
    "ai-ml": "AI / ML Engineer",
    "generative-ai": "Generative AI",
    "agentic-ai": "Agentic AI",
}

CONVERTED = {"Registered", "Training Started", "Completed"}


@router.post("/login", response_model=AdminUser)
async def login(payload: LoginRequest, response: Response):
    user = await db.admin_users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = await create_session(user["email"])
    response.set_cookie(SESSION_COOKIE, token, **COOKIE_KWARGS)
    return AdminUser(email=user["email"], name=user["name"], role=user["role"])


@router.post("/logout")
async def logout(response: Response, admin: dict = Depends(current_admin)):
    await db.admin_sessions.delete_many({"email": admin["email"]})
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"ok": True}


@router.get("/me", response_model=AdminUser)
async def me(admin: dict = Depends(current_admin)):
    return AdminUser(email=admin["email"], name=admin["name"], role=admin["role"])


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


@router.get("/stats", response_model=AdminStats)
async def stats(admin: dict = Depends(current_admin)):
    docs = [_clean(d) for d in await db.registrations.find().to_list(5000)]
    total = len(docs)
    statuses = Counter(d.get("status", "New") for d in docs)
    programs = Counter(d.get("program", "unknown") for d in docs)
    converted = sum(statuses[s] for s in CONVERTED)

    today = datetime.now(timezone.utc).date()
    day_counts: Counter[str] = Counter()
    for d in docs:
        created = d.get("created_at")
        if isinstance(created, datetime):
            day_counts[created.date().isoformat()] += 1
    by_day = []
    for i in range(13, -1, -1):
        day = (today - timedelta(days=i)).isoformat()
        by_day.append(CountItem(key=day, label=day[5:], count=day_counts.get(day, 0)))

    return AdminStats(
        total_leads=total,
        student_leads=sum(1 for d in docs if d.get("learner_type") == "student"),
        professional_leads=sum(1 for d in docs if d.get("learner_type") == "professional"),
        new_leads=statuses.get("New", 0),
        follow_ups_pending=statuses.get("Follow-up Required", 0)
        + statuses.get("Counselling Scheduled", 0),
        converted=converted,
        conversion_rate=round(converted / total * 100, 1) if total else 0.0,
        enquiries=await db.enquiries.count_documents({}),
        by_program=[
            CountItem(key=k, label=v, count=programs.get(k, 0)) for k, v in PROGRAM_LABELS.items()
        ],
        by_status=[CountItem(key=s, label=s, count=statuses.get(s, 0)) for s in LEAD_STATUSES],
        by_day=by_day,
    )


def _filter_query(
    q: Optional[str], program: Optional[str], learner_type: Optional[str], status: Optional[str]
) -> dict:
    query: dict = {}
    if program and program != "all":
        query["program"] = program
    if learner_type and learner_type != "all":
        query["learner_type"] = learner_type
    if status and status != "all":
        query["status"] = status
    if q:
        rx = {"$regex": q, "$options": "i"}
        query["$or"] = [
            {"full_name": rx},
            {"email": rx},
            {"phone": rx},
            {"registration_id": rx},
        ]
    return query


@router.get("/registrations", response_model=list[Registration])
async def list_registrations(
    admin: dict = Depends(current_admin),
    q: Optional[str] = None,
    program: Optional[str] = None,
    learner_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(default=200, le=1000),
):
    cursor = db.registrations.find(_filter_query(q, program, learner_type, status)).sort(
        "created_at", -1
    )
    return [Registration(**_clean(d)) for d in await cursor.to_list(limit)]


@router.patch("/registrations/{registration_id}", response_model=Registration)
async def update_registration(
    registration_id: str, payload: RegistrationUpdate, admin: dict = Depends(current_admin)
):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if payload.status and payload.status not in LEAD_STATUSES:
        raise HTTPException(status_code=400, detail="Unknown lead status")
    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")
    doc = await db.registrations.find_one_and_update(
        {"registration_id": registration_id}, {"$set": updates}, return_document=True
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Registration not found")
    return Registration(**_clean(doc))


@router.get("/enquiries", response_model=list[Enquiry])
async def list_enquiries(admin: dict = Depends(current_admin)):
    docs = await db.enquiries.find().sort("created_at", -1).to_list(500)
    return [Enquiry(**_clean(d)) for d in docs]


EXPORT_FIELDS = [
    "registration_id",
    "created_at",
    "learner_type",
    "program",
    "full_name",
    "gender",
    "phone",
    "email",
    "city",
    "state",
    "college",
    "degree",
    "branch",
    "passed_out_year",
    "current_company",
    "current_role",
    "experience_years",
    "industry",
    "skills",
    "programming_languages",
    "projects",
    "certifications",
    "target_role",
    "preferred_role",
    "current_package",
    "expected_package",
    "notice_period",
    "looking_for",
    "learning_mode",
    "batch_timing",
    "availability",
    "source",
    "linkedin",
    "github",
    "resume_filename",
    "status",
    "notes",
    "follow_up_date",
]


@router.get("/export")
async def export_csv(admin: dict = Depends(current_admin)):
    docs = await db.registrations.find().sort("created_at", -1).to_list(5000)
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=EXPORT_FIELDS, extrasaction="ignore")
    writer.writeheader()
    for d in docs:
        row = {k: d.get(k, "") for k in EXPORT_FIELDS}
        if isinstance(row.get("created_at"), datetime):
            row["created_at"] = row["created_at"].isoformat()
        writer.writerow(row)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=skilvantage-registrations.csv"},
    )


@router.get("/resumes/{file_id}")
async def download_resume(file_id: str, admin: dict = Depends(current_admin)):
    doc = await db.resumes.find_one({"file_id": file_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    path = Path(__file__).parent.parent / "uploads" / doc["stored_name"]
    if not path.exists():
        raise HTTPException(status_code=404, detail="Resume file missing")
    return FileResponse(path, filename=doc["filename"], media_type="application/octet-stream")

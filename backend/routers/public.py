"""Public (unauthenticated) SkilVantage endpoints: registrations, enquiries, resume upload."""

import random
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from lib.db import db
from models.leads import (
    Enquiry,
    EnquiryCreate,
    Registration,
    RegistrationCreate,
    RegistrationResult,
    UploadResult,
)

router = APIRouter()

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXT = {".pdf", ".doc", ".docx"}
MAX_BYTES = 5 * 1024 * 1024

PREFIX = {"student": "SVS", "professional": "SVP"}


async def _next_registration_id(learner_type: str) -> str:
    year = datetime.now(timezone.utc).strftime("%y")
    for _ in range(6):
        candidate = f"{PREFIX[learner_type]}{year}{random.randint(10000, 99999)}"
        if not await db.registrations.find_one({"registration_id": candidate}):
            return candidate
    return f"{PREFIX[learner_type]}{year}{uuid.uuid4().hex[:6].upper()}"


@router.post("/registrations", response_model=RegistrationResult, status_code=201)
async def create_registration(payload: RegistrationCreate):
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Consent is required to register")
    if not re.fullmatch(r"[0-9+\-\s()]{6,20}", payload.phone):
        raise HTTPException(status_code=400, detail="Enter a valid phone number")
    registration_id = await _next_registration_id(payload.learner_type)
    record = Registration(registration_id=registration_id, **payload.model_dump())
    await db.registrations.insert_one(record.model_dump())
    return RegistrationResult(
        registration_id=record.registration_id,
        learner_type=record.learner_type,
        program=record.program,
        full_name=record.full_name,
    )


@router.post("/enquiries", response_model=Enquiry, status_code=201)
async def create_enquiry(payload: EnquiryCreate):
    record = Enquiry(**payload.model_dump())
    await db.enquiries.insert_one(record.model_dump())
    return record


@router.post("/uploads/resume", response_model=UploadResult)
async def upload_resume(file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Only PDF, DOC or DOCX resumes are accepted")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Resume must be smaller than 5 MB")
    file_id = str(uuid.uuid4())
    (UPLOAD_DIR / f"{file_id}{ext}").write_bytes(data)
    await db.resumes.insert_one(
        {
            "file_id": file_id,
            "filename": file.filename,
            "stored_name": f"{file_id}{ext}",
            "created_at": datetime.now(timezone.utc),
        }
    )
    return UploadResult(file_id=file_id, filename=file.filename or "resume")

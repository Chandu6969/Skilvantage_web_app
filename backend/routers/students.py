"""Admin-only student roster: CRUD plus import from registered leads."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import current_admin
from lib.db import db
from models.students import Student, StudentCreate, StudentUpdate

router = APIRouter(prefix="/admin/students")

IMPORTABLE_STATUSES = ["Registered", "Training Started"]


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


@router.get("", response_model=list[Student])
async def list_students(
    admin: dict = Depends(current_admin),
    q: Optional[str] = None,
    active_only: bool = False,
):
    query: dict = {}
    if active_only:
        query["active"] = True
    if q:
        rx = {"$regex": q, "$options": "i"}
        query["$or"] = [{"full_name": rx}, {"phone": rx}, {"email": rx}]
    docs = await db.students.find(query).sort("full_name", 1).to_list(1000)
    return [Student(**_clean(d)) for d in docs]


@router.post("", response_model=Student, status_code=201)
async def create_student(payload: StudentCreate, admin: dict = Depends(current_admin)):
    student = Student(**payload.model_dump())
    await db.students.insert_one(student.model_dump())
    return student


@router.patch("/{student_id}", response_model=Student)
async def update_student(
    student_id: str, payload: StudentUpdate, admin: dict = Depends(current_admin)
):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")
    doc = await db.students.find_one_and_update(
        {"id": student_id}, {"$set": updates}, return_document=True
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Student not found")
    return Student(**_clean(doc))


@router.delete("/{student_id}")
async def delete_student(student_id: str, admin: dict = Depends(current_admin)):
    result = await db.students.delete_one({"id": student_id})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Student not found")
    await db.attendance.delete_many({"student_id": student_id})
    await db.payments.delete_many({"student_id": student_id})
    return {"ok": True}


@router.post("/import-from-registrations", response_model=list[Student])
async def import_from_registrations(admin: dict = Depends(current_admin)):
    """Turn every Registered / Training Started lead into a student, skipping duplicates."""
    leads = await db.registrations.find({"status": {"$in": IMPORTABLE_STATUSES}}).to_list(2000)
    created: list[Student] = []
    for lead in leads:
        reg_id = lead.get("registration_id")
        if await db.students.find_one({"registration_id": reg_id}):
            continue
        student = Student(
            full_name=lead.get("full_name", "Unnamed"),
            phone=lead.get("phone"),
            email=lead.get("email"),
            year=lead.get("current_year_of_study") or lead.get("degree"),
            branch=lead.get("branch"),
            program=lead.get("program"),
            registration_id=reg_id,
        )
        await db.students.insert_one(student.model_dump())
        created.append(student)
    return created

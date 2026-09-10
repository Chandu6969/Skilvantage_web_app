"""Admin-only student roster: CRUD plus import from registered leads."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import current_admin
from lib.db import db
from models.students import (
    ATTENDANCE_CODES,
    ATTENDANCE_LABELS,
    NON_WORKING_CODES,
    PRESENT_CODES,
    AttendanceHistoryItem,
    PaymentLedgerItem,
    Student,
    StudentCreate,
    StudentDetail,
    StudentUpdate,
)

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


@router.get("/{student_id}/detail", response_model=StudentDetail)
async def student_detail(student_id: str, admin: dict = Depends(current_admin)):
    """One student: full attendance history (holidays auto-filled) plus the payment ledger."""
    doc = await db.students.find_one({"id": student_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Student not found")
    student = Student(**_clean(doc))

    explicit = {
        r["date"]: r["code"]
        for r in await db.attendance.find({"student_id": student_id}).to_list(5000)
    }
    holidays = {h["date"]: h for h in await db.holidays.find().to_list(2000)}

    merged: dict[str, tuple[str, bool]] = {
        d: (h["code"], True) for d, h in holidays.items() if d not in explicit
    }
    merged.update({d: (c, False) for d, c in explicit.items()})

    counts = {code: 0 for code in ATTENDANCE_CODES}
    for code, _auto in merged.values():
        if code in counts:
            counts[code] += 1
    working = sum(v for k, v in counts.items() if k not in NON_WORKING_CODES)
    attended = sum(v for k, v in counts.items() if k in PRESENT_CODES)

    history = [
        AttendanceHistoryItem(
            date=d,
            code=code,
            label=ATTENDANCE_LABELS.get(code, code),
            auto=auto,
        )
        for d, (code, auto) in sorted(merged.items(), reverse=True)
    ]

    payments = await db.payments.find({"student_id": student_id}).sort("month", -1).to_list(500)
    ledger = [
        PaymentLedgerItem(
            month=p["month"],
            paid=bool(p.get("paid")),
            amount=p.get("amount"),
            method=p.get("method"),
            paid_on=p.get("paid_on"),
            notes=p.get("notes") or "",
        )
        for p in payments
    ]
    paid_to_date = sum(float(p.get("amount") or 0) for p in payments if p.get("paid"))
    months_paid = sum(1 for p in payments if p.get("paid"))

    return StudentDetail(
        student=student,
        counts=counts,
        working_days=working,
        attended=attended,
        percentage=round(attended / working * 100, 1) if working else 0.0,
        history=history,
        ledger=ledger,
        months_paid=months_paid,
        paid_to_date=round(paid_to_date, 2),
        balance=(
            round(float(student.total_fee) - paid_to_date, 2)
            if student.total_fee is not None
            else None
        ),
        monthly_amount=float(student.monthly_amount or 999),
    )


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

"""Holiday calendar: preset Sundays and festival holidays that auto-fill the attendance register.

Holidays are stored once per date and applied *implicitly* when the register is read, so no
per-student rows are written. An explicit mark on a student always wins over the holiday.
"""

from calendar import monthrange
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query

from lib.auth import current_admin
from lib.db import db
from models.students import (
    Holiday,
    HolidayBulkResult,
    HolidayCreate,
    SundayFillRequest,
)

router = APIRouter(prefix="/admin/holidays")

ALLOWED_CODES = {"H", "NC"}


def _parse(value: str, field: str) -> date:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"{field} must be YYYY-MM-DD")


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


async def holiday_map(date_from: str, date_to: str) -> dict[str, dict]:
    """{date: holiday} for a range — used by the attendance router to auto-fill."""
    docs = await db.holidays.find({"date": {"$gte": date_from, "$lte": date_to}}).to_list(2000)
    return {d["date"]: _clean(d) for d in docs}


@router.get("", response_model=list[Holiday])
async def list_holidays(
    admin: dict = Depends(current_admin),
    date_from: str = Query(default=""),
    date_to: str = Query(default=""),
):
    query: dict = {}
    if date_from and date_to:
        # ISO dates sort lexicographically, so a plain string range is safe here and lets
        # callers pass a loose month end (e.g. -31) without a 400.
        query["date"] = {"$gte": date_from, "$lte": date_to}
    docs = await db.holidays.find(query).sort("date", 1).to_list(2000)
    return [Holiday(**_clean(d)) for d in docs]


@router.post("", response_model=Holiday, status_code=201)
async def create_holiday(payload: HolidayCreate, admin: dict = Depends(current_admin)):
    _parse(payload.date, "date")
    if payload.code not in ALLOWED_CODES:
        raise HTTPException(status_code=400, detail="code must be H (Holiday) or NC (No Class)")
    if await db.holidays.find_one({"date": payload.date}):
        raise HTTPException(status_code=400, detail=f"{payload.date} is already a holiday")
    holiday = Holiday(**payload.model_dump())
    await db.holidays.insert_one(holiday.model_dump())
    return holiday


@router.delete("/{holiday_id}")
async def delete_holiday(holiday_id: str, admin: dict = Depends(current_admin)):
    result = await db.holidays.delete_one({"id": holiday_id})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Holiday not found")
    return {"ok": True}


@router.post("/fill-sundays", response_model=HolidayBulkResult)
async def fill_sundays(payload: SundayFillRequest, admin: dict = Depends(current_admin)):
    """Mark every Sunday in a month as a holiday, skipping dates already present."""
    try:
        anchor = datetime.strptime(payload.month, "%Y-%m")
    except ValueError:
        raise HTTPException(status_code=400, detail="month must be YYYY-MM")

    days = monthrange(anchor.year, anchor.month)[1]
    created: list[Holiday] = []
    skipped = 0
    for day in range(1, days + 1):
        current = date(anchor.year, anchor.month, day)
        if current.weekday() != 6:  # 6 = Sunday
            continue
        iso = current.isoformat()
        if await db.holidays.find_one({"date": iso}):
            skipped += 1
            continue
        holiday = Holiday(date=iso, name=payload.name, code="H")
        await db.holidays.insert_one(holiday.model_dump())
        created.append(holiday)

    return HolidayBulkResult(created=len(created), skipped=skipped, holidays=created)


@router.post("/fill-weekly", response_model=HolidayBulkResult)
async def fill_weekly(
    admin: dict = Depends(current_admin),
    month: str = Query(...),
    weekday: int = Query(..., ge=0, le=6),
    name: str = Query(default="Weekly off"),
):
    """Same as fill-sundays but for any weekday (0 = Monday … 6 = Sunday)."""
    try:
        anchor = datetime.strptime(month, "%Y-%m")
    except ValueError:
        raise HTTPException(status_code=400, detail="month must be YYYY-MM")

    days = monthrange(anchor.year, anchor.month)[1]
    created: list[Holiday] = []
    skipped = 0
    for day in range(1, days + 1):
        current = date(anchor.year, anchor.month, day)
        if current.weekday() != weekday:
            continue
        iso = current.isoformat()
        if await db.holidays.find_one({"date": iso}):
            skipped += 1
            continue
        holiday = Holiday(date=iso, name=name, code="H")
        await db.holidays.insert_one(holiday.model_dump())
        created.append(holiday)
    return HolidayBulkResult(created=len(created), skipped=skipped, holidays=created)


@router.post("/clear-month", response_model=HolidayBulkResult)
async def clear_month(admin: dict = Depends(current_admin), month: str = Query(...)):
    try:
        datetime.strptime(month, "%Y-%m")
    except ValueError:
        raise HTTPException(status_code=400, detail="month must be YYYY-MM")
    start = f"{month}-01"
    end = (
        datetime.strptime(start, "%Y-%m-%d").date()
        + timedelta(days=monthrange(int(month[:4]), int(month[5:7]))[1] - 1)
    ).isoformat()
    result = await db.holidays.delete_many({"date": {"$gte": start, "$lte": end}})
    return HolidayBulkResult(created=0, skipped=result.deleted_count, holidays=[])

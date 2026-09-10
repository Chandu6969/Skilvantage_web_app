"""Attendance: today's marking sheet, date-range summary, CSV and PDF export."""

import csv
import io
from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from lib.auth import current_admin
from lib.db import db
from lib.dates import today_iso
from routers.holidays import holiday_map
from models.students import (
    ATTENDANCE_CODES,
    ATTENDANCE_LABELS,
    NON_WORKING_CODES,
    PRESENT_CODES,
    AttendanceCell,
    AttendanceDay,
    AttendanceRangeSummary,
    AttendanceSaveRequest,
    AttendanceStudentSummary,
)

router = APIRouter(prefix="/admin/attendance")

MAX_RANGE_DAYS = 120


def _parse(d: str, field: str) -> date:
    try:
        return datetime.strptime(d, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"{field} must be YYYY-MM-DD")


async def _roster(learner_type: Optional[str] = None) -> list[dict]:
    query: dict = {"active": True}
    if learner_type in ("student", "professional"):
        query["learner_type"] = learner_type
    return await db.students.find(query).sort("full_name", 1).to_list(1000)


@router.get("/day", response_model=AttendanceDay)
async def day_sheet(
    admin: dict = Depends(current_admin),
    date_: Optional[str] = Query(default=None, alias="date"),
    learner_type: Optional[str] = None,
):
    """Marking sheet for one day. Defaults to the server's today, never a browser date."""
    target = date_ or today_iso()
    _parse(target, "date")
    students = await _roster(learner_type)
    existing = {
        r["student_id"]: r["code"]
        for r in await db.attendance.find({"date": target}).to_list(2000)
    }
    # A holiday auto-fills the register for anyone not explicitly marked.
    holiday = (await holiday_map(target, target)).get(target)
    rows = [
        AttendanceCell(
            student_id=s["id"],
            full_name=s.get("full_name", ""),
            year=s.get("year"),
            branch=s.get("branch"),
            phone=s.get("phone"),
            code=existing.get(s["id"]) or (holiday["code"] if holiday else None),
        )
        for s in students
    ]
    return AttendanceDay(
        date=target,
        is_today=target == today_iso(),
        marked=sum(1 for r in rows if r.code),
        total=len(rows),
        rows=rows,
        holiday_name=holiday["name"] if holiday else None,
        holiday_code=holiday["code"] if holiday else None,
    )


@router.post("/save", response_model=AttendanceDay)
async def save_marks(
    payload: AttendanceSaveRequest,
    admin: dict = Depends(current_admin),
    learner_type: Optional[str] = None,
):
    _parse(payload.date, "date")
    for mark in payload.marks:
        if mark.code not in ATTENDANCE_CODES and mark.code != "":
            raise HTTPException(status_code=400, detail=f"Unknown attendance code '{mark.code}'")

    for mark in payload.marks:
        if mark.code == "":
            await db.attendance.delete_one({"date": payload.date, "student_id": mark.student_id})
            continue
        await db.attendance.update_one(
            {"date": payload.date, "student_id": mark.student_id},
            {
                "$set": {
                    "date": payload.date,
                    "student_id": mark.student_id,
                    "code": mark.code,
                    "marked_by": admin["email"],
                    "marked_at": datetime.now(tz=None).isoformat(),
                }
            },
            upsert=True,
        )
    return await day_sheet(admin=admin, date_=payload.date, learner_type=learner_type)


@router.post("/mark-all", response_model=AttendanceDay)
async def mark_all(
    admin: dict = Depends(current_admin),
    date_: Optional[str] = Query(default=None, alias="date"),
    code: str = Query(default="P"),
    learner_type: Optional[str] = None,
):
    """Bulk-set every unmarked student for a day (e.g. mark the whole batch Present)."""
    if code not in ATTENDANCE_CODES:
        raise HTTPException(status_code=400, detail=f"Unknown attendance code '{code}'")
    target = date_ or today_iso()
    _parse(target, "date")
    students = await _roster(learner_type)
    for s in students:
        await db.attendance.update_one(
            {"date": target, "student_id": s["id"]},
            {
                "$set": {
                    "date": target,
                    "student_id": s["id"],
                    "code": code,
                    "marked_by": admin["email"],
                }
            },
            upsert=True,
        )
    return await day_sheet(admin=admin, date_=target, learner_type=learner_type)


async def _range_summary(
    date_from: str, date_to: str, learner_type: Optional[str] = None
) -> AttendanceRangeSummary:
    start = _parse(date_from, "date_from")
    end = _parse(date_to, "date_to")
    if end < start:
        raise HTTPException(status_code=400, detail="date_to must not be before date_from")
    if (end - start).days + 1 > MAX_RANGE_DAYS:
        raise HTTPException(status_code=400, detail=f"Range is limited to {MAX_RANGE_DAYS} days")

    dates = [(start + timedelta(days=i)).isoformat() for i in range((end - start).days + 1)]
    students = await _roster(learner_type)
    records = await db.attendance.find(
        {"date": {"$gte": date_from, "$lte": date_to}}
    ).to_list(20000)
    holidays = await holiday_map(date_from, date_to)

    by_student: dict[str, dict[str, str]] = {}
    for r in records:
        by_student.setdefault(r["student_id"], {})[r["date"]] = r["code"]

    summaries: list[AttendanceStudentSummary] = []
    for s in students:
        explicit = by_student.get(s["id"], {})
        # Holidays auto-fill any date the student was not explicitly marked on.
        marks = {d: h["code"] for d, h in holidays.items() if d not in explicit}
        marks.update(explicit)
        counts = {code: 0 for code in ATTENDANCE_CODES}
        for code in marks.values():
            if code in counts:
                counts[code] += 1
        working = sum(v for k, v in counts.items() if k not in NON_WORKING_CODES)
        attended = sum(v for k, v in counts.items() if k in PRESENT_CODES)
        summaries.append(
            AttendanceStudentSummary(
                student_id=s["id"],
                full_name=s.get("full_name", ""),
                year=s.get("year"),
                branch=s.get("branch"),
                counts=counts,
                working_days=working,
                attended=attended,
                percentage=round(attended / working * 100, 1) if working else 0.0,
                by_date=marks,
            )
        )

    total_working = sum(s.working_days for s in summaries)
    total_attended = sum(s.attended for s in summaries)
    return AttendanceRangeSummary(
        date_from=date_from,
        date_to=date_to,
        dates=dates,
        students=summaries,
        overall_percentage=round(total_attended / total_working * 100, 1) if total_working else 0.0,
    )


@router.get("/summary", response_model=AttendanceRangeSummary)
async def summary(
    admin: dict = Depends(current_admin),
    date_from: str = Query(...),
    date_to: str = Query(...),
    learner_type: Optional[str] = None,
):
    return await _range_summary(date_from, date_to, learner_type)


@router.get("/export.csv")
async def export_csv(
    admin: dict = Depends(current_admin),
    date_from: str = Query(...),
    date_to: str = Query(...),
    learner_type: Optional[str] = None,
):
    data = await _range_summary(date_from, date_to, learner_type)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        ["#", "Student", "Year", "Branch", *data.dates, *ATTENDANCE_CODES, "Working Days", "Attendance %"]
    )
    for i, s in enumerate(data.students, start=1):
        writer.writerow(
            [
                i,
                s.full_name,
                s.year or "",
                s.branch or "",
                *[s.by_date.get(d, "") for d in data.dates],
                *[s.counts.get(c, 0) for c in ATTENDANCE_CODES],
                s.working_days,
                f"{s.percentage}%",
            ]
        )
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=attendance-{date_from}-to-{date_to}.csv"
        },
    )


@router.get("/export.pdf")
async def export_pdf(
    admin: dict = Depends(current_admin),
    date_from: str = Query(...),
    date_to: str = Query(...),
    learner_type: Optional[str] = None,
):
    """Attendance sheet only, for the chosen range, with per-student counts and percentage."""
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_RIGHT
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    data = await _range_summary(date_from, date_to, learner_type)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("t", parent=styles["Title"], fontSize=16, textColor=colors.HexColor("#0B2545"))
    meta_style = ParagraphStyle("m", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor("#475569"))
    right = ParagraphStyle("r", parent=meta_style, alignment=TA_RIGHT)

    # Only inline the day-by-day grid when it fits the page; otherwise counts only.
    show_days = len(data.dates) <= 31
    header = ["#", "Student", "Year / Branch"]
    if show_days:
        header += [d[8:] for d in data.dates]
    header += [*ATTENDANCE_CODES, "Days", "Attn %"]

    body = [header]
    for i, s in enumerate(data.students, start=1):
        row = [str(i), s.full_name, " / ".join(x for x in [s.year, s.branch] if x) or "—"]
        if show_days:
            row += [s.by_date.get(d, "·") for d in data.dates]
        row += [str(s.counts.get(c, 0)) for c in ATTENDANCE_CODES]
        row += [str(s.working_days), f"{s.percentage}%"]
        body.append(row)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=landscape(A4),
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=10 * mm,
        bottomMargin=10 * mm,
        title=f"SkilVantage Attendance {date_from} to {date_to}",
    )

    legend = "  ".join(f"{c} = {ATTENDANCE_LABELS[c]}" for c in ATTENDANCE_CODES)
    elements = [
        Paragraph(
            "SkilVantage — Attendance Sheet"
            + (
                " (Working Professionals)"
                if learner_type == "professional"
                else " (Students)" if learner_type == "student" else ""
            ),
            title_style,
        ),
        Spacer(1, 3 * mm),
        Paragraph(
            f"Period: <b>{date_from}</b> to <b>{date_to}</b> &nbsp;·&nbsp; "
            f"Students: <b>{len(data.students)}</b> &nbsp;·&nbsp; "
            f"Overall attendance: <b>{data.overall_percentage}%</b>",
            meta_style,
        ),
        Spacer(1, 1.5 * mm),
        Paragraph(f"Legend: {legend}", meta_style),
        Spacer(1, 4 * mm),
    ]
    if not show_days:
        elements.append(
            Paragraph(
                f"Range spans {len(data.dates)} days — day-by-day columns are omitted; totals shown.",
                meta_style,
            )
        )
        elements.append(Spacer(1, 3 * mm))

    table = Table(body, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B2545")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 6.5 if show_days else 8),
                ("ALIGN", (2, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]
        )
    )
    elements += [
        table,
        Spacer(1, 4 * mm),
        Paragraph(
            f"Generated {today_iso()} · SkilVantage · Attendance % counts P, LT and T as attended; "
            "H and NC are excluded from working days.",
            right,
        ),
    ]
    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=attendance-{date_from}-to-{date_to}.pdf"
        },
    )

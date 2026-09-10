"""Payments: month-by-month tracking with collected / outstanding totals, CSV and PDF export."""

import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from lib.auth import current_admin
from lib.db import db
from lib.dates import today_iso
from models.students import (
    PAYMENT_AMOUNTS,
    PaymentBoard,
    PaymentRecord,
    PaymentRow,
    PaymentUpsert,
)

router = APIRouter(prefix="/admin/payments")

DEFAULT_MONTHLY = float(PAYMENT_AMOUNTS[0])


def _check_month(month: str) -> None:
    try:
        datetime.strptime(month, "%Y-%m")
    except ValueError:
        raise HTTPException(status_code=400, detail="month must be YYYY-MM")


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


async def _board(month: str) -> PaymentBoard:
    _check_month(month)
    students = await db.students.find({"active": True}).sort("full_name", 1).to_list(1000)
    ids = [s["id"] for s in students]

    this_month = {
        r["student_id"]: r
        for r in await db.payments.find({"month": month, "student_id": {"$in": ids}}).to_list(2000)
    }
    all_paid = await db.payments.find({"paid": True, "student_id": {"$in": ids}}).to_list(20000)

    paid_to_date: dict[str, float] = {}
    months_paid: dict[str, int] = {}
    for r in all_paid:
        sid = r["student_id"]
        paid_to_date[sid] = paid_to_date.get(sid, 0.0) + float(r.get("amount") or 0)
        months_paid[sid] = months_paid.get(sid, 0) + 1

    rows: list[PaymentRow] = []
    expected = collected = 0.0
    paid_count = 0

    for s in students:
        rec = this_month.get(s["id"])
        due = float(s.get("monthly_amount") or DEFAULT_MONTHLY)
        expected += due
        is_paid = bool(rec and rec.get("paid"))
        amount = float(rec.get("amount") or 0) if rec else None
        if is_paid:
            paid_count += 1
            collected += amount or due
        total_fee = s.get("total_fee")
        pd = paid_to_date.get(s["id"], 0.0)
        rows.append(
            PaymentRow(
                student_id=s["id"],
                full_name=s.get("full_name", ""),
                phone=s.get("phone"),
                year=s.get("year"),
                branch=s.get("branch"),
                month=month,
                paid=is_paid,
                amount=amount,
                method=rec.get("method") if rec else None,
                paid_on=rec.get("paid_on") if rec else None,
                notes=(rec.get("notes") or "") if rec else "",
                total_fee=total_fee,
                paid_to_date=round(pd, 2),
                balance=round(float(total_fee) - pd, 2) if total_fee is not None else None,
                months_paid=months_paid.get(s["id"], 0),
            )
        )

    lifetime_collected = round(sum(paid_to_date.values()), 2)
    lifetime_expected = round(
        sum(float(s["total_fee"]) for s in students if s.get("total_fee") is not None), 2
    )
    total = len(students)
    return PaymentBoard(
        month=month,
        total_students=total,
        paid_count=paid_count,
        pending_count=total - paid_count,
        paid_percentage=round(paid_count / total * 100, 1) if total else 0.0,
        expected_revenue=round(expected, 2),
        collected=round(collected, 2),
        outstanding=round(expected - collected, 2),
        lifetime_collected=lifetime_collected,
        lifetime_expected=lifetime_expected,
        rows=rows,
    )


@router.get("", response_model=PaymentBoard)
async def payment_board(
    admin: dict = Depends(current_admin),
    month: str = Query(default_factory=lambda: today_iso()[:7]),
):
    return await _board(month)


@router.post("", response_model=PaymentRecord)
async def upsert_payment(payload: PaymentUpsert, admin: dict = Depends(current_admin)):
    _check_month(payload.month)
    if not await db.students.find_one({"id": payload.student_id}):
        raise HTTPException(status_code=404, detail="Student not found")

    student = await db.students.find_one({"id": payload.student_id})
    amount = payload.amount
    if payload.paid and amount is None:
        amount = float(student.get("monthly_amount") or DEFAULT_MONTHLY)

    updates = {
        "student_id": payload.student_id,
        "month": payload.month,
        "paid": payload.paid,
        "amount": amount if payload.paid else None,
        "method": payload.method,
        "paid_on": payload.paid_on or (today_iso() if payload.paid else None),
        "notes": payload.notes or "",
        "updated_at": datetime.now(tz=None).isoformat(),
    }
    doc = await db.payments.find_one_and_update(
        {"student_id": payload.student_id, "month": payload.month},
        {"$set": updates, "$setOnInsert": {"id": PaymentRecord(**updates).id}},
        upsert=True,
        return_document=True,
    )
    return PaymentRecord(**_clean(doc))


@router.get("/export.csv")
async def export_csv(admin: dict = Depends(current_admin), month: str = Query(...)):
    board = await _board(month)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        [
            "#", "Student", "Phone", "Year", "Branch", "Month", "Status", "Amount",
            "Method", "Paid On", "Total Fee", "Paid To Date", "Balance", "Months Paid", "Notes",
        ]
    )
    for i, r in enumerate(board.rows, start=1):
        writer.writerow(
            [
                i, r.full_name, r.phone or "", r.year or "", r.branch or "", r.month,
                "Paid" if r.paid else "Pending", r.amount or "", r.method or "", r.paid_on or "",
                r.total_fee if r.total_fee is not None else "", r.paid_to_date,
                r.balance if r.balance is not None else "", r.months_paid, r.notes,
            ]
        )
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=payments-{month}.csv"},
    )


@router.get("/export.pdf")
async def export_pdf(admin: dict = Depends(current_admin), month: str = Query(...)):
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_RIGHT
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    board = await _board(month)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("t", parent=styles["Title"], fontSize=16, textColor=colors.HexColor("#0B2545"))
    meta = ParagraphStyle("m", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor("#475569"))
    right = ParagraphStyle("r", parent=meta, alignment=TA_RIGHT)

    body = [
        ["#", "Student", "Phone", "Year / Branch", "Status", "Amount", "Method", "Paid On", "Paid To Date", "Balance"]
    ]
    for i, r in enumerate(board.rows, start=1):
        body.append(
            [
                str(i),
                r.full_name,
                r.phone or "—",
                " / ".join(x for x in [r.year, r.branch] if x) or "—",
                "Paid" if r.paid else "Pending",
                f"Rs {r.amount:,.0f}" if r.amount else "—",
                r.method or "—",
                r.paid_on or "—",
                f"Rs {r.paid_to_date:,.0f}",
                f"Rs {r.balance:,.0f}" if r.balance is not None else "—",
            ]
        )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=landscape(A4),
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=10 * mm,
        bottomMargin=10 * mm,
        title=f"SkilVantage Payments {month}",
    )
    table = Table(body, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B2545")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ALIGN", (4, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    doc.build(
        [
            Paragraph("SkilVantage — Payment Report", title_style),
            Spacer(1, 3 * mm),
            Paragraph(
                f"Month: <b>{month}</b> &nbsp;·&nbsp; Students: <b>{board.total_students}</b> &nbsp;·&nbsp; "
                f"Paid: <b>{board.paid_count}</b> ({board.paid_percentage}%) &nbsp;·&nbsp; "
                f"Pending: <b>{board.pending_count}</b>",
                meta,
            ),
            Spacer(1, 1.5 * mm),
            Paragraph(
                f"Expected: <b>Rs {board.expected_revenue:,.0f}</b> &nbsp;·&nbsp; "
                f"Collected: <b>Rs {board.collected:,.0f}</b> &nbsp;·&nbsp; "
                f"Outstanding: <b>Rs {board.outstanding:,.0f}</b> &nbsp;·&nbsp; "
                f"Lifetime collected: <b>Rs {board.lifetime_collected:,.0f}</b>",
                meta,
            ),
            Spacer(1, 4 * mm),
            table,
            Spacer(1, 4 * mm),
            Paragraph(f"Generated {today_iso()} · SkilVantage", right),
        ]
    )
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=payments-{month}.pdf"},
    )

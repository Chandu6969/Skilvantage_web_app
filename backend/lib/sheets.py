"""Best-effort Google Sheets mirror for SkilVantage leads.

Service-account auth. Every function here is safe to call even when Sheets is not configured:
it logs and returns a status instead of raising, so a registration never fails because of Sheets.
"""

import asyncio
import base64
import json
import logging
import os
from datetime import datetime
from typing import Any, Optional

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

STUDENT_TAB = "Student Registrations"
PROFESSIONAL_TAB = "Professional Registrations"
ENQUIRY_TAB = "Course Enquiries"
FOLLOWUP_TAB = "Follow-ups"
COURSE_TAB = "Course List"

# (header, registration field) — order defines the column order in the sheet.
STUDENT_COLUMNS: list[tuple[str, str]] = [
    ("Registration ID", "registration_id"),
    ("Date", "created_at"),
    ("Name", "full_name"),
    ("Gender", "gender"),
    ("Phone", "phone"),
    ("Email", "email"),
    ("City", "city"),
    ("State", "state"),
    ("College", "college"),
    ("Degree", "degree"),
    ("Branch", "branch"),
    ("Passed Out Year", "passed_out_year"),
    ("Skills", "skills"),
    ("Programming Languages", "programming_languages"),
    ("Projects", "projects"),
    ("Certifications", "certifications"),
    ("Selected Course", "program"),
    ("Expected Package", "expected_package"),
    ("Preferred Role", "preferred_role"),
    ("Internship/Job", "looking_for"),
    ("Learning Mode", "learning_mode"),
    ("Availability", "availability"),
    ("Source", "source"),
    ("Resume", "resume_filename"),
    ("Status", "status"),
    ("Counsellor Notes", "notes"),
    ("Follow-up Date", "follow_up_date"),
]

PROFESSIONAL_COLUMNS: list[tuple[str, str]] = [
    ("Registration ID", "registration_id"),
    ("Date", "created_at"),
    ("Name", "full_name"),
    ("Phone", "phone"),
    ("Email", "email"),
    ("City", "city"),
    ("State", "state"),
    ("Current Company", "current_company"),
    ("Current Role", "current_role"),
    ("Experience", "experience_years"),
    ("Industry", "industry"),
    ("Current Skills", "skills"),
    ("Selected Course", "program"),
    ("Target Role", "target_role"),
    ("Career Change Reason", "career_change_reason"),
    ("Current Package", "current_package"),
    ("Expected Package", "expected_package"),
    ("Notice Period", "notice_period"),
    ("Learning Mode", "learning_mode"),
    ("Batch Timing", "batch_timing"),
    ("LinkedIn", "linkedin"),
    ("GitHub", "github"),
    ("Resume", "resume_filename"),
    ("Status", "status"),
    ("Counsellor Notes", "notes"),
    ("Follow-up Date", "follow_up_date"),
]

ENQUIRY_COLUMNS: list[tuple[str, str]] = [
    ("Name", "name"),
    ("Phone", "phone"),
    ("Email", "email"),
    ("Course", "program"),
    ("Learner Type", "learner_type"),
    ("Date", "created_at"),
    ("Status", "status"),
    ("Notes", "message"),
]

FOLLOWUP_COLUMNS: list[tuple[str, str]] = [
    ("Registration ID", "registration_id"),
    ("Name", "full_name"),
    ("Phone", "phone"),
    ("Course", "program"),
    ("Follow-up Date", "follow_up_date"),
    ("Counsellor", "counsellor"),
    ("Status", "status"),
    ("Notes", "notes"),
]

TAB_COLUMNS = {
    STUDENT_TAB: STUDENT_COLUMNS,
    PROFESSIONAL_TAB: PROFESSIONAL_COLUMNS,
    ENQUIRY_TAB: ENQUIRY_COLUMNS,
    FOLLOWUP_TAB: FOLLOWUP_COLUMNS,
}


def spreadsheet_id() -> str:
    return os.environ.get("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()


def _raw_credentials() -> str:
    return os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()


def _load_service_account_info() -> Optional[dict]:
    """Accepts either raw single-line JSON or a base64-encoded JSON blob."""
    raw = _raw_credentials()
    if not raw:
        return None
    try:
        if raw.startswith("{"):
            return json.loads(raw)
        return json.loads(base64.b64decode(raw).decode())
    except Exception as exc:
        logger.error("sheets: GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON/base64: %s", exc)
        return None


def is_configured() -> bool:
    return bool(spreadsheet_id()) and _load_service_account_info() is not None


def service_account_email() -> Optional[str]:
    info = _load_service_account_info()
    return info.get("client_email") if info else None


def _build_service():
    from google.oauth2 import service_account  # imported lazily so an unset env never breaks boot
    from googleapiclient.discovery import build

    info = _load_service_account_info()
    if info is None:
        raise RuntimeError("Google service account credentials are not configured")
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def _fmt(value: Any) -> str:
    if value is None or value is False:
        return ""
    if value is True:
        return "Yes"
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M")
    return str(value)


def _row(doc: dict, columns: list[tuple[str, str]]) -> list[str]:
    return [_fmt(doc.get(field)) for _, field in columns]


def _ensure_tab_sync(service, sheet_id: str, tab: str, headers: list[str]) -> None:
    meta = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
    existing = {s["properties"]["title"] for s in meta.get("sheets", [])}
    if tab in existing:
        return
    service.spreadsheets().batchUpdate(
        spreadsheetId=sheet_id,
        body={"requests": [{"addSheet": {"properties": {"title": tab}}}]},
    ).execute()
    service.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=f"'{tab}'!A1",
        valueInputOption="RAW",
        body={"values": [headers]},
    ).execute()


def _append_rows_sync(tab: str, rows: list[list[str]]) -> None:
    sheet_id = spreadsheet_id()
    service = _build_service()
    columns = TAB_COLUMNS[tab]
    _ensure_tab_sync(service, sheet_id, tab, [h for h, _ in columns])
    service.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range=f"'{tab}'!A1",
        valueInputOption="RAW",
        insertDataOption="INSERT_ROWS",
        body={"values": rows},
    ).execute()


async def append_rows(tab: str, docs: list[dict]) -> dict:
    """Append documents to a tab. Never raises — returns a status dict."""
    if not docs:
        return {"ok": True, "synced": 0, "detail": "nothing to sync"}
    if not is_configured():
        return {"ok": False, "synced": 0, "detail": "Google Sheets is not configured"}
    columns = TAB_COLUMNS[tab]
    rows = [_row(d, columns) for d in docs]
    try:
        await asyncio.to_thread(_append_rows_sync, tab, rows)
        return {"ok": True, "synced": len(rows), "detail": f"appended to {tab}"}
    except Exception as exc:
        logger.error("sheets: append to %s failed: %s", tab, exc)
        return {"ok": False, "synced": 0, "detail": str(exc)}


def tab_for_registration(learner_type: str) -> str:
    return STUDENT_TAB if learner_type == "student" else PROFESSIONAL_TAB


async def sync_registration(doc: dict) -> dict:
    return await append_rows(tab_for_registration(doc.get("learner_type", "student")), [doc])


async def sync_enquiry(doc: dict) -> dict:
    return await append_rows(ENQUIRY_TAB, [doc])


async def sync_followup(doc: dict) -> dict:
    return await append_rows(FOLLOWUP_TAB, [doc])

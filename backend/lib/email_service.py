"""Best-effort transactional email via Resend.

Every send is guarded: when RESEND_API_KEY is unset the call is skipped and logged, so a
registration never fails because email is not configured.
"""

import asyncio
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

PROGRAM_LABELS = {
    "data-analyst": "Data Analyst",
    "data-scientist": "Data Scientist",
    "ai-ml": "AI / ML Engineer",
    "generative-ai": "Generative AI",
    "agentic-ai": "Agentic AI",
}


def api_key() -> str:
    return os.environ.get("RESEND_API_KEY", "").strip()


def sender() -> str:
    return os.environ.get("SENDER_EMAIL", "onboarding@resend.dev").strip()


def admin_notify_address() -> str:
    return os.environ.get("ADMIN_NOTIFY_EMAIL", "").strip()


def is_configured() -> bool:
    return bool(api_key())


def _send_sync(params: dict) -> dict:
    import resend

    resend.api_key = api_key()
    return resend.Emails.send(params)


async def send_email(to: str, subject: str, html: str) -> dict:
    if not is_configured():
        return {"ok": False, "detail": "RESEND_API_KEY is not configured"}
    try:
        res = await asyncio.to_thread(
            _send_sync, {"from": sender(), "to": [to], "subject": subject, "html": html}
        )
        return {"ok": True, "id": (res or {}).get("id")}
    except Exception as exc:
        logger.error("email: send to %s failed: %s", to, exc)
        return {"ok": False, "detail": str(exc)}


def _shell(body: str) -> str:
    return f"""<table width="100%" cellpadding="0" cellspacing="0" style="background:#070B14;padding:28px 0;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111C35;border:1px solid #23355A;border-radius:12px;padding:32px;">
      <tr><td style="color:#38BDF8;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding-bottom:8px;">SkilVantage</td></tr>
      {body}
      <tr><td style="color:#64748B;font-size:11px;padding-top:24px;border-top:1px solid #1E293B;">
        SkilVantage · Job-readiness focused training. We do not make placement guarantees.
      </td></tr>
    </table>
  </td></tr>
</table>"""


def registration_html(doc: dict) -> str:
    program = PROGRAM_LABELS.get(doc.get("program", ""), doc.get("program", ""))
    learner = "Working Professional" if doc.get("learner_type") == "professional" else "Student / Fresher"
    rows = "".join(
        f"""<tr>
          <td style="color:#94A3B8;font-size:13px;padding:6px 12px 6px 0;">{label}</td>
          <td style="color:#F1F5F9;font-size:13px;font-weight:bold;padding:6px 0;">{value}</td>
        </tr>"""
        for label, value in [
            ("Registration ID", doc.get("registration_id", "")),
            ("Program", program),
            ("Learner Type", learner),
        ]
    )
    steps = "".join(
        f'<li style="color:#CBD5E1;font-size:13px;padding-bottom:6px;">{s}</li>'
        for s in [
            "Our career team reviews your details.",
            "A career advisor calls or emails you, usually within two working days.",
            "We map your background to the right track and batch.",
            "You get your learning plan and start building.",
        ]
    )
    body = f"""
      <tr><td style="color:#FFFFFF;font-size:22px;font-weight:bold;padding-bottom:12px;">Welcome to SkilVantage!</td></tr>
      <tr><td style="color:#CBD5E1;font-size:14px;line-height:22px;padding-bottom:20px;">
        Hi {doc.get("full_name", "there")}, thank you for taking the first step toward becoming job
        ready. Our career team will review your details and contact you shortly.
      </td></tr>
      <tr><td style="padding-bottom:20px;"><table cellpadding="0" cellspacing="0">{rows}</table></td></tr>
      <tr><td style="color:#38BDF8;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Next steps</td></tr>
      <tr><td style="padding-bottom:8px;"><ul style="margin:0;padding-left:18px;">{steps}</ul></td></tr>
    """
    return _shell(body)


def admin_alert_html(doc: dict) -> str:
    program = PROGRAM_LABELS.get(doc.get("program", ""), doc.get("program", ""))
    fields = [
        ("Registration ID", doc.get("registration_id")),
        ("Name", doc.get("full_name")),
        ("Email", doc.get("email")),
        ("Phone", doc.get("phone")),
        ("Program", program),
        ("Learner type", doc.get("learner_type")),
        ("City", doc.get("city")),
    ]
    rows = "".join(
        f"""<tr><td style="color:#94A3B8;font-size:13px;padding:5px 12px 5px 0;">{k}</td>
        <td style="color:#F1F5F9;font-size:13px;padding:5px 0;">{v or "—"}</td></tr>"""
        for k, v in fields
    )
    body = f"""
      <tr><td style="color:#FFFFFF;font-size:20px;font-weight:bold;padding-bottom:16px;">New registration</td></tr>
      <tr><td><table cellpadding="0" cellspacing="0">{rows}</table></td></tr>
    """
    return _shell(body)


async def send_registration_confirmation(doc: dict) -> dict:
    result = await send_email(
        doc["email"],
        f"Welcome to SkilVantage — {doc.get('registration_id', '')}",
        registration_html(doc),
    )
    admin_to: Optional[str] = admin_notify_address() or None
    if admin_to:
        await send_email(admin_to, f"New SkilVantage lead: {doc.get('full_name')}", admin_alert_html(doc))
    return result

"""Pydantic v2 models for SkilVantage leads. Mirrored by TS interfaces in frontend/src/lib/types.ts."""

import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

LearnerType = Literal["student", "professional"]

PROGRAM_SLUGS = [
    "data-analyst",
    "data-scientist",
    "ai-ml",
    "generative-ai",
    "agentic-ai",
]

LEAD_STATUSES = [
    "New",
    "Contacted",
    "Counselling Scheduled",
    "Interested",
    "Registered",
    "Training Started",
    "Completed",
    "Not Interested",
    "Follow-up Required",
]


def _now() -> datetime:
    return datetime.now(timezone.utc)


class RegistrationCreate(BaseModel):
    learner_type: LearnerType
    program: str
    # Personal
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=20)
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    # Academic (student)
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    passed_out_year: Optional[str] = None
    current_year_of_study: Optional[str] = None
    # Technical
    skills: Optional[str] = None
    programming_languages: Optional[str] = None
    tools_known: Optional[str] = None
    projects: Optional[str] = None
    certifications: Optional[str] = None
    # Career (student)
    preferred_track: Optional[str] = None
    expected_package: Optional[str] = None
    preferred_role: Optional[str] = None
    looking_for: Optional[str] = None
    availability: Optional[str] = None
    source: Optional[str] = None
    # Professional
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    experience_years: Optional[str] = None
    industry: Optional[str] = None
    previous_experience: Optional[str] = None
    target_role: Optional[str] = None
    career_change_reason: Optional[str] = None
    current_package: Optional[str] = None
    notice_period: Optional[str] = None
    batch_timing: Optional[str] = None
    # Shared
    learning_mode: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    resume_file_id: Optional[str] = None
    resume_filename: Optional[str] = None
    consent: bool = False


class Registration(RegistrationCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    registration_id: str
    created_at: datetime = Field(default_factory=_now)
    status: str = "New"
    notes: str = ""
    follow_up_date: Optional[str] = None


class RegistrationResult(BaseModel):
    registration_id: str
    learner_type: LearnerType
    program: str
    full_name: str


class RegistrationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[str] = None


class EnquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=20)
    program: Optional[str] = None
    learner_type: Optional[str] = None
    message: Optional[str] = None


class Enquiry(EnquiryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=_now)
    status: str = "New"


class UploadResult(BaseModel):
    file_id: str
    filename: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminUser(BaseModel):
    email: str
    name: str
    role: str


class CountItem(BaseModel):
    key: str
    label: str
    count: int


class IntegrationStatus(BaseModel):
    sheets_configured: bool
    sheets_account_email: Optional[str] = None
    sheets_spreadsheet_id: Optional[str] = None
    email_configured: bool
    email_sender: Optional[str] = None


class SyncResult(BaseModel):
    ok: bool
    synced: int
    detail: str


class AdminStats(BaseModel):
    total_leads: int
    student_leads: int
    professional_leads: int
    new_leads: int
    follow_ups_pending: int
    converted: int
    conversion_rate: float
    enquiries: int
    by_program: list[CountItem]
    by_status: list[CountItem]
    by_day: list[CountItem]

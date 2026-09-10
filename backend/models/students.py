"""Students, attendance and payment models. Mirrored in frontend/src/lib/types.ts."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

# Codes match the user's attendance register.
ATTENDANCE_CODES = ["P", "A", "L", "LT", "H", "NC", "T"]
ATTENDANCE_LABELS = {
    "P": "Present",
    "A": "Absent",
    "L": "Leave",
    "LT": "Late",
    "H": "Holiday",
    "NC": "No Class",
    "T": "Task",
}
# Codes that count as "attended" for the attendance percentage.
PRESENT_CODES = {"P", "LT", "T"}
# Codes excluded from the working-day denominator.
NON_WORKING_CODES = {"H", "NC"}

PAYMENT_AMOUNTS = [999, 1249]
YEAR_OPTIONS = [
    "1st Year B.Tech",
    "2nd Year B.Tech",
    "3rd Year B.Tech",
    "4th Year B.Tech",
    "Already Graduated",
    "Working Professional",
]
BRANCH_OPTIONS = [
    "Data Science",
    "AI/ML",
    "CSE",
    "CSE (Cyber Security)",
    "IT",
    "ECE",
    "EEE",
    "Mechanical",
    "Civil",
    "Other",
]


def _now() -> datetime:
    return datetime.now(timezone.utc)


class StudentCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: Optional[str] = None
    email: Optional[str] = None
    year: Optional[str] = None
    branch: Optional[str] = None
    program: Optional[str] = None
    total_fee: Optional[float] = Field(default=None, ge=0)
    monthly_amount: Optional[float] = Field(default=None, ge=0)
    active: bool = True
    notes: str = ""


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    year: Optional[str] = None
    branch: Optional[str] = None
    program: Optional[str] = None
    total_fee: Optional[float] = Field(default=None, ge=0)
    monthly_amount: Optional[float] = Field(default=None, ge=0)
    active: Optional[bool] = None
    notes: Optional[str] = None


class Student(StudentCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=_now)
    registration_id: Optional[str] = None


class AttendanceMark(BaseModel):
    student_id: str
    code: str


class AttendanceSaveRequest(BaseModel):
    date: str  # YYYY-MM-DD
    marks: list[AttendanceMark] = Field(min_length=1)


class AttendanceCell(BaseModel):
    student_id: str
    full_name: str
    year: Optional[str] = None
    branch: Optional[str] = None
    phone: Optional[str] = None
    code: Optional[str] = None


class AttendanceDay(BaseModel):
    date: str
    is_today: bool
    marked: int
    total: int
    rows: list[AttendanceCell]
    holiday_name: Optional[str] = None
    holiday_code: Optional[str] = None


class AttendanceStudentSummary(BaseModel):
    student_id: str
    full_name: str
    year: Optional[str] = None
    branch: Optional[str] = None
    counts: dict[str, int]
    working_days: int
    attended: int
    percentage: float
    by_date: dict[str, str]


class AttendanceRangeSummary(BaseModel):
    date_from: str
    date_to: str
    dates: list[str]
    students: list[AttendanceStudentSummary]
    overall_percentage: float


class HolidayCreate(BaseModel):
    date: str  # YYYY-MM-DD
    name: str = Field(min_length=1, max_length=120)
    code: str = "H"  # H = Holiday, NC = No Class


class Holiday(HolidayCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=_now)


class SundayFillRequest(BaseModel):
    month: str  # YYYY-MM
    name: str = "Sunday"


class HolidayBulkResult(BaseModel):
    created: int
    skipped: int
    holidays: list[Holiday]


class AttendanceHistoryItem(BaseModel):
    date: str
    code: str
    label: str
    auto: bool = False


class PaymentLedgerItem(BaseModel):
    month: str
    paid: bool
    amount: Optional[float] = None
    method: Optional[str] = None
    paid_on: Optional[str] = None
    notes: str = ""


class StudentDetail(BaseModel):
    student: "Student"
    counts: dict[str, int]
    working_days: int
    attended: int
    percentage: float
    history: list[AttendanceHistoryItem]
    ledger: list[PaymentLedgerItem]
    months_paid: int
    paid_to_date: float
    balance: Optional[float] = None
    monthly_amount: float


class PaymentUpsert(BaseModel):
    student_id: str
    month: str  # YYYY-MM
    paid: bool = False
    amount: Optional[float] = Field(default=None, ge=0)
    method: Optional[str] = None
    paid_on: Optional[str] = None
    notes: Optional[str] = None


class PaymentRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    month: str
    paid: bool = False
    amount: Optional[float] = None
    method: Optional[str] = None
    paid_on: Optional[str] = None
    notes: str = ""
    updated_at: datetime = Field(default_factory=_now)


class PaymentRow(BaseModel):
    student_id: str
    full_name: str
    phone: Optional[str] = None
    year: Optional[str] = None
    branch: Optional[str] = None
    month: str
    paid: bool
    amount: Optional[float] = None
    method: Optional[str] = None
    paid_on: Optional[str] = None
    notes: str = ""
    total_fee: Optional[float] = None
    paid_to_date: float = 0.0
    balance: Optional[float] = None
    months_paid: int = 0


class PaymentBoard(BaseModel):
    month: str
    total_students: int
    paid_count: int
    pending_count: int
    paid_percentage: float
    expected_revenue: float
    collected: float
    outstanding: float
    lifetime_collected: float
    lifetime_expected: float
    rows: list[PaymentRow]

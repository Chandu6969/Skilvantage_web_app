// TS mirrors of backend/models/leads.py — keep both sides in sync in the same edit.

export type LearnerType = "student" | "professional";

export interface RegistrationCreate {
  learner_type: LearnerType;
  program: string;
  full_name: string;
  email: string;
  phone: string;
  gender?: string | null;
  city?: string | null;
  state?: string | null;
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  passed_out_year?: string | null;
  current_year_of_study?: string | null;
  skills?: string | null;
  programming_languages?: string | null;
  tools_known?: string | null;
  projects?: string | null;
  certifications?: string | null;
  preferred_track?: string | null;
  expected_package?: string | null;
  preferred_role?: string | null;
  looking_for?: string | null;
  availability?: string | null;
  source?: string | null;
  current_company?: string | null;
  current_role?: string | null;
  experience_years?: string | null;
  industry?: string | null;
  previous_experience?: string | null;
  target_role?: string | null;
  career_change_reason?: string | null;
  current_package?: string | null;
  notice_period?: string | null;
  batch_timing?: string | null;
  learning_mode?: string | null;
  linkedin?: string | null;
  github?: string | null;
  resume_file_id?: string | null;
  resume_filename?: string | null;
  consent: boolean;
}

export interface Registration extends RegistrationCreate {
  id: string;
  registration_id: string;
  created_at: string;
  status: string;
  notes: string;
  follow_up_date?: string | null;
}

export interface RegistrationResult {
  registration_id: string;
  learner_type: LearnerType;
  program: string;
  full_name: string;
}

export interface RegistrationUpdate {
  status?: string;
  notes?: string;
  follow_up_date?: string;
}

export interface EnquiryCreate {
  name: string;
  email: string;
  phone: string;
  program?: string | null;
  learner_type?: string | null;
  message?: string | null;
}

export interface Enquiry extends EnquiryCreate {
  id: string;
  created_at: string;
  status: string;
}

export interface UploadResult {
  file_id: string;
  filename: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export interface CountItem {
  key: string;
  label: string;
  count: number;
}

export interface IntegrationStatus {
  sheets_configured: boolean;
  sheets_account_email?: string | null;
  sheets_spreadsheet_id?: string | null;
  email_configured: boolean;
  email_sender?: string | null;
}

export interface SyncResult {
  ok: boolean;
  synced: number;
  detail: string;
}

export interface Batch {
  id: string;
  name: string;
  program: string;
  mode: string;
  timing: string;
  start_date: string;
  capacity: number;
  status: string;
  created_at: string;
  enrolled: number;
}

export interface BatchCreate {
  name: string;
  program: string;
  mode: string;
  timing: string;
  start_date: string;
  capacity: number;
  status: string;
}

export interface BatchMember {
  registration_id: string;
  full_name: string;
  email: string;
  phone: string;
  learner_type: string;
  status: string;
}

export interface FollowUpItem {
  registration_id: string;
  full_name: string;
  phone: string;
  email: string;
  program: string;
  learner_type: string;
  status: string;
  follow_up_date: string;
  notes: string;
  bucket: string;
}

export interface FollowUpBoard {
  today: FollowUpItem[];
  overdue: FollowUpItem[];
  upcoming: FollowUpItem[];
  unscheduled: number;
}

export const BATCH_MODES = ["Online", "Offline", "Hybrid"];
export const BATCH_STATUSES = ["Planned", "Enrolling", "Running", "Completed", "Cancelled"];

export const ATTENDANCE_CODES = ["P", "A", "L", "LT", "H", "NC", "T"] as const;

export const ATTENDANCE_LABELS: Record<string, string> = {
  P: "Present",
  A: "Absent",
  L: "Leave",
  LT: "Late",
  H: "Holiday",
  NC: "No Class",
  T: "Task",
};

export const PAYMENT_AMOUNTS = [999, 1249];

export const YEAR_OPTIONS = [
  "1st Year B.Tech",
  "2nd Year B.Tech",
  "3rd Year B.Tech",
  "4th Year B.Tech",
  "Already Graduated",
  "Working Professional",
];

export const BRANCH_OPTIONS = [
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
];

export type RosterType = "student" | "professional";

export interface Student {
  id: string;
  full_name: string;
  learner_type: RosterType;
  phone?: string | null;
  email?: string | null;
  year?: string | null;
  branch?: string | null;
  program?: string | null;
  company?: string | null;
  current_role?: string | null;
  experience_years?: string | null;
  target_role?: string | null;
  notice_period?: string | null;
  current_package?: string | null;
  total_fee?: number | null;
  monthly_amount?: number | null;
  active: boolean;
  notes: string;
  created_at: string;
  registration_id?: string | null;
}

export interface StudentCreate {
  full_name: string;
  learner_type: RosterType;
  phone?: string | null;
  email?: string | null;
  year?: string | null;
  branch?: string | null;
  company?: string | null;
  current_role?: string | null;
  experience_years?: string | null;
  target_role?: string | null;
  notice_period?: string | null;
  current_package?: string | null;
  total_fee?: number | null;
  monthly_amount?: number | null;
  active?: boolean;
  notes?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  code: string;
  created_at: string;
}

export interface HolidayBulkResult {
  created: number;
  skipped: number;
  holidays: Holiday[];
}

export interface AttendanceHistoryItem {
  date: string;
  code: string;
  label: string;
  auto: boolean;
}

export interface PaymentLedgerItem {
  month: string;
  paid: boolean;
  amount?: number | null;
  method?: string | null;
  paid_on?: string | null;
  notes: string;
}

export interface StudentDetail {
  student: Student;
  counts: Record<string, number>;
  working_days: number;
  attended: number;
  percentage: number;
  history: AttendanceHistoryItem[];
  ledger: PaymentLedgerItem[];
  months_paid: number;
  paid_to_date: number;
  balance?: number | null;
  monthly_amount: number;
}

export interface AttendanceCell {
  student_id: string;
  full_name: string;
  year?: string | null;
  branch?: string | null;
  phone?: string | null;
  code?: string | null;
}

export interface AttendanceDay {
  date: string;
  is_today: boolean;
  marked: number;
  total: number;
  rows: AttendanceCell[];
  holiday_name?: string | null;
  holiday_code?: string | null;
}

export interface AttendanceStudentSummary {
  student_id: string;
  full_name: string;
  year?: string | null;
  branch?: string | null;
  counts: Record<string, number>;
  working_days: number;
  attended: number;
  percentage: number;
  by_date: Record<string, string>;
}

export interface AttendanceRangeSummary {
  date_from: string;
  date_to: string;
  dates: string[];
  students: AttendanceStudentSummary[];
  overall_percentage: number;
}

export interface PaymentRow {
  student_id: string;
  full_name: string;
  phone?: string | null;
  year?: string | null;
  branch?: string | null;
  month: string;
  paid: boolean;
  amount?: number | null;
  method?: string | null;
  paid_on?: string | null;
  notes: string;
  total_fee?: number | null;
  paid_to_date: number;
  balance?: number | null;
  months_paid: number;
}

export interface PaymentBoard {
  month: string;
  total_students: number;
  paid_count: number;
  pending_count: number;
  paid_percentage: number;
  expected_revenue: number;
  collected: number;
  outstanding: number;
  lifetime_collected: number;
  lifetime_expected: number;
  rows: PaymentRow[];
}

export interface AdminStats {
  total_leads: number;
  student_leads: number;
  professional_leads: number;
  new_leads: number;
  follow_ups_pending: number;
  converted: number;
  conversion_rate: number;
  enquiries: number;
  by_program: CountItem[];
  by_status: CountItem[];
  by_day: CountItem[];
}

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Counselling Scheduled",
  "Interested",
  "Registered",
  "Training Started",
  "Completed",
  "Not Interested",
  "Follow-up Required",
];

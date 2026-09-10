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

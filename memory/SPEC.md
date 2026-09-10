# SkilVantage — Living Spec

## What the app does
Career-training website + lead-management platform for SkilVantage. Marketing site for 5 career
programs (Data Analyst, Data Scientist, AI/ML, Generative AI, Agentic AI), a multi-step
registration wizard for two learner types, and a password-protected admin dashboard for lead
management.

## Stack
FastAPI + MongoDB (motor) behind Vite + React 19 + TS. All routes on `api_router` under `/api`.
Frontend calls relative `/api` paths through `src/lib/api.ts`.

## Data model (MongoDB, string uuid `id`)
- `registrations` — one doc per registration. `registration_id` (SVS/SVP + yy + 5 digits, unique),
  `learner_type` ("student" | "professional"), `program` (slug), personal/academic/technical/career
  fields (most optional), `status`, `notes`, `follow_up_date`, `created_at`, `resume_file_id`.
- `enquiries` — contact-page form submissions.
- `admin_users` — email, name, role, pbkdf2 `password_hash`.
- `admin_sessions` — token + email + `expires_at` (TTL index).
- `resumes` — file_id, filename, stored_name (files in `backend/uploads/`).

Models: `backend/models/leads.py` ↔ TS mirrors in `frontend/src/lib/types.ts`.

## Key API routes
Public: `POST /api/registrations`, `POST /api/enquiries`, `POST /api/uploads/resume` (multipart).
Admin (cookie-gated): `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`,
`GET /api/admin/stats`, `GET /api/admin/registrations` (q/program/learner_type/status filters),
`PATCH /api/admin/registrations/{registration_id}`, `GET /api/admin/enquiries`,
`GET /api/admin/export` (CSV), `GET /api/admin/resumes/{file_id}`,
`GET /api/admin/follow-ups`, `GET /api/admin/integrations`, `POST /api/admin/sheets/resync`.
Batches (cookie-gated): `GET|POST /api/admin/batches`, `PATCH|DELETE /api/admin/batches/{id}`,
`GET /api/admin/batches/{id}/members`, `POST /api/admin/batches/{id}/assign`,
`POST /api/admin/batches/{id}/unassign`.

## Integrations (both best-effort, never block a registration)
- **Google Sheets** (`backend/lib/sheets.py`): service-account auth, appends each new registration
  to "Student Registrations"/"Professional Registrations" and each enquiry to "Course Enquiries";
  creates a missing tab with its header row. Env: `GOOGLE_SERVICE_ACCOUNT_JSON` (single-line JSON
  or base64) + `GOOGLE_SHEETS_SPREADSHEET_ID`. Unset → sync is skipped and the admin panel shows
  "Not configured". `POST /api/admin/sheets/resync` backfills everything.
- **Resend email** (`backend/lib/email_service.py`): registration-confirmation email with the
  Registration ID + next steps, plus an optional internal alert to `ADMIN_NOTIFY_EMAIL`.
  Env: `RESEND_API_KEY`, `SENDER_EMAIL`. Unset → skipped and logged.
Both run as FastAPI `BackgroundTasks` after the 201 response.

## Batches
`batches` collection: name, program, mode (Online/Offline/Hybrid), timing, start_date (YYYY-MM-DD),
capacity, status (Planned/Enrolling/Running/Completed/Cancelled). Assignment writes `batch_id` onto
the registration; `enrolled` is computed by counting registrations per batch, and assignment is
rejected with 400 when it would exceed capacity.

## Follow-up worklist
`GET /api/admin/follow-ups` buckets leads by `follow_up_date` into overdue / today / upcoming
(server-anchored UTC date) and counts leads with no date set. Leads with status
"Not Interested"/"Completed" are excluded. "Mark Contacted" in the UI sets status=Contacted and
clears `follow_up_date`, which removes the lead from the worklist.

## Auth
Admin only. httpOnly cookie `sv_session` set on login, backed by `admin_sessions`. No tokens in
JSON, no localStorage. Every `/api/admin/*` route depends on `current_admin`.

## Key flows
1. Home → Programs → Program detail → Roadmaps → Projects → Job Ready → Register.
2. Register: step 0 learner type as a **radio group** (Student / Fresher vs Working Professional)
   with an explicit "Continue" button → step 1 program → step 2 long form (branches by learner
   type: student gets academic fields, professional gets company/experience/transition fields;
   submit label differs) → POST → redirect to `/registration-success` with the registration id in
   query params. `?program=<slug>` on `/register` still shows the learner-type radios first, then
   skips the program step and goes straight to the form.
3. Admin: `/admin` shows login if `GET /api/admin/me` 401s, else the dashboard (stat cards,
   recharts bar + line charts, filterable table, lead dialog with status/notes/follow-up + resume
   download + CSV export).

## Seed facts (`cd /app/backend && python seed.py`, idempotent)
- Admin: admin@skilvantage.com / SkilVantage@2025
- 8 demo registrations, ids `SVS25DEMO00`…`SVP25DEMO07` (mixed learner types, programs, statuses).
- 1 demo enquiry from Divya Raman.

## Notes / deviations
- MongoDB is the system of record; Google Sheets is a best-effort mirror, not the source of truth.
- WhatsApp confirmation was explicitly deferred by the user; email confirmation replaces it.
- No CAPTCHA — spam protection is server-side validation (consent required, phone regex, upload
  type/size limits) only.
- Visitor/page-view analytics are NOT implemented; the admin dashboard reports registration
  analytics (totals, per-course, per-status, 14-day trend, conversion rate).

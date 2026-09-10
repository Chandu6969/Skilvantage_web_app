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
`GET /api/admin/export` (CSV), `GET /api/admin/resumes/{file_id}`.

## Auth
Admin only. httpOnly cookie `sv_session` set on login, backed by `admin_sessions`. No tokens in
JSON, no localStorage. Every `/api/admin/*` route depends on `current_admin`.

## Key flows
1. Home → Programs → Program detail → Roadmaps → Projects → Job Ready → Register.
2. Register: step 0 learner type → step 1 program → step 2 long form (branches by learner type)
   → POST → redirect to `/registration-success` with registration id in query params.
   `?program=<slug>` on `/register` skips straight to step 2.
3. Admin: `/admin` shows login if `GET /api/admin/me` 401s, else the dashboard (stat cards,
   recharts bar + line charts, filterable table, lead dialog with status/notes/follow-up + resume
   download + CSV export).

## Seed facts (`cd /app/backend && python seed.py`, idempotent)
- Admin: admin@skilvantage.com / SkilVantage@2025
- 8 demo registrations, ids `SVS25DEMO00`…`SVP25DEMO07` (mixed learner types, programs, statuses).
- 1 demo enquiry from Divya Raman.

## Notes / deviations
- Storage is MongoDB only (user chose this); the data layer is isolated in routers so a Google
  Sheets sync can be added without touching the frontend. NO Google Sheets integration exists.
- No CAPTCHA — spam protection is server-side validation (consent required, phone regex, upload
  type/size limits) only.
- Visitor/page-view analytics are NOT implemented; the admin dashboard reports registration
  analytics (totals, per-course, per-status, 14-day trend, conversion rate).

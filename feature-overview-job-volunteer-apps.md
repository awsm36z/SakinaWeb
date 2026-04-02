# Job / Volunteer Applications Feature Overview

## Goal
Create a formal application flow for people who want to work with or volunteer for Sakina Wilderness, so interest can be collected, reviewed, and managed inside the site instead of through Instagram DMs.

## Outcome
The website should support:

- A public page that explains how joining Sakina works
- A structured application form for jobs and volunteer roles
- A backend record for every application
- An admin workflow to review, update, and follow up on applicants
- Optional email confirmations and status updates

## Product Scope
This feature should support two closely related applicant types:

- `Volunteer`
- `Paid Role / Staff`

We can model them in one system first, then split later if needed.

Recommended first release:

- Public landing page: `Join Sakina`
- Public application form
- Supabase table for submissions
- Admin dashboard view for submissions
- Basic status workflow
- Optional file upload for resume
- Confirmation message after submit

## Suggested User Flow
### Applicant Flow
1. Visitor clicks `Join Sakina` from the navbar or footer.
2. They read a short overview of what Sakina looks for.
3. They choose whether they are applying to volunteer, work, or both.
4. They fill out an application form.
5. They submit the form.
6. They see a success page or confirmation state.
7. Optionally, they receive a confirmation email.

### Admin Flow
1. Admin opens a new `Applications` area in the admin dashboard.
2. Admin sees all applications with filters.
3. Admin clicks an application to review details.
4. Admin updates status, adds notes, and optionally contacts the applicant.
5. Admin can mark applications as:
   - `new`
   - `in_review`
   - `interview`
   - `accepted`
   - `rejected`
   - `archived`

## Frontend Work
### Public Pages
- Add a `Join Sakina` page, likely at `/join`
- Add a dedicated application form page, likely at `/join/apply`
- Add a confirmation page or inline success state

### Application Form Fields
Recommended first version:

- Full name
- Email
- Phone number
- City / region
- Applying for:
  - volunteer
  - staff
  - both
- Areas of interest:
  - trip support
  - logistics
  - media/photo/video
  - operations/admin
  - spiritual/community support
  - outdoor instruction
  - other
- Short bio / background
- Why do you want to join Sakina?
- Relevant experience
- Outdoor experience level
- Availability
- Social links or portfolio
- Resume upload (optional)
- Additional notes

### Admin UI
Recommended first version:

- Add an `Applications` section to the admin dashboard
- List view with:
  - applicant name
  - email
  - application type
  - submitted date
  - status
- Detail drawer/modal/page with full answers
- Status update control
- Internal admin notes

## Backend Work
### Database
Use one main table first:

`job_volunteer_applications`

Recommended columns:

```sql
id uuid primary key default gen_random_uuid(),
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
full_name text not null,
email text not null,
phone text,
region text,
application_type text not null,
areas_of_interest text[] not null default '{}',
bio text,
motivation text not null,
relevant_experience text,
outdoor_experience text,
availability text,
portfolio_url text,
social_url text,
resume_url text,
notes text,
status text not null default 'new',
admin_notes text,
reviewed_by uuid references public.profiles(id) on delete set null,
reviewed_at timestamptz
```

### Recommended Constraints
- `application_type` check:
  - `volunteer`
  - `staff`
  - `both`
- `status` check:
  - `new`
  - `in_review`
  - `interview`
  - `accepted`
  - `rejected`
  - `archived`

### Storage
If resume upload is included:

- Create a Supabase storage bucket such as `applications`
- Store resume files there
- Save public or signed file path in `resume_url`

### Row Level Security
Recommended policy shape:

- Public users can `insert` applications
- Public users should not be able to read all applications
- Admins/founders can `select` and `update`
- Only admins can manage `status`, `admin_notes`, `reviewed_by`, `reviewed_at`

## API / Server Actions
Recommended server-side features:

- `createJobVolunteerApplicationAction`
- `updateApplicationStatusAction`
- `updateApplicationAdminNotesAction`

Validation should happen server-side even if the form validates in the browser.

## Email / Notifications
Nice first version:

- Confirmation email to applicant after submission
- Internal notification email to Sakina admin inbox

Later version:

- Status update email when application moves to interview / accepted / rejected

## Content / UX Decisions To Make Before Coding
We should settle these first:

1. Do we want one combined application form or separate volunteer/staff forms?
2. Do we want anonymous/public applications, or should applicants log in first?
3. Do we want resume upload in v1, or can that wait?
4. Do we want admins to leave internal notes immediately in v1?
5. Should accepted applicants later become members or staff profiles in the system?

## Recommended Build Order
### Phase 1: Schema + Submission
1. Create database table
2. Add storage bucket if resumes are included
3. Add RLS policies
4. Create the public application form
5. Save submissions to Supabase

### Phase 2: Admin Review
1. Add applications list to admin dashboard
2. Add application detail view
3. Add status controls
4. Add admin notes

### Phase 3: Notifications
1. Send applicant confirmation email
2. Send internal admin notification
3. Optionally add later status update emails

## Technical Notes For This Codebase
Based on the current app structure, this feature should probably follow these patterns:

- New route pages in `app/(site)/join/...`
- Admin management inside `app/(site)/admin/...`
- Supabase access via existing server/client helpers in `lib/supabase/...`
- Server actions for inserts and admin updates
- Styling should follow the current brand system already used in `/ui-preview`, `/badges`, profile, and trip pages

## Suggested First Deliverables
When we start coding, the first concrete deliverables should be:

1. Supabase SQL schema for `job_volunteer_applications`
2. Public `/join` page
3. Public `/join/apply` form
4. Submission action with validation
5. Admin dashboard applications panel

## Recommendation
Build this as a serious intake system from the start, even if the first version is simple. The weak version is just a contact form. The correct version is an application pipeline with statuses, notes, and review ownership.

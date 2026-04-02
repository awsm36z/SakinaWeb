# PRD: Job / Volunteer Applications

## Overview
Sakina Wilderness needs a formal recruiting flow for people who want to contribute to the organization. Today, interest is handled informally through channels like Instagram DMs. This feature creates a structured application process on the website for both volunteer and paid-role candidates.

The product should help Sakina:

- attract aligned applicants
- collect consistent information
- review submissions in one place
- track application status over time
- reduce reliance on informal messaging

## Problem
Potential applicants currently have no formal path to express interest in joining Sakina. This creates several issues:

- applications arrive in inconsistent formats
- important information is missing or hard to compare
- follow-up is manual and fragmented
- admin review is not centralized
- serious candidates may hesitate without a clear process

## Goal
Provide a clean, credible, on-brand application flow that allows people to apply to Sakina for volunteer and staff opportunities and allows admins to review and manage those applications from the website.

## Non-Goals
This first version does not need to include:

- a full ATS or recruiting CRM
- automated interview scheduling
- applicant self-service dashboards
- advanced search/scoring/ranking
- role-specific multi-step forms
- staff onboarding after acceptance

## Success Criteria
This feature is successful if:

- applicants can submit a complete application without contacting Sakina directly
- admins can review applications in the admin dashboard
- admins can change application status and leave internal notes
- submissions are stored cleanly in Supabase
- the feature feels consistent with the current Sakina site design

Launch-ready success criteria:

- a valid application can be submitted end-to-end from the public site with no manual backend intervention
- required fields are enforced consistently on both frontend and backend
- every submission appears in the admin dashboard within one refresh cycle
- admins can review, update status, and save notes without using Supabase directly
- the form is usable on mobile and desktop
- launch scope is complete without email notifications, unless they are explicitly pulled into phase 1

## Users
### Primary Users
- prospective volunteers
- prospective paid staff or contributors
- Sakina admins/founders reviewing candidates

### Secondary Users
- future trip leads or coordinators who may help review applicants later

## User Stories
### Applicant Stories
- As a potential volunteer, I want to understand how I can help Sakina so I know whether I should apply.
- As a potential contributor, I want a formal application process so I can present myself seriously.
- As an applicant, I want a clear form that asks for the right information without feeling overwhelming.
- As an applicant, I want confirmation after I apply so I know my submission went through.

### Admin Stories
- As an admin, I want to see all incoming applications in one place.
- As an admin, I want to quickly understand what type of applicant someone is.
- As an admin, I want to update application status so I can track progress.
- As an admin, I want to write internal notes so review does not live in DMs.

## Product Scope
### Public Experience
- `Join Sakina` landing page
- application form page
- confirmation / success state after submission

### Admin Experience
- applications list in admin dashboard
- application detail view
- application status updates
- internal notes

### Data / Backend
- Supabase table for applications
- optional Supabase storage support for resume uploads
- RLS policies for public submission and admin-only review access

### Launch Role Categories
The first version should recruit for these buckets:

- trip support
- logistics / operations
- media / storytelling
- outdoor instruction
- spiritual / community support
- general volunteer help

These categories should be used consistently in:

- join page copy
- application form areas of interest
- admin review filters

## Product Decisions
### Recommended V1 Decisions
- One combined application form
- Public submission allowed without requiring login
- Resume upload optional in v1
- Admin notes included in v1
- No applicant portal in v1
- No email notifications in phase 1 unless explicitly added
- Anti-spam protection should be basic but present in v1

### Why
One combined flow keeps the experience simple and reduces early product complexity. Public submissions reduce friction and make recruiting easier. Admin-side notes and statuses are worth doing in v1 because otherwise the feature is just a prettier contact form.

## Functional Requirements
### Public Join Page
The website must provide a public page that:

- explains the purpose of joining Sakina
- describes the types of help or roles available
- sets expectations for who should apply
- links clearly to the application form

### Public Application Form
The form must collect:

- full name
- email
- phone number
- city or region
- application type: `volunteer`, `staff`, or `both`
- areas of interest
- short bio / background
- motivation for joining Sakina
- relevant experience
- outdoor experience level
- availability
- portfolio or social link
- additional notes

Optional in v1:

- resume upload

### Field Requirements
Required fields in v1:

- full name
- email
- application type
- at least one area of interest
- motivation for joining Sakina
- availability

Optional fields in v1:

- phone number
- city or region
- short bio / background
- relevant experience
- outdoor experience level
- portfolio or social link
- additional notes
- resume upload

Validation requirements:

- email must be valid format
- portfolio/social links must be valid URLs if provided
- long text fields should have reasonable max lengths
- application type must match allowed enum values
- areas of interest must come from the approved role category list

### Form Submission
The system must:

- validate required fields
- persist submissions to Supabase
- show a success state after submission
- fail clearly if submission cannot be saved
- reject malformed or disallowed enum values server-side
- protect against obvious spam or bot submissions

### Abuse / Spam Handling
V1 must include lightweight protection:

- server-side validation
- hidden honeypot field or equivalent low-friction spam check
- optional rate-limiting layer if already practical in this stack

Out of scope for launch unless needed:

- full captcha
- advanced moderation pipeline
- duplicate-account prevention system

### Admin Applications View
Admins must be able to:

- view all applications
- sort or scan by date/status
- open an application for details
- update status
- add internal notes

V1 admin review defaults:

- default sort order: newest first
- visible columns: applicant name, email, application type, submitted date, status
- filters: status and application type
- optional search: name or email

### Admin Review Behavior
- updating status should save `reviewed_at`
- the first admin who updates an application should populate `reviewed_by`
- admins should be able to update internal notes independently of status changes
- rejected and accepted applications should remain visible unless manually archived

### Status Workflow
Applications must support these statuses:

- `new`
- `in_review`
- `interview`
- `accepted`
- `rejected`
- `archived`

## Data Requirements
### Core Table
Use a single table for v1:

`job_volunteer_applications`

The table should support:

- applicant identity fields
- structured application type
- open-form long text answers
- optional resume URL
- review status
- internal admin notes
- timestamps
- reviewer attribution

Minimum required fields in the schema:

- `id`
- `created_at`
- `updated_at`
- `full_name`
- `email`
- `phone`
- `region`
- `application_type`
- `areas_of_interest`
- `bio`
- `motivation`
- `relevant_experience`
- `outdoor_experience`
- `availability`
- `portfolio_url`
- `social_url`
- `resume_url`
- `notes`
- `status`
- `admin_notes`
- `reviewed_by`
- `reviewed_at`

Canonical enum values:

- `application_type`: `volunteer`, `staff`, `both`
- `status`: `new`, `in_review`, `interview`, `accepted`, `rejected`, `archived`

## UX Requirements
### Brand
The feature must feel aligned with the current Sakina design system:

- cream-based surfaces
- editorial typography
- restrained earthy palette
- polished, calm, intentional layout

### Form Experience
The form should feel serious but approachable:

- strong section grouping
- not too many fields visible at once without structure
- clear labels and helper text
- mobile-friendly
- confidence-building confirmation after submit

### Admin Experience
The admin view should optimize for fast triage:

- readable list layout
- visible status chips
- one-click access to detail view
- low-friction status editing

## Backend Requirements
### Supabase
Need:

- database table
- optional storage bucket for resume files
- RLS policies
- timestamp handling

### Access Rules
- public users can create applications
- public users cannot browse applications
- admins/founders can read and update applications
- only admins can change status/admin notes

Additional access expectations:

- public users should not be able to overwrite or delete submissions
- resume files, if enabled, should not be broadly listable by the public
- admin review operations should happen through the app, not direct database use

## Notifications
### V1 Recommended
- applicant confirmation message on submit

Explicitly out of phase 1 unless pulled in:

- applicant confirmation email
- internal admin email alert

### Future
- automated status update emails
- reviewer assignment notifications

## Risks
- too many required form fields could reduce submissions
- no status workflow would make review chaotic
- resume uploads add storage complexity
- public submission can increase spam risk

## Mitigations
- keep v1 form focused and structured
- include explicit status fields from the beginning
- make resume optional
- add server-side validation and consider rate limiting or captcha later

## Open Questions
These should be decided before implementation:

1. Should the public CTA say `Join Sakina`, `Work With Us`, or `Apply to Help`?
2. Should staff and volunteer applications use the same copy, or slightly different framing within the same form?
3. Do we want resume upload in v1 or phase 2?
4. Should admins receive an email for every submission immediately?
5. Should accepted applicants later be promoted into a richer internal role system?
6. Which role categories should be emphasized most heavily on the join landing page?

## Rollout Plan
### Phase 1
- schema
- public join page
- application form
- submission handling

### Phase 2
- admin dashboard application list
- application detail view
- status editing
- admin notes

### Phase 3
- email notifications
- resume uploads if deferred
- additional filters and search

## Acceptance Criteria
The feature is ready for launch when:

- a visitor can submit a valid application from the website
- the submission is stored correctly in Supabase
- an admin can view the submission in the admin dashboard
- an admin can update its status
- an admin can add internal notes
- the flow works on desktop and mobile
- the UI matches the existing Sakina visual system
- the form enforces required fields and enum values both client-side and server-side
- the admin list defaults to newest-first and supports at least status/type filtering
- the launch version works without requiring email notifications or resume upload if those are deferred

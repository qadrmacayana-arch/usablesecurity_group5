# usablesecurity_group5
deployments

## Supabase integration

The static pages now load a shared browser client from
`script/supabase-client.js`. It uses the Supabase publishable key and exposes
`window.secureAccessSupabaseReady`, which resolves to the initialized client.

The request and faculty screens use the authenticated Supabase client for
database operations. Never place a Supabase `service_role` key in browser code.
Review the Row Level Security (RLS) policies before using real student data.

The initial PostgreSQL schema is in
[supabase/schema.sql](./supabase/schema.sql). Run it in the Supabase SQL
Editor, review the policies for your institution, then create the first
administrator Auth user through a trusted administrative process. The seed
assigns the administrator role only to the fixed `admin@uni.edu.ph` account;
never grant administrator roles from the browser.

Sample resources and 11 fictional Philippine-university student profiles are prepared in
[supabase/seed.sql](./supabase/seed.sql). Create the corresponding Auth users
first, including `student_id` and `full_name` metadata, then run the seed.
The script intentionally does not create passwords or write directly to
`auth.users`.

For ready-made lessons, activities, grades, and sample requests, run
[supabase/demo-data.sql](./supabase/demo-data.sql) after `seed.sql`. It is
rerunnable and uses the seeded Auth email addresses to find the related
profiles.

For a request dashboard with pending, approved, rejected, and cancelled
examples, run [supabase/request-demo-data.sql](./supabase/request-demo-data.sql)
after `demo-data.sql`.

If the public tables are empty even though Auth users exist, run
[supabase/populate-demo-data.sql](./supabase/populate-demo-data.sql). This
single bootstrap file creates the profiles from `auth.users`, resources, four
request statuses, and an approved access grant.

Supabase Auth users cannot be created with ordinary SQL. For local testing,
the server-only [supabase/create-demo-students.mjs](./supabase/create-demo-students.mjs)
script can create the 11 student accounts with a temporary password. Set
`SUPABASE_SERVICE_ROLE_KEY` and `DEMO_USER_PASSWORD` only in the terminal
environment; never commit them or place them in browser code.

To create the additional fictional student Juan Dela Cruz, set
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DEMO_USER_PASSWORD` in the
terminal environment and run
[supabase/create-juan-demo-student.mjs](./supabase/create-juan-demo-student.mjs).
Then run `supabase/insert-demo-records.sql` in the Supabase SQL Editor to
populate or refresh the public profile. The script creates only Juan's Auth
account and does not store the password in the repository.

To reset the password for Juan's existing demo Auth account, set those same
environment variables to the new password and run
[supabase/reset-juan-demo-password.mjs](./supabase/reset-juan-demo-password.mjs).
The reset script requires a Supabase service-role key and does not write the
password to the repository.

To reset a demo teacher account, set `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `TEACHER_EMAIL` (either
`maria.santos@prof.uni.edu.ph` or `jose.reyes@prof.uni.edu.ph`), and
`DEMO_USER_PASSWORD` in PowerShell, then run
[supabase/reset-teacher-password.mjs](./supabase/reset-teacher-password.mjs).
Run it once for each teacher, using a distinct password for each account.

If `public.profiles` is empty because the Auth trigger was not active when
users were created, run
[supabase/insert-demo-records.sql](./supabase/insert-demo-records.sql). This
file creates the profiles from existing Auth users before inserting demo
records and stops with a clear error if the required Auth roles do not exist.

The schema separates accounts into `student`, `teacher`, and
`administrator` roles. A unique database index allows only one administrator.
Teacher accounts use the `name@prof.uni.edu.ph` format and can manage their
lessons, activities, and grades in the faculty workspace. Teachers can see
student profiles only when an access request, grade, or student-initiated
message links the two accounts. Direct messages are limited to active users;
teachers can contact the administrator and students connected to their
requests or gradebook, while students can contact active staff. Students can
read published learning materials and grades in the student portal, and can
address access requests to either an active teacher or the administrator; the
selected recipient can see the request, while only the administrator makes
the access decision.

The seed includes one fictional administrator and two fictional teachers:
`admin@uni.edu.ph`, `maria.santos@prof.uni.edu.ph`, and
`jose.reyes@prof.uni.edu.ph`. Create these Auth users before running the seed.
The seed assigns staff IDs `100001`, `100002`, and `100003`, respectively.

If the original schema was already run, do not run `schema.sql` again. Run
[supabase/migrate-roles-step-1.sql](./supabase/migrate-roles-step-1.sql) first
and wait for it to finish successfully. Then run
[supabase/migrate-roles.sql](./supabase/migrate-roles.sql) as step 2. The
two-step migration is required because PostgreSQL must commit a new enum value
before it can be used by another statement.

## Access request workflow

The request form stores only the fields used by the workflow:

- Authenticated requester and selected active recipient (teacher or administrator)
- Resource, requested permission, and access duration
- Normal or urgent priority
- Required justification and optional additional message
- Database-managed request number, status, submission/decision timestamps,
  reviewer, and decision reason

The requester identity comes from the signed-in profile; the form does not ask
for duplicate demographics or contact details. New requests start as pending.
Recipients can see only requests addressed to them. Teachers can review
assigned requests, but administrators alone approve or reject requests in the
Admin Console. Teachers also have a workspace for managing their own lessons
and activities, publishing student grades, and messaging connected students or
the administrator. Students can send and receive direct messages in
`student/messages.php`. An approval or rejection is performed by the
`decide_access_request` database function, which updates the request and
creates any access grant, student notification, and audit entry atomically.
Approvals are rejected if the student is inactive or does not meet the
resource's clearance requirement. An administrator must provide a decision
reason.

For databases that already ran an earlier schema version, complete any
documented role migration first, then apply
[supabase/migrate-request-workflow.sql](./supabase/migrate-request-workflow.sql)
in the Supabase SQL Editor. It adds the staff ID field and moves request
decisions behind the transactional database function. New installations get
these changes from `schema.sql`.

For databases that already have the request workflow, apply
[supabase/migrate-teacher-workspace.sql](./supabase/migrate-teacher-workspace.sql)
in the Supabase SQL Editor to enable relationship-scoped teacher access to
student profiles and secure direct messaging.

The login page uses Supabase email/password authentication directly. This
avoids exposing a public student/staff-ID-to-email lookup. Demo accounts can
use fictional institutional addresses. On localhost, students receive a
server-generated demo code in a popup after password authentication. The
server stores only its password hash, enforces a five-minute expiry, allows at
most five attempts, and consumes it after one successful use. Code issuance
has a 30-second cooldown. This is a local prototype convenience, **not email
verification or MFA**; the endpoint refuses requests on non-local hosts.
Before deployment, replace it with a real email delivery provider or Supabase
MFA and remove/disable the demo endpoint.

Student grades and the admin student directory read the shared Supabase
profiles, requests, and published grade records. Official enrollment,
semester grades, and GPA are not available because no student-information
system is connected; the portal labels those data as unavailable rather than
showing sample values.

To add Eduardo Pilepe without sending a confirmation email (useful for a
fictional demo address), set `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, and `DEMO_USER_PASSWORD` in PowerShell and run
[supabase/create-eduardo-pilepe-professor.mjs](./supabase/create-eduardo-pilepe-professor.mjs).
The script creates a confirmed Auth user through the server-only Admin API and
prints the Auth user ID. Then run
[supabase/create-eduardo-pilepe-professor.sql](./supabase/create-eduardo-pilepe-professor.sql)
in the SQL Editor to link the profile to that Auth user UUID. Keep the service
role key and password only in the terminal environment; never put them in
browser code or SQL. If you used Supabase's email-based signup/invite and hit
an email rate limit, stop retrying that flow; the Admin API script does not
send a confirmation email.

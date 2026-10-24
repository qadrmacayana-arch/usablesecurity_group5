# SecureAccess PHP Security Architecture

This version separates the portal into Student, Teacher, and Administrator
areas while keeping one shared login.

## Layers

1. Supabase Auth authenticates the user.
2. `api/create-session.php` verifies the Supabase access token server-side and creates a PHP session.
3. Student pages require the `student` PHP role guard. Students can read
   published academic content and grades, and message active staff.
4. Faculty workspace pages require the `teacher` PHP role guard. Teachers can
   manage their own academic content and grades, read requests addressed to
   them, and message the administrator or students connected to their requests
   or gradebook. They cannot make access decisions.
5. Administrator pages require the `administrator` PHP role guard.
6. Supabase PostgreSQL RLS remains the database authorization layer. Request
   decisions use the `decide_access_request` function so the status change,
   grant, notification, and audit event commit together.

Teacher access to student profiles is relationship-scoped in RLS. The
`migrate-teacher-workspace.sql` migration applies these profile and direct
message rules to existing databases; new databases receive them from
`schema.sql`.

## Important

Changing `.html` to `.php` is not itself a security control. The security control is the server-side authorization check performed before the PHP page is returned.

The browser uses only the Supabase publishable key. Never grant access by
trusting browser-provided role or requester IDs; RLS and the database decision
function validate those values against the authenticated user.

## Local development

Use a PHP-capable server. Python's `py -m http.server` does not execute PHP.

Example:

```text
php -S 127.0.0.1:8000
```

Then open:

```text
http://127.0.0.1:8000/
```

For production, enable HTTPS and change the PHP session cookie's `secure` option to `true`.

-- SecureAccess ready-made demo data
-- Run schema.sql and the role migration first, then run seed.sql.
-- Auth users must already exist because profiles reference auth.users.
-- This file is safe to run more than once.

insert into public.resources
  (code, name, category, sensitivity, minimum_clearance, description)
values
  ('RES-LIB', 'Digital Library', 'Academic', 'Standard', 1, 'Academic library resources'),
  ('RES-CSLAB', 'Computer Science Laboratory', 'Laboratory', 'Standard', 2, 'Computer science laboratory'),
  ('RES-CYBER', 'Cybersecurity Laboratory', 'Laboratory', 'Restricted', 4, 'Security research laboratory'),
  ('RES-RESEARCH', 'Research Database', 'Research', 'Restricted', 4, 'Approved research datasets'),
  ('RES-RECORDS', 'Student Records System', 'Academic', 'Restricted', 3, 'Student academic records'),
  ('RES-NOC', 'Network Operations Center', 'Infrastructure', 'Classified', 5, 'Network operations infrastructure')
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  sensitivity = excluded.sensitivity,
  minimum_clearance = excluded.minimum_clearance,
  description = excluded.description,
  active = true;

-- Published lesson for students.
insert into public.academic_content
  (id, teacher_id, content_type, title, description, content_body, status, published_at)
select
  '10000000-0000-0000-0000-000000000001',
  teacher.id,
  'lesson',
  'Introduction to Cybersecurity',
  'Core principles of confidentiality, integrity, and availability.',
  'This lesson introduces the CIA triad, common threats, and responsible security practices.',
  'published',
  now()
from public.profiles teacher
where lower(teacher.email) = 'maria.santos@prof.uni.edu.ph'
on conflict (id) do update set
  teacher_id = excluded.teacher_id,
  title = excluded.title,
  description = excluded.description,
  content_body = excluded.content_body,
  status = excluded.status,
  published_at = excluded.published_at,
  updated_at = now();

-- Draft activity that a teacher can publish later.
insert into public.academic_content
  (id, teacher_id, content_type, title, description, content_body, status)
select
  '10000000-0000-0000-0000-000000000002',
  teacher.id,
  'activity',
  'Password Security Activity',
  'Evaluate password strength and identify unsafe password habits.',
  'Submit a short explanation of three password security recommendations.',
  'draft'
from public.profiles teacher
where lower(teacher.email) = 'jose.reyes@prof.uni.edu.ph'
on conflict (id) do update set
  teacher_id = excluded.teacher_id,
  title = excluded.title,
  description = excluded.description,
  content_body = excluded.content_body,
  status = excluded.status,
  updated_at = now();

-- Published grades for three sample students.
insert into public.grades
  (id, content_id, student_id, teacher_id, score, max_score, published)
select
  grades.id,
  content.id,
  student.id,
  teacher.id,
  grades.score,
  grades.max_score,
  true
from (
  values
    ('20000000-0000-0000-0000-000000000001'::uuid, 'daniel.santos@university.edu.ph', 92::numeric, 100::numeric),
    ('20000000-0000-0000-0000-000000000002'::uuid, 'sean.reyes@university.edu.ph', 87::numeric, 100::numeric),
    ('20000000-0000-0000-0000-000000000003'::uuid, 'anne.dela-cruz@university.edu.ph', 95::numeric, 100::numeric)
) as grades(id, student_email, score, max_score)
join public.profiles teacher
  on lower(teacher.email) = 'maria.santos@prof.uni.edu.ph'
join public.profiles student
  on lower(student.email) = grades.student_email
join public.academic_content content
  on content.id = '10000000-0000-0000-0000-000000000001'
where student.role = 'student'
on conflict (id) do update set
  score = excluded.score,
  max_score = excluded.max_score,
  published = excluded.published,
  updated_at = now();

-- A pending student request addressed to the teacher.
insert into public.access_requests
  (id, requester_id, recipient_id, resource_id, permission, duration, urgency, justification)
select
  '30000000-0000-0000-0000-000000000001',
  student.id,
  teacher.id,
  resource.id,
  'View only',
  '1 semester',
  'normal',
  'I need access to the cybersecurity laboratory for my approved course activities.'
from public.profiles student
join public.profiles teacher
  on lower(teacher.email) = 'maria.santos@prof.uni.edu.ph'
join public.resources resource
  on resource.code = 'RES-CYBER'
where lower(student.email) = 'daniel.santos@university.edu.ph'
on conflict (id) do nothing;

-- A pending teacher request to the administrator to edit a grade.
insert into public.grade_edit_requests
  (id, teacher_id, grade_id, reason)
select
  '40000000-0000-0000-0000-000000000001',
  teacher.id,
  grade.id,
  'The submitted score needs correction after the student provided the missing activity page.'
from public.profiles teacher
join public.grades grade
  on grade.id = '20000000-0000-0000-0000-000000000001'
where lower(teacher.email) = 'maria.santos@prof.uni.edu.ph'
on conflict (id) do nothing;

-- A second student request addressed directly to the administrator.
insert into public.access_requests
  (id, requester_id, recipient_id, resource_id, permission, duration, urgency, justification)
select
  '30000000-0000-0000-0000-000000000002',
  student.id,
  administrator.id,
  resource.id,
  'Standard use',
  '1 semester',
  'urgent',
  'I need approved records-system access to complete my enrollment documentation.'
from public.profiles student
join public.profiles administrator
  on administrator.role = 'administrator'
join public.resources resource
  on resource.code = 'RES-RECORDS'
where lower(student.email) = 'sean.reyes@university.edu.ph'
on conflict (id) do nothing;

-- Example notifications and messages from real workflow participants.
insert into public.notifications
  (id, recipient_id, request_id, notification_type, title, message)
select
  '50000000-0000-0000-0000-000000000001',
  request.recipient_id,
  request.id,
  'access_request',
  'New student access request',
  'A student has directed an access request to you for review.'
from public.access_requests request
where request.id = '30000000-0000-0000-0000-000000000001'
on conflict (id) do nothing;

insert into public.messages
  (id, sender_id, recipient_id, request_id, body)
select
  '60000000-0000-0000-0000-000000000001',
  student.id,
  teacher.id,
  request.id,
  'Good day, Professor. I submitted this request for our cybersecurity laboratory activity.'
from public.profiles student
join public.profiles teacher
  on lower(teacher.email) = 'maria.santos@prof.uni.edu.ph'
join public.access_requests request
  on request.id = '30000000-0000-0000-0000-000000000001'
where lower(student.email) = 'daniel.santos@university.edu.ph'
on conflict (id) do nothing;

-- Administrator audit history covering actions by every role.
insert into public.audit_logs
  (id, actor_id, subject_id, request_id, action, category, resource_name, outcome, metadata)
select
  audit.id,
  actor.id,
  subject.id,
  audit.request_id,
  audit.action,
  audit.category,
  audit.resource_name,
  audit.outcome,
  audit.metadata::jsonb
from (
  values
    (
      '70000000-0000-0000-0000-000000000001'::uuid,
      'maria.santos@prof.uni.edu.ph',
      'daniel.santos@university.edu.ph',
      '30000000-0000-0000-0000-000000000001'::uuid,
      'Received access request',
      'access_request',
      'Cybersecurity Laboratory',
      'pending',
      '{"recipient_role":"teacher"}'
    ),
    (
      '70000000-0000-0000-0000-000000000002'::uuid,
      'daniel.santos@university.edu.ph',
      'daniel.santos@university.edu.ph',
      '30000000-0000-0000-0000-000000000001'::uuid,
      'Submitted access request',
      'access_request',
      'Cybersecurity Laboratory',
      'submitted',
      '{"recipient":"maria.santos@prof.uni.edu.ph"}'
    ),
    (
      '70000000-0000-0000-0000-000000000003'::uuid,
      'maria.santos@prof.uni.edu.ph',
      'daniel.santos@university.edu.ph',
      null::uuid,
      'Published lesson',
      'academic_content',
      'Introduction to Cybersecurity',
      'published',
      '{"content_type":"lesson"}'
    ),
    (
      '70000000-0000-0000-0000-000000000004'::uuid,
      'jose.reyes@prof.uni.edu.ph',
      'jose.reyes@prof.uni.edu.ph',
      null::uuid,
      'Saved activity draft',
      'academic_content',
      'Password Security Activity',
      'draft',
      '{"content_type":"activity"}'
    ),
    (
      '70000000-0000-0000-0000-000000000005'::uuid,
      'maria.santos@prof.uni.edu.ph',
      'daniel.santos@university.edu.ph',
      null::uuid,
      'Published grade',
      'grade',
      'Introduction to Cybersecurity',
      'published',
      '{"score":92,"max_score":100}'
    ),
    (
      '70000000-0000-0000-0000-000000000006'::uuid,
      'maria.santos@prof.uni.edu.ph',
      'daniel.santos@university.edu.ph',
      null::uuid,
      'Requested grade edit',
      'grade_edit_request',
      'Introduction to Cybersecurity',
      'pending',
      '{"reason":"Correction after missing activity page"}'
    ),
    (
      '70000000-0000-0000-0000-000000000007'::uuid,
      'admin@uni.edu.ph',
      'maria.santos@prof.uni.edu.ph',
      null::uuid,
      'Reviewed staff activity',
      'administrator_review',
      null,
      'recorded',
      '{"scope":"teacher and student workflow"}'
    )
) as audit(id, actor_email, subject_email, request_id, action, category, resource_name, outcome, metadata)
join public.profiles actor on lower(actor.email) = audit.actor_email
join public.profiles subject on lower(subject.email) = audit.subject_email
on conflict (id) do update set
  actor_id = excluded.actor_id,
  subject_id = excluded.subject_id,
  request_id = excluded.request_id,
  action = excluded.action,
  category = excluded.category,
  resource_name = excluded.resource_name,
  outcome = excluded.outcome,
  metadata = excluded.metadata;

-- Show what this demo file inserted or updated.
select code, name, active
from public.resources
where code like 'RES-%'
order by code;

select title, content_type, status
from public.academic_content
order by created_at;

select count(*) as published_demo_grades
from public.grades
where published = true;

select category, count(*) as audit_events
from public.audit_logs
group by category
order by category;

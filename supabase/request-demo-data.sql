-- SecureAccess request status demo data
-- Run schema/migrations and seed.sql first.
-- This file creates fictional pending, approved, rejected, and cancelled
-- requests for the existing demo students, teacher, administrator, and resources.
-- It is safe to run more than once.

-- Pending request sent to a teacher.
insert into public.access_requests
  (id, requester_id, recipient_id, resource_id, permission, duration, urgency,
   justification, status)
select
  '31000000-0000-0000-0000-000000000001',
  student.id,
  teacher.id,
  resource.id,
  'View only',
  '1 semester',
  'normal',
  'I need the cybersecurity laboratory for my approved security course project.',
  'pending'
from public.profiles student
join public.profiles teacher
  on lower(teacher.email) = 'maria.santos@prof.uni.edu.ph'
join public.resources resource
  on resource.code = 'RES-CYBER'
where lower(student.email) = 'daniel.santos@university.edu.ph'
on conflict (id) do update set
  recipient_id = excluded.recipient_id,
  resource_id = excluded.resource_id,
  status = excluded.status,
  reviewer_id = null,
  decision_reason = null,
  decided_at = null,
  updated_at = now();

-- Approved request sent to the administrator.
insert into public.access_requests
  (id, requester_id, recipient_id, resource_id, permission, duration, urgency,
   justification, status, reviewer_id, decision_reason, decided_at)
select
  '31000000-0000-0000-0000-000000000002',
  student.id,
  administrator.id,
  resource.id,
  'Standard use',
  '1 semester',
  'normal',
  'I need access to the digital library for my research paper and citations.',
  'approved',
  administrator.id,
  'Approved for the current semester. Use is limited to academic research.',
  now() - interval '3 days'
from public.profiles student
join public.profiles administrator
  on administrator.role = 'administrator'
join public.resources resource
  on resource.code = 'RES-LIB'
where lower(student.email) = 'sean.reyes@university.edu.ph'
on conflict (id) do update set
  recipient_id = excluded.recipient_id,
  resource_id = excluded.resource_id,
  status = excluded.status,
  reviewer_id = excluded.reviewer_id,
  decision_reason = excluded.decision_reason,
  decided_at = excluded.decided_at,
  updated_at = now();

-- The grant created by the approved request.
insert into public.access_grants
  (id, request_id, student_id, resource_id, permission, status, starts_at, expires_at)
select
  '32000000-0000-0000-0000-000000000001',
  request.id,
  request.requester_id,
  request.resource_id,
  request.permission,
  'active',
  now() - interval '3 days',
  now() + interval '120 days'
from public.access_requests request
where request.id = '31000000-0000-0000-0000-000000000002'
  and request.status = 'approved'
on conflict (id) do update set
  status = excluded.status,
  starts_at = excluded.starts_at,
  expires_at = excluded.expires_at;

-- Rejected request sent to the administrator.
insert into public.access_requests
  (id, requester_id, recipient_id, resource_id, permission, duration, urgency,
   justification, status, reviewer_id, decision_reason, decided_at)
select
  '31000000-0000-0000-0000-000000000003',
  student.id,
  administrator.id,
  resource.id,
  'Administrative',
  '1 year',
  'normal',
  'I would like administrative access to the network operations center.',
  'rejected',
  administrator.id,
  'Rejected because the requested clearance is not required for the student course.',
  now() - interval '5 days'
from public.profiles student
join public.profiles administrator
  on administrator.role = 'administrator'
join public.resources resource
  on resource.code = 'RES-NOC'
where lower(student.email) = 'anne.dela-cruz@university.edu.ph'
on conflict (id) do update set
  recipient_id = excluded.recipient_id,
  resource_id = excluded.resource_id,
  status = excluded.status,
  reviewer_id = excluded.reviewer_id,
  decision_reason = excluded.decision_reason,
  decided_at = excluded.decided_at,
  updated_at = now();

-- Cancelled request sent to a teacher by the student.
insert into public.access_requests
  (id, requester_id, recipient_id, resource_id, permission, duration, urgency,
   justification, status, decision_reason, decided_at)
select
  '31000000-0000-0000-0000-000000000004',
  student.id,
  teacher.id,
  resource.id,
  'View only',
  '1 week',
  'normal',
  'I need temporary access to review materials before my practical examination.',
  'cancelled',
  null,
  now() - interval '1 day'
from public.profiles student
join public.profiles teacher
  on lower(teacher.email) = 'jose.reyes@prof.uni.edu.ph'
join public.resources resource
  on resource.code = 'RES-CSLAB'
where lower(student.email) = 'mary.bautista@university.edu.ph'
on conflict (id) do update set
  recipient_id = excluded.recipient_id,
  resource_id = excluded.resource_id,
  status = excluded.status,
  decision_reason = excluded.decision_reason,
  decided_at = excluded.decided_at,
  updated_at = now();

-- Notifications make the status changes visible in the demo inbox.
insert into public.notifications
  (id, recipient_id, request_id, notification_type, title, message)
select
  notifications.id,
  request.requester_id,
  request.id,
  'request_status',
  notifications.title,
  notifications.message
from (
  values
    (
      '33000000-0000-0000-0000-000000000001'::uuid,
      '31000000-0000-0000-0000-000000000002'::uuid,
      'Request approved',
      'Your Digital Library access request was approved.'
    ),
    (
      '33000000-0000-0000-0000-000000000002'::uuid,
      '31000000-0000-0000-0000-000000000003'::uuid,
      'Request rejected',
      'Your Network Operations Center request was rejected. See the decision reason.'
    )
) as notifications(id, request_id, title, message)
join public.access_requests request
  on request.id = notifications.request_id
on conflict (id) do update set
  title = excluded.title,
  message = excluded.message;

-- Quick verification results.
select
  status,
  count(*) as total_requests
from public.access_requests
where id::text like '31000000-0000-0000-0000-0000000000%'
group by status
order by status;

select
  request.id,
  requester.full_name as student,
  resource.name as resource,
  request.status,
  request.decision_reason
from public.access_requests request
join public.profiles requester on requester.id = request.requester_id
join public.resources resource on resource.id = request.resource_id
where request.id::text like '31000000-0000-0000-0000-0000000000%'
order by request.submitted_at;

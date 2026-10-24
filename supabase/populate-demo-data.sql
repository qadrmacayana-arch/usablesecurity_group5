-- SecureAccess complete demo bootstrap
-- Run this single file in Supabase SQL Editor.
-- It uses existing auth.users and populates public profiles, resources,
-- requests, and an approved access grant.

with demo_accounts(email, student_id, full_name, institution, program, year_level, clearance_level, role) as (
  values
    ('admin@uni.edu.ph', null, 'SecureAccess Administrator', 'SecureAccess University - Manila', null, null, 5, 'administrator'::public.user_role),
    ('maria.santos@prof.uni.edu.ph', null, 'Maria Santos', 'SecureAccess University - Manila', 'BS Computer Science', null, 4, 'teacher'::public.user_role),
    ('jose.reyes@prof.uni.edu.ph', null, 'Jose Reyes', 'SecureAccess University - Cebu', 'BS Information Technology', null, 4, 'teacher'::public.user_role),
    ('daniel.santos@university.edu.ph', '2024-112234', 'Daniel Santos', 'SecureAccess University - Manila', 'BS Computer Science', 3, 3, 'student'::public.user_role),
    ('sean.reyes@university.edu.ph', '2025-000192', 'Sean Reyes', 'SecureAccess University - Quezon City', 'BS Information Technology', 2, 2, 'student'::public.user_role),
    ('anne.dela-cruz@university.edu.ph', '2023-000441', 'Anne Dela Cruz', 'SecureAccess University - Cebu', 'BS Cybersecurity', 4, 4, 'student'::public.user_role),
    ('mary.bautista@university.edu.ph', '2024-083517', 'Mary Bautista', 'SecureAccess University - Manila', 'BS Information Systems', 3, 3, 'student'::public.user_role),
    ('lizzie.garcia@university.edu.ph', '2022-167890', 'Lizzie Garcia', 'SecureAccess University - Davao', 'BS Software Engineering', 4, 3, 'student'::public.user_role),
    ('allan.mendoza@university.edu.ph', '2025-204681', 'Allan Mendoza', 'SecureAccess University - Iloilo', 'BS Data Science', 2, 2, 'student'::public.user_role),
    ('lorie.ramos@university.edu.ph', '2023-315702', 'Lorie Ramos', 'SecureAccess University - Baguio', 'BS Computer Engineering', 4, 4, 'student'::public.user_role),
    ('alexandra.villanueva@university.edu.ph', '2024-426813', 'Alexandra Villanueva', 'SecureAccess University - Manila', 'BS Business Analytics', 3, 2, 'student'::public.user_role),
    ('rowdy.navarro@university.edu.ph', '2022-537924', 'Rowdy Navarro', 'SecureAccess University - Cagayan de Oro', 'BS Information Security', 5, 4, 'student'::public.user_role),
    ('cherry.ong@university.edu.ph', '2025-648135', 'Cherry Ong', 'SecureAccess University - Cebu', 'BS Multimedia Arts and Computing', 2, 2, 'student'::public.user_role),
    ('peter.mercado@university.edu.ph', '2023-759246', 'Peter Mercado', 'SecureAccess University - Laguna', 'BS Electronics Engineering', 4, 3, 'student'::public.user_role)
)
insert into public.profiles
  (id, student_id, full_name, email, institution, program, year_level, clearance_level, role)
select
  users.id,
  accounts.student_id,
  accounts.full_name,
  lower(users.email),
  accounts.institution,
  accounts.program,
  accounts.year_level,
  accounts.clearance_level,
  accounts.role
from demo_accounts accounts
join auth.users users on lower(users.email) = accounts.email
on conflict (id) do update set
  student_id = excluded.student_id,
  full_name = excluded.full_name,
  email = excluded.email,
  institution = excluded.institution,
  program = excluded.program,
  year_level = excluded.year_level,
  clearance_level = excluded.clearance_level,
  role = excluded.role,
  updated_at = now();

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

insert into public.access_requests
  (id, requester_id, recipient_id, resource_id, permission, duration, urgency, justification, status, reviewer_id, decision_reason, decided_at)
select
  values_data.id,
  student.id,
  recipient.id,
  resource.id,
  values_data.permission,
  values_data.duration,
  values_data.urgency,
  values_data.justification,
  values_data.status::public.request_status,
  case when values_data.status = 'pending' or values_data.status = 'cancelled' then null else administrator.id end,
  values_data.decision_reason,
  case when values_data.status = 'pending' then null else now() - interval '2 days' end
from (
  values
    ('31000000-0000-0000-0000-000000000001'::uuid, 'daniel.santos@university.edu.ph', 'maria.santos@prof.uni.edu.ph', 'RES-CYBER', 'View only', '1 semester', 'normal', 'I need the cybersecurity laboratory for my approved security course project.', 'pending', null),
    ('31000000-0000-0000-0000-000000000002'::uuid, 'sean.reyes@university.edu.ph', 'admin@uni.edu.ph', 'RES-LIB', 'Standard use', '1 semester', 'normal', 'I need access to the digital library for my research paper and citations.', 'approved', 'Approved for the current semester.'),
    ('31000000-0000-0000-0000-000000000003'::uuid, 'anne.dela-cruz@university.edu.ph', 'admin@uni.edu.ph', 'RES-NOC', 'Administrative', '1 year', 'normal', 'I would like administrative access to the network operations center.', 'rejected', 'Rejected because the requested clearance is not required for the student course.'),
    ('31000000-0000-0000-0000-000000000004'::uuid, 'mary.bautista@university.edu.ph', 'jose.reyes@prof.uni.edu.ph', 'RES-CSLAB', 'View only', '1 week', 'normal', 'I need temporary access to review materials before my practical examination.', 'cancelled', null)
) as values_data(id, student_email, recipient_email, resource_code, permission, duration, urgency, justification, status, decision_reason)
join public.profiles student on lower(student.email) = values_data.student_email
join public.profiles recipient on lower(recipient.email) = values_data.recipient_email
join public.resources resource on resource.code = values_data.resource_code
cross join lateral (
  select id from public.profiles
  where role = 'administrator'
  limit 1
) administrator
on conflict (id) do update set
  recipient_id = excluded.recipient_id,
  resource_id = excluded.resource_id,
  status = excluded.status,
  reviewer_id = excluded.reviewer_id,
  decision_reason = excluded.decision_reason,
  decided_at = excluded.decided_at,
  updated_at = now();

insert into public.access_grants
  (id, request_id, student_id, resource_id, permission, status, starts_at, expires_at)
select
  '32000000-0000-0000-0000-000000000001',
  request.id,
  request.requester_id,
  request.resource_id,
  request.permission,
  'active',
  now() - interval '2 days',
  now() + interval '120 days'
from public.access_requests request
where request.id = '31000000-0000-0000-0000-000000000002'
  and request.status = 'approved'
on conflict (id) do update set
  status = excluded.status,
  starts_at = excluded.starts_at,
  expires_at = excluded.expires_at;

select role, count(*) as total_profiles
from public.profiles
group by role
order by role;

select status, count(*) as total_requests
from public.access_requests
where id::text like '31000000-0000-0000-0000-0000000000%'
group by status
order by status;

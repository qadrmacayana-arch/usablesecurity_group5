-- SecureAccess demo database contents
-- Run after the role migration and after creating the Auth users.
-- This file can be run repeatedly without duplicating the fixed demo rows.

-- Create/update public profiles from existing Supabase Auth users.
insert into public.profiles
  (id, student_id, full_name, email, institution, program, year_level, clearance_level, role)
select
  auth_user.id,
  case lower(auth_user.email)
    when 'daniel.santos@university.edu.ph' then '2024-112234'
    when 'sean.reyes@university.edu.ph' then '2025-000192'
    when 'anne.dela-cruz@university.edu.ph' then '2023-000441'
    when 'mary.bautista@university.edu.ph' then '2024-083517'
    when 'lizzie.garcia@university.edu.ph' then '2022-167890'
    when 'allan.mendoza@university.edu.ph' then '2025-204681'
    when 'lorie.ramos@university.edu.ph' then '2023-315702'
    when 'alexandra.villanueva@university.edu.ph' then '2024-426813'
    when 'rowdy.navarro@university.edu.ph' then '2022-537924'
    when 'cherry.ong@university.edu.ph' then '2025-648135'
    when 'peter.mercado@university.edu.ph' then '2023-759246'
    when 'juan.delacruz@university.edu.ph' then '2026-864291'
    else null
  end,
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
    initcap(replace(split_part(auth_user.email, '@', 1), '.', ' '))
  ),
  lower(auth_user.email),
  case
    when lower(auth_user.email) like '%@prof.uni.edu.ph'
      then 'SecureAccess University - Manila'
    when lower(auth_user.email) = 'admin@uni.edu.ph'
      then 'SecureAccess University - Manila'
    else 'SecureAccess University - Manila'
  end,
  case
    when lower(auth_user.email) = 'maria.santos@prof.uni.edu.ph'
      then 'BS Computer Science'
    when lower(auth_user.email) = 'jose.reyes@prof.uni.edu.ph'
      then 'BS Information Technology'
    else null
  end,
  case
    when lower(auth_user.email) like '%@prof.uni.edu.ph'
      then null
    when lower(auth_user.email) = 'admin@uni.edu.ph'
      then null
    else 1
  end,
  case
    when lower(auth_user.email) = 'admin@uni.edu.ph'
      then 'administrator'::public.user_role
    when lower(auth_user.email) like '%@prof.uni.edu.ph'
      then 'teacher'::public.user_role
    else 'student'::public.user_role
  end
from auth.users auth_user
where lower(auth_user.email) = 'admin@uni.edu.ph'
   or lower(auth_user.email) like '%@prof.uni.edu.ph'
   or lower(auth_user.email) like '%@university.edu.ph'
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

do $$
begin
  if not exists (select 1 from public.profiles where role = 'administrator') then
    raise exception 'No administrator profile found. Create admin@uni.edu.ph in Supabase Auth first.';
  end if;
  if not exists (select 1 from public.profiles where role = 'teacher') then
    raise exception 'No teacher profile found. Create a @prof.uni.edu.ph Auth user first.';
  end if;
  if not exists (select 1 from public.profiles where role = 'student') then
    raise exception 'No student profile found. Create a @university.edu.ph Auth user first.';
  end if;
end
$$;

insert into public.resources
  (code, name, category, sensitivity, minimum_clearance, description)
values
  ('DEMO-LIB', 'Digital Library', 'Academic', 'Standard', 1, 'Fictional academic library resource'),
  ('DEMO-CYBER', 'Cybersecurity Laboratory', 'Laboratory', 'Restricted', 3, 'Fictional security laboratory'),
  ('DEMO-RECORDS', 'Student Records System', 'Academic', 'Restricted', 3, 'Fictional student records resource')
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  sensitivity = excluded.sensitivity,
  minimum_clearance = excluded.minimum_clearance,
  description = excluded.description,
  active = true;

insert into public.academic_content
  (id, teacher_id, content_type, title, description, content_body, status, published_at)
select
  '81000000-0000-0000-0000-000000000001',
  teacher.id,
  'lesson',
  'Introduction to Cybersecurity',
  'CIA triad, common threats, and responsible security practices.',
  'This fictional lesson introduces confidentiality, integrity, availability, and safe online behavior.',
  'published',
  now()
from public.profiles teacher
where teacher.role = 'teacher'
order by teacher.created_at
limit 1
on conflict (id) do update set
  teacher_id = excluded.teacher_id,
  title = excluded.title,
  description = excluded.description,
  content_body = excluded.content_body,
  status = excluded.status,
  published_at = excluded.published_at,
  updated_at = now();

insert into public.academic_content
  (id, teacher_id, content_type, title, description, content_body, status)
select
  '81000000-0000-0000-0000-000000000002',
  teacher.id,
  'activity',
  'Password Security Activity',
  'Identify unsafe password habits and recommend safer practices.',
  'Submit three recommendations for protecting a student account.',
  'draft'
from public.profiles teacher
where teacher.role = 'teacher'
order by teacher.created_at desc
limit 1
on conflict (id) do update set
  teacher_id = excluded.teacher_id,
  title = excluded.title,
  description = excluded.description,
  content_body = excluded.content_body,
  status = excluded.status,
  updated_at = now();

insert into public.grades
  (id, content_id, student_id, teacher_id, score, max_score, published)
select
  '82000000-0000-0000-0000-000000000001',
  content.id,
  student.id,
  teacher.id,
  92,
  100,
  true
from public.profiles teacher
join public.academic_content content on content.id = '81000000-0000-0000-0000-000000000001'
join public.profiles student on student.role = 'student'
order by student.created_at
limit 1
on conflict (id) do update set
  score = excluded.score,
  max_score = excluded.max_score,
  published = excluded.published,
  updated_at = now();

insert into public.access_requests
  (id, requester_id, recipient_id, resource_id, permission, duration, urgency, justification)
select
  '83000000-0000-0000-0000-000000000001',
  student.id,
  teacher.id,
  resource.id,
  'View only',
  '1 semester',
  'normal',
  'Fictional student request for cybersecurity laboratory coursework.'
from public.profiles student
cross join lateral (
  select id from public.profiles
  where role = 'teacher'
  order by created_at
  limit 1
) teacher
join public.resources resource on resource.code = 'DEMO-CYBER'
where student.role = 'student'
order by student.created_at
limit 1
on conflict (id) do nothing;

insert into public.audit_logs
  (id, actor_id, subject_id, request_id, action, category, resource_name, outcome, metadata)
select
  '84000000-0000-0000-0000-000000000001',
  teacher.id,
  student.id,
  request.id,
  'Student request received by teacher',
  'access_request',
  'Cybersecurity Laboratory',
  'pending',
  '{"demo":true,"recipient_role":"teacher"}'::jsonb
from public.access_requests request
join public.profiles teacher on teacher.id = request.recipient_id
join public.profiles student on student.id = request.requester_id
where request.id = '83000000-0000-0000-0000-000000000001'
on conflict (id) do update set
  actor_id = excluded.actor_id,
  subject_id = excluded.subject_id,
  request_id = excluded.request_id,
  metadata = excluded.metadata;

select 'profiles' as table_name, count(*) as inserted_records from public.profiles
union all
select 'resources', count(*) from public.resources where code like 'DEMO-%'
union all
select 'academic_content', count(*) from public.academic_content
union all
select 'grades', count(*) from public.grades
union all
select 'access_requests', count(*) from public.access_requests
union all
select 'audit_logs', count(*) from public.audit_logs;

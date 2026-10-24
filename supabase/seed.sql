-- SecureAccess sample student seed data
-- Run schema.sql first.
--
-- Profiles are linked to auth.users, so this script never creates passwords
-- or inserts directly into auth.users. Create the users through Supabase Auth
-- first, then run this seed. The admin address is intentionally singular.

insert into public.resources (code, name, category, sensitivity, minimum_clearance, description)
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

with seed_staff(email, staff_id, full_name, role, institution) as (
  values
    ('admin@uni.edu.ph', '100001', 'SecureAccess Administrator', 'administrator'::public.user_role, 'SecureAccess University - Manila'),
    ('maria.santos@prof.uni.edu.ph', '100002', 'Maria Santos', 'teacher'::public.user_role, 'SecureAccess University - Manila'),
    ('jose.reyes@prof.uni.edu.ph', '100003', 'Jose Reyes', 'teacher'::public.user_role, 'SecureAccess University - Cebu')
)
insert into public.profiles (id, staff_id, full_name, email, institution, role, clearance_level)
select users.id, seed.staff_id, seed.full_name, seed.email, seed.institution, seed.role,
  case when seed.role = 'administrator' then 5 else 4 end
from seed_staff seed
join auth.users users on lower(users.email) = lower(seed.email)
on conflict (id) do update set
  full_name = excluded.full_name,
  staff_id = excluded.staff_id,
  email = excluded.email,
  institution = excluded.institution,
  role = excluded.role,
  clearance_level = excluded.clearance_level,
  updated_at = now();

with seed_students(student_id, email, full_name, institution, program, year_level, clearance_level) as (
  values
    ('2024-112234', 'daniel.santos@university.edu.ph', 'Daniel Santos', 'SecureAccess University - Manila', 'BS Computer Science', 3, 3),
    ('2025-000192', 'sean.reyes@university.edu.ph', 'Sean Reyes', 'SecureAccess University - Quezon City', 'BS Information Technology', 2, 2),
    ('2023-000441', 'anne.dela-cruz@university.edu.ph', 'Anne Dela Cruz', 'SecureAccess University - Cebu', 'BS Cybersecurity', 4, 4),
    ('2024-083517', 'mary.bautista@university.edu.ph', 'Mary Bautista', 'SecureAccess University - Manila', 'BS Information Systems', 3, 3),
    ('2022-167890', 'lizzie.garcia@university.edu.ph', 'Lizzie Garcia', 'SecureAccess University - Davao', 'BS Software Engineering', 4, 3),
    ('2025-204681', 'allan.mendoza@university.edu.ph', 'Allan Mendoza', 'SecureAccess University - Iloilo', 'BS Data Science', 2, 2),
    ('2023-315702', 'lorie.ramos@university.edu.ph', 'Lorie Ramos', 'SecureAccess University - Baguio', 'BS Computer Engineering', 4, 4),
    ('2024-426813', 'alexandra.villanueva@university.edu.ph', 'Alexandra Villanueva', 'SecureAccess University - Manila', 'BS Business Analytics', 3, 2),
    ('2022-537924', 'rowdy.navarro@university.edu.ph', 'Rowdy Navarro', 'SecureAccess University - Cagayan de Oro', 'BS Information Security', 5, 4),
    ('2025-648135', 'cherry.ong@university.edu.ph', 'Cherry Ong', 'SecureAccess University - Cebu', 'BS Multimedia Arts and Computing', 2, 2),
    ('2023-759246', 'peter.mercado@university.edu.ph', 'Peter Mercado', 'SecureAccess University - Laguna', 'BS Electronics Engineering', 4, 3)
)
insert into public.profiles (id, student_id, full_name, email, institution, program, year_level, clearance_level)
select
  users.id,
  seed.student_id,
  seed.full_name,
  seed.email,
  seed.institution,
  seed.program,
  seed.year_level,
  seed.clearance_level
from seed_students seed
join auth.users users on lower(users.email) = lower(seed.email)
on conflict (id) do update set
  student_id = excluded.student_id,
  full_name = excluded.full_name,
  email = excluded.email,
  institution = excluded.institution,
  program = excluded.program,
  year_level = excluded.year_level,
  clearance_level = excluded.clearance_level,
  updated_at = now();

-- Check which seeded accounts are ready.
with seed_students(student_id, email) as (
  values
    ('2024-112234', 'daniel.santos@university.edu.ph'),
    ('2025-000192', 'sean.reyes@university.edu.ph'),
    ('2023-000441', 'anne.dela-cruz@university.edu.ph'),
    ('2024-083517', 'mary.bautista@university.edu.ph'),
    ('2022-167890', 'lizzie.garcia@university.edu.ph'),
    ('2025-204681', 'allan.mendoza@university.edu.ph'),
    ('2023-315702', 'lorie.ramos@university.edu.ph'),
    ('2024-426813', 'alexandra.villanueva@university.edu.ph'),
    ('2022-537924', 'rowdy.navarro@university.edu.ph'),
    ('2025-648135', 'cherry.ong@university.edu.ph'),
    ('2023-759246', 'peter.mercado@university.edu.ph')
)
select
  seed.student_id,
  seed.email,
  case when users.id is null then 'Create Auth user first' else 'Ready' end as status
from seed_students seed
left join auth.users users on lower(users.email) = lower(seed.email)
order by seed.student_id;

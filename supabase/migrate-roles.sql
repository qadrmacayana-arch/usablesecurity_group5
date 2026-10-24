-- SecureAccess role and teacher workflow migration, step 2
-- Run this only after migrate-roles-step-1.sql has completed successfully.
-- It preserves existing data and does not recreate existing types or tables.

alter table public.profiles
  add column if not exists institution text not null default 'SecureAccess University';

-- Existing reviewer accounts with the teacher email format become teachers.
update public.profiles
set role = 'teacher'::public.user_role
where role::text = 'reviewer'
  and lower(email) ~ '^[^@]+@prof\.uni\.edu\.ph$';

alter table public.profiles
  drop constraint if exists profiles_role_email_format;

alter table public.profiles
  add constraint profiles_role_email_format check (
    (role = 'student' and lower(email) ~ '^[^@]+@university\.edu\.ph$')
    or (role = 'teacher' and lower(email) ~ '^[^@]+@prof\.uni\.edu\.ph$')
    or (role = 'administrator' and lower(email) = 'admin@uni.edu.ph')
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, student_id, full_name, email, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'student_id', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New user'),
    lower(new.email),
    case
      when lower(new.email) = 'admin@uni.edu.ph'
        then 'administrator'::public.user_role
      when lower(new.email) ~ '^[^@]+@prof\.uni\.edu\.ph$'
        then 'teacher'::public.user_role
      else 'student'::public.user_role
    end
  );
  return new;
end;
$$;

create unique index if not exists one_administrator_idx
on public.profiles (role)
where role = 'administrator';

do $$
begin
  create type public.content_type as enum ('lesson', 'activity');
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.publication_status as enum ('draft', 'published', 'unpublished');
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.grade_edit_status as enum ('pending', 'approved', 'rejected', 'cancelled');
exception when duplicate_object then null;
end
$$;

create table if not exists public.academic_content (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  content_type public.content_type not null,
  title text not null check (length(trim(title)) between 2 and 200),
  description text check (description is null or length(description) <= 4000),
  content_body text check (content_body is null or length(content_body) <= 50000),
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.academic_content(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  score numeric(6,2) not null check (score >= 0),
  max_score numeric(6,2) not null check (max_score > 0 and score <= max_score),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_id, student_id)
);

create table if not exists public.grade_edit_requests (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  grade_id uuid not null references public.grades(id) on delete cascade,
  reason text not null check (length(trim(reason)) between 10 and 2000),
  status public.grade_edit_status not null default 'pending',
  reviewer_id uuid references public.profiles(id) on delete set null,
  decision_reason text check (decision_reason is null or length(decision_reason) <= 2000),
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.access_requests
  add column if not exists recipient_id uuid references public.profiles(id) on delete restrict;

-- Existing requests are assigned to the administrator when one exists.
update public.access_requests
set recipient_id = (
  select id from public.profiles
  where role = 'administrator'
  order by created_at
  limit 1
)
where recipient_id is null;

create index if not exists access_requests_recipient_idx
on public.access_requests(recipient_id, submitted_at desc);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'administrator'
      and account_active = true
  );
$$;

create or replace function public.is_teacher()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'teacher'
      and account_active = true
  );
$$;

alter table public.academic_content enable row level security;
alter table public.grades enable row level security;
alter table public.grade_edit_requests enable row level security;

drop policy if exists "users read published content" on public.academic_content;
create policy "users read published content"
on public.academic_content for select to authenticated
using (status = 'published' or teacher_id = (select auth.uid()) or public.is_admin());

drop policy if exists "teachers manage own content" on public.academic_content;
create policy "teachers manage own content"
on public.academic_content for all to authenticated
using (teacher_id = (select auth.uid()) and public.is_teacher())
with check (teacher_id = (select auth.uid()) and public.is_teacher());

drop policy if exists "students read published grades" on public.grades;
create policy "students read published grades"
on public.grades for select to authenticated
using (
  (student_id = (select auth.uid()) and published = true)
  or teacher_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "teachers manage own grades" on public.grades;
create policy "teachers manage own grades"
on public.grades for all to authenticated
using (teacher_id = (select auth.uid()) and public.is_teacher())
with check (teacher_id = (select auth.uid()) and public.is_teacher());

drop policy if exists "teachers read grade edit requests" on public.grade_edit_requests;
create policy "teachers read grade edit requests"
on public.grade_edit_requests for select to authenticated
using (teacher_id = (select auth.uid()) or public.is_admin());

drop policy if exists "teachers submit grade edit requests" on public.grade_edit_requests;
create policy "teachers submit grade edit requests"
on public.grade_edit_requests for insert to authenticated
with check (
  teacher_id = (select auth.uid())
  and public.is_teacher()
  and status = 'pending'
);

drop policy if exists "administrators decide grade edit requests" on public.grade_edit_requests;
create policy "administrators decide grade edit requests"
on public.grade_edit_requests for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Staff can be selected as request recipients.
drop policy if exists "users read active staff" on public.profiles;
create policy "users read active staff"
on public.profiles for select to authenticated
using (role in ('teacher', 'administrator') and account_active = true);

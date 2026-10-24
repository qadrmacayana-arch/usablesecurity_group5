-- SecureAccess database schema for Supabase/PostgreSQL
-- Run this file in the Supabase SQL Editor.
-- Do not add a service_role key to the browser application.

create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'teacher', 'administrator');
create type public.request_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type public.grant_status as enum ('active', 'expired', 'revoked');
create type public.content_type as enum ('lesson', 'activity');
create type public.publication_status as enum ('draft', 'published', 'unpublished');
create type public.grade_edit_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_id text unique,
  staff_id text unique,
  full_name text not null check (length(trim(full_name)) between 2 and 160),
  email text not null,
  institution text not null default 'SecureAccess University',
  program text,
  year_level smallint check (year_level is null or year_level between 1 and 12),
  clearance_level smallint not null default 1 check (clearance_level between 1 and 5),
  role public.user_role not null default 'student',
  account_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_id_format check (
    student_id is null or student_id ~ '^[0-9]{4}-[0-9]{6}$'
  ),
  constraint staff_id_format check (
    staff_id is null or staff_id ~ '^[0-9]{6}$'
  ),
  constraint role_email_format check (
    (role = 'student' and lower(email) ~ '^[^@]+@university\.edu\.ph$')
    or (role = 'teacher' and lower(email) ~ '^[^@]+@prof\.uni\.edu\.ph$')
    or (role = 'administrator' and lower(email) = 'admin@uni.edu.ph')
  )
);

create unique index one_administrator_idx
on public.profiles (role)
where role = 'administrator';

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  category text not null,
  sensitivity text not null,
  minimum_clearance smallint not null default 1 check (minimum_clearance between 1 and 5),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.academic_content (
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

create table public.grades (
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

create table public.grade_edit_requests (
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

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  request_number bigint generated always as identity unique,
  requester_id uuid not null references public.profiles(id) on delete restrict,
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  resource_id uuid not null references public.resources(id) on delete restrict,
  permission text not null check (length(trim(permission)) between 2 and 80),
  duration text not null check (length(trim(duration)) between 2 and 80),
  urgency text not null default 'normal' check (urgency in ('normal', 'urgent')),
  justification text not null check (length(trim(justification)) between 10 and 4000),
  additional_message text check (additional_message is null or length(additional_message) <= 4000),
  status public.request_status not null default 'pending',
  reviewer_id uuid references public.profiles(id) on delete set null,
  decision_reason text check (decision_reason is null or length(decision_reason) <= 2000),
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.access_requests
  add constraint request_recipient_role check (recipient_id is not null);

create table public.access_grants (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.access_requests(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  resource_id uuid not null references public.resources(id) on delete restrict,
  permission text not null,
  status public.grant_status not null default 'active',
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  revoke_reason text,
  created_at timestamptz not null default now(),
  constraint grant_dates_valid check (expires_at > starts_at)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.access_requests(id) on delete cascade,
  notification_type text not null check (length(trim(notification_type)) between 2 and 40),
  title text not null check (length(trim(title)) between 2 and 160),
  message text not null check (length(trim(message)) between 2 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete restrict,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.access_requests(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create or replace function public.protect_message_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.recipient_id is distinct from auth.uid()
    or new.id is distinct from old.id
    or new.sender_id is distinct from old.sender_id
    or new.recipient_id is distinct from old.recipient_id
    or new.request_id is distinct from old.request_id
    or new.body is distinct from old.body
    or new.created_at is distinct from old.created_at
    or new.read_at is null
    or (old.read_at is not null and new.read_at is distinct from old.read_at) then
    raise exception 'Messages cannot be changed; recipients may only mark them as read';
  end if;
  return new;
end;
$$;

create trigger messages_protect_update
before update on public.messages
for each row execute function public.protect_message_update();

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  subject_id uuid references public.profiles(id) on delete set null,
  request_id uuid references public.access_requests(id) on delete set null,
  action text not null check (length(trim(action)) between 2 and 120),
  category text not null check (length(trim(category)) between 2 and 60),
  resource_name text,
  outcome text not null check (length(trim(outcome)) between 2 and 60),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, student_id, staff_id, full_name, email, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'student_id', ''),
    nullif(new.raw_user_meta_data ->> 'staff_id', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New user'),
    new.email,
    case
      when lower(new.email) = 'admin@uni.edu.ph' then 'administrator'::public.user_role
      when lower(new.email) ~ '^[^@]+@prof\.uni\.edu\.ph$' then 'teacher'::public.user_role
      else 'student'::public.user_role
    end
  );
  return new;
end;
$$;

create or replace function public.validate_staff_relationships()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_table_name = 'access_requests' then
    if tg_op = 'INSERT' then
      if not exists (
        select 1 from public.profiles
        where id = new.recipient_id
          and role in ('teacher', 'administrator')
          and account_active = true
      ) then
        raise exception 'Access request recipient must be an active teacher or administrator';
      end if;
    elsif new.recipient_id is distinct from old.recipient_id then
      if not exists (
        select 1 from public.profiles
        where id = new.recipient_id
          and role in ('teacher', 'administrator')
          and account_active = true
      ) then
        raise exception 'Access request recipient must be an active teacher or administrator';
      end if;
    end if;
  elsif tg_table_name = 'academic_content' then
    if not exists (
      select 1 from public.profiles
      where id = new.teacher_id and role = 'teacher' and account_active = true
    ) then
      raise exception 'Academic content must belong to an active teacher';
    end if;
  elsif tg_table_name = 'grades' then
    if not exists (
      select 1 from public.profiles
      where id = new.teacher_id and role = 'teacher' and account_active = true
    ) then
      raise exception 'Grades must belong to an active teacher';
    end if;
    if not exists (
      select 1 from public.academic_content
      where id = new.content_id and teacher_id = new.teacher_id
    ) then
      raise exception 'Teacher can only grade their own academic content';
    end if;
    if not exists (
      select 1 from public.profiles
      where id = new.student_id and role = 'student' and account_active = true
    ) then
      raise exception 'Grades must belong to an active student';
    end if;
  elsif tg_table_name = 'grade_edit_requests' then
    if not exists (
      select 1 from public.grades
      where id = new.grade_id and teacher_id = new.teacher_id
    ) then
      raise exception 'Teacher can only request edits for their own grades';
    end if;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger access_requests_validate_recipient
before insert or update on public.access_requests
for each row execute function public.validate_staff_relationships();

create trigger academic_content_validate_teacher
before insert or update on public.academic_content
for each row execute function public.validate_staff_relationships();

create trigger grades_validate_teacher
before insert or update on public.grades
for each row execute function public.validate_staff_relationships();

create trigger grade_edit_requests_validate_teacher
before insert or update on public.grade_edit_requests
for each row execute function public.validate_staff_relationships();

create index access_requests_requester_idx on public.access_requests(requester_id, submitted_at desc);
create index access_requests_status_idx on public.access_requests(status, submitted_at desc);
create index access_requests_recipient_idx on public.access_requests(recipient_id, submitted_at desc);
create index academic_content_teacher_idx on public.academic_content(teacher_id, status, updated_at desc);
create index grades_student_idx on public.grades(student_id, published, updated_at desc);
create index grade_edit_requests_teacher_idx on public.grade_edit_requests(teacher_id, status, submitted_at desc);
create index access_grants_student_idx on public.access_grants(student_id, status, expires_at);
create index notifications_recipient_idx on public.notifications(recipient_id, created_at desc);
create index messages_recipient_idx on public.messages(recipient_id, created_at desc);
create index audit_logs_subject_idx on public.audit_logs(subject_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger requests_set_updated_at
before update on public.access_requests
for each row execute function public.set_updated_at();

create trigger academic_content_set_updated_at
before update on public.academic_content
for each row execute function public.set_updated_at();

create trigger grades_set_updated_at
before update on public.grades
for each row execute function public.set_updated_at();

create trigger grade_edit_requests_set_updated_at
before update on public.grade_edit_requests
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'administrator'
      and account_active = true
  );
$$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'teacher'
      and account_active = true
  );
$$;

create or replace function public.decide_access_request(
  p_request_id uuid,
  p_decision text,
  p_decision_reason text
)
returns public.access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.access_requests;
  v_resource_name text;
  v_decision text := lower(trim(coalesce(p_decision, '')));
  v_reason text := trim(coalesce(p_decision_reason, ''));
  v_now timestamptz := now();
  v_expires_at timestamptz;
  v_days text[];
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  if v_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  if length(v_reason) < 1 or length(v_reason) > 2000 then
    raise exception 'Decision reason must contain 1 to 2000 characters';
  end if;

  select *
  into v_request
  from public.access_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Access request was not found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Only pending access requests can be decided';
  end if;

  if v_decision = 'approved' then
    if not exists (
      select 1
      from public.profiles p
      join public.resources r on r.id = v_request.resource_id
      where p.id = v_request.requester_id
        and p.role = 'student'
        and p.account_active = true
        and p.clearance_level >= r.minimum_clearance
    ) then
      raise exception 'The student account or clearance level does not meet this resource requirement';
    end if;

    v_days := regexp_match(lower(trim(v_request.duration)), '^([0-9]+) days$');

    if v_days is not null then
      v_expires_at := v_now + make_interval(days => v_days[1]::integer);
    elsif lower(trim(v_request.duration)) = '1 semester' then
      v_expires_at := v_now + interval '6 months';
    elsif lower(trim(v_request.duration)) = '1 academic year' then
      v_expires_at := v_now + interval '1 year';
    else
      raise exception 'The requested duration cannot be converted to an access expiry';
    end if;
  end if;

  select name into v_resource_name
  from public.resources
  where id = v_request.resource_id;

  update public.access_requests
  set status = v_decision::public.request_status,
      reviewer_id = auth.uid(),
      decision_reason = v_reason,
      decided_at = v_now
  where id = v_request.id
  returning * into v_request;

  if v_decision = 'approved' then
    insert into public.access_grants (
      request_id,
      student_id,
      resource_id,
      permission,
      status,
      starts_at,
      expires_at
    )
    values (
      v_request.id,
      v_request.requester_id,
      v_request.resource_id,
      v_request.permission,
      'active',
      v_now,
      v_expires_at
    );
  end if;

  insert into public.notifications (
    recipient_id,
    request_id,
    notification_type,
    title,
    message
  )
  values (
    v_request.requester_id,
    v_request.id,
    case when v_decision = 'approved' then 'approval' else 'rejection' end,
    case when v_decision = 'approved' then 'Access Request Approved' else 'Access Request Rejected' end,
    'Your access request REQ-' || to_char(v_now, 'YYYY') || '-' ||
      lpad(v_request.request_number::text, 3, '0') || ' for ' ||
      coalesce(v_resource_name, 'the requested resource') || ' has been ' ||
      v_decision || '. Administrator note: ' || v_reason
  );

  insert into public.audit_logs (
    actor_id,
    subject_id,
    request_id,
    action,
    category,
    resource_name,
    outcome,
    metadata
  )
  values (
    auth.uid(),
    v_request.requester_id,
    v_request.id,
    case when v_decision = 'approved' then 'Access Request Approved' else 'Access Request Rejected' end,
    'Access Control',
    v_resource_name,
    case when v_decision = 'approved' then 'Approved' else 'Rejected' end,
    jsonb_build_object(
      'request_number', v_request.request_number,
      'permission', v_request.permission,
      'duration', v_request.duration,
      'urgency', v_request.urgency
    )
  );

  return v_request;
end;
$$;

revoke all on function public.decide_access_request(uuid, text, text) from public;
grant execute on function public.decide_access_request(uuid, text, text) to authenticated;

create or replace function public.active_staff_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.profiles
  where role in ('teacher', 'administrator')
    and account_active = true;
$$;

revoke all on function public.active_staff_ids() from public;
grant execute on function public.active_staff_ids() to authenticated;

create or replace function public.teacher_can_view_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_teacher() and exists (
    select 1
    from public.profiles student
    where student.id = p_student_id
      and student.role = 'student'
      and student.account_active = true
      and (
        exists (
          select 1 from public.access_requests request
          where request.requester_id = student.id
            and request.recipient_id = auth.uid()
        )
        or exists (
          select 1 from public.grades grade
          where grade.student_id = student.id
            and grade.teacher_id = auth.uid()
        )
        or exists (
          select 1 from public.messages message
          where message.sender_id = student.id
            and message.recipient_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_send_message(p_recipient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles sender
    join public.profiles recipient on recipient.id = p_recipient_id
    where sender.id = auth.uid()
      and sender.account_active = true
      and recipient.account_active = true
      and (
        sender.role = 'administrator'
        or (
          sender.role = 'student'
          and recipient.role in ('teacher', 'administrator')
        )
        or (
          sender.role = 'teacher'
          and recipient.role = 'administrator'
        )
        or (
          sender.role = 'teacher'
          and recipient.role = 'student'
          and (
            exists (
              select 1 from public.access_requests request
              where request.requester_id = recipient.id
                and request.recipient_id = sender.id
            )
            or exists (
              select 1 from public.grades grade
              where grade.student_id = recipient.id
                and grade.teacher_id = sender.id
            )
            or exists (
              select 1 from public.messages message
              where message.sender_id = recipient.id
                and message.recipient_id = sender.id
            )
          )
        )
      )
  );
$$;

revoke all on function public.teacher_can_view_student(uuid) from public;
revoke all on function public.can_send_message(uuid) from public;
grant execute on function public.teacher_can_view_student(uuid) to authenticated;
grant execute on function public.can_send_message(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.access_requests enable row level security;
alter table public.academic_content enable row level security;
alter table public.grades enable row level security;
alter table public.grade_edit_requests enable row level security;
alter table public.access_grants enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.audit_logs enable row level security;

create policy "users read own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or public.is_admin());

create policy "users read active staff directory"
on public.profiles for select
to authenticated
using (role in ('teacher', 'administrator') and account_active = true);

create policy "teachers read related student profiles"
on public.profiles for select
to authenticated
using (public.teacher_can_view_student(id));

create policy "admins update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "authenticated users read active resources"
on public.resources for select
to authenticated
using (active = true or public.is_admin());

create policy "users read own requests"
on public.access_requests for select
to authenticated
using (requester_id = (select auth.uid()) or public.is_admin());
-- Students can direct a request to either the sole administrator or a teacher.
-- The recipient can see requests addressed to them; only administrators decide.

create policy "users create own requests"
on public.access_requests for insert
to authenticated
with check (
  requester_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles p
    join public.resources r on r.id = access_requests.resource_id
    where p.id = (select auth.uid())
      and p.role = 'student'
      and p.account_active = true
      and p.clearance_level >= r.minimum_clearance
  )
  and recipient_id in (select public.active_staff_ids())
  and status = 'pending'
  and reviewer_id is null
  and decided_at is null
);

create policy "recipients read directed requests"
on public.access_requests for select
to authenticated
using (recipient_id = (select auth.uid()));

create policy "teachers publish content"
on public.academic_content for insert
to authenticated
with check (teacher_id = (select auth.uid()) and public.is_teacher());

create policy "teachers manage own content"
on public.academic_content for update
to authenticated
using (teacher_id = (select auth.uid()) and public.is_teacher())
with check (teacher_id = (select auth.uid()) and public.is_teacher());

create policy "users read published content"
on public.academic_content for select
to authenticated
using (status = 'published' or teacher_id = (select auth.uid()) or public.is_admin());

create policy "students read published grades"
on public.grades for select
to authenticated
using (
  (student_id = (select auth.uid()) and published = true)
  or teacher_id = (select auth.uid())
  or public.is_admin()
);

create policy "teachers manage own grades"
on public.grades for insert
to authenticated
with check (teacher_id = (select auth.uid()) and public.is_teacher());

create policy "teachers update own grades"
on public.grades for update
to authenticated
using (teacher_id = (select auth.uid()) and public.is_teacher())
with check (teacher_id = (select auth.uid()) and public.is_teacher());

create policy "teachers request grade edits"
on public.grade_edit_requests for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and public.is_teacher()
  and status = 'pending'
  and reviewer_id is null
  and decided_at is null
);

create policy "teachers and admins read grade edit requests"
on public.grade_edit_requests for select
to authenticated
using (teacher_id = (select auth.uid()) or public.is_admin());

create policy "admins decide grade edit requests"
on public.grade_edit_requests for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "users read own grants"
on public.access_grants for select
to authenticated
using (student_id = (select auth.uid()) or public.is_admin());

create policy "users read own notifications"
on public.notifications for select
to authenticated
using (recipient_id = (select auth.uid()) or public.is_admin());

create policy "users mark own notifications read"
on public.notifications for update
to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));

create policy "participants read messages"
on public.messages for select
to authenticated
using (
  sender_id = (select auth.uid())
  or recipient_id = (select auth.uid())
  or public.is_admin()
);

create policy "authenticated users send messages"
on public.messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and public.can_send_message(recipient_id)
);

create policy "recipients mark messages read"
on public.messages for update
to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));

-- Audit records are intentionally not writable from the browser. Insert them
-- from a trusted Edge Function or server-side workflow using service_role.
create policy "users read own audit logs"
on public.audit_logs for select
to authenticated
using (subject_id = (select auth.uid()) or public.is_admin());

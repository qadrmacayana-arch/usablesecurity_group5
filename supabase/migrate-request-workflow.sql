-- Apply once to an existing SecureAccess database.
-- New installations should use schema.sql instead.

begin;

alter table public.profiles
  add column if not exists staff_id text;

create unique index if not exists profiles_staff_id_uidx
  on public.profiles (staff_id)
  where staff_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'staff_id_format'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint staff_id_format
      check (staff_id is null or staff_id ~ '^[0-9]{6}$');
  end if;
end;
$$;

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

drop policy if exists "admins update requests"
  on public.access_requests;

drop policy if exists "users create own requests"
  on public.access_requests;

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

commit;

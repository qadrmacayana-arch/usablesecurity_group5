-- Apply after the access-request workflow migration.
-- Adds relationship-scoped student visibility and direct-message permissions
-- for the teacher workspace.

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

drop trigger if exists messages_protect_update on public.messages;
create trigger messages_protect_update
before update on public.messages
for each row execute function public.protect_message_update();

drop policy if exists "teachers read related student profiles" on public.profiles;
create policy "teachers read related student profiles"
on public.profiles for select
to authenticated
using (public.teacher_can_view_student(id));

drop policy if exists "authenticated users send messages" on public.messages;
create policy "authenticated users send messages"
on public.messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and public.can_send_message(recipient_id)
);

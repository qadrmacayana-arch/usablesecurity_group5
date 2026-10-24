-- Run supabase/create-eduardo-pilepe-professor.mjs first to create the
-- confirmed Auth user without sending a confirmation email, then run this file.
-- Set the password in Supabase Auth; passwords do not belong in public.profiles.

do $$
declare
  auth_user_id uuid;
begin
  select id
  into auth_user_id
  from auth.users
  where lower(email) = 'eduardopilepe@prof.uni.edu.ph';

  if auth_user_id is null then
    raise exception 'Create eduardopilepe@prof.uni.edu.ph in Supabase Auth first.';
  end if;

  insert into public.profiles
    (id, full_name, email, institution, role, clearance_level)
  values
    (
      auth_user_id,
      'Eduardo Pilepe',
      'eduardopilepe@prof.uni.edu.ph',
      'SecureAccess University - Manila',
      'teacher'::public.user_role,
      4
    )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    institution = excluded.institution,
    role = excluded.role,
    clearance_level = excluded.clearance_level,
    updated_at = now();
end
$$;

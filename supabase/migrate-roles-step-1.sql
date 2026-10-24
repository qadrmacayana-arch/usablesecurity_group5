-- SecureAccess role migration, step 1
-- Run this by itself in Supabase SQL Editor and wait for success.
-- Then run migrate-roles.sql as step 2.

alter type public.user_role add value if not exists 'teacher';

alter table public.profiles
  add column if not exists institution text not null default 'SecureAccess University';

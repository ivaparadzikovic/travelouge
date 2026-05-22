-- Allow login by username by resolving username -> email server-side.
-- Usernames are already publicly visible across the platform, so exposing the
-- mapping does not leak more identity information than is already available.

create or replace function public.email_for_username(p_username text)
returns text
language sql
security definer
set search_path = public, auth
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username = p_username
  limit 1;
$$;

revoke all on function public.email_for_username(text) from public;
grant execute on function public.email_for_username(text) to anon, authenticated;

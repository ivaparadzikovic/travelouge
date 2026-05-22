-- Remove any self-votes that snuck in before this constraint existed.
-- Vote triggers will reverse the reputation effects automatically.
delete from public.votes v
using public.posts p
where v.post_id = p.id and v.user_id = p.author_id;

-- Block users from voting on their own posts.
create or replace function public.prevent_self_vote()
returns trigger as $$
begin
  if exists (
    select 1 from public.posts
    where id = NEW.post_id and author_id = NEW.user_id
  ) then
    raise exception 'Users cannot vote on their own posts'
      using errcode = 'check_violation';
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger prevent_self_vote_trigger
  before insert or update on public.votes
  for each row execute function public.prevent_self_vote();

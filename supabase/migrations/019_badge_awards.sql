-- Awarding logic for the five badges seeded in 008_badges.sql.
-- All inserts to user_badges go through security-definer helpers so they
-- bypass RLS (no INSERT policy is exposed to clients).

-- Idempotent: award badge by name, no-op if already held.
create or replace function public.award_badge(p_user_id uuid, p_badge_name text)
returns void as $$
declare
  v_badge_id integer;
begin
  select id into v_badge_id from public.badges where name = p_badge_name;
  if v_badge_id is null then return; end if;
  insert into public.user_badges (user_id, badge_id)
    values (p_user_id, v_badge_id)
    on conflict do nothing;
end;
$$ language plpgsql security definer;

-- Veteran: 1+ year since profile creation. Checked on user activity.
create or replace function public.check_veteran_badge(p_user_id uuid)
returns void as $$
begin
  if exists (
    select 1 from public.profiles
    where id = p_user_id and created_at < now() - interval '1 year'
  ) then
    perform public.award_badge(p_user_id, 'Veteran');
  end if;
end;
$$ language plpgsql security definer;

-- Post-event badges: First Post (1st post), Explorer (5 distinct countries).
create or replace function public.award_post_badges()
returns trigger as $$
declare
  v_post_count integer;
  v_country_count integer;
begin
  select count(*) into v_post_count
    from public.posts where author_id = NEW.author_id;
  if v_post_count = 1 then
    perform public.award_badge(NEW.author_id, 'First Post');
  end if;

  select count(distinct country_id) into v_country_count
    from public.posts where author_id = NEW.author_id;
  if v_country_count >= 5 then
    perform public.award_badge(NEW.author_id, 'Explorer');
  end if;

  perform public.check_veteran_badge(NEW.author_id);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger award_post_badges_trigger
  after insert on public.posts
  for each row execute function public.award_post_badges();

-- Comment-event badge: Commenter (50 comments).
create or replace function public.award_comment_badges()
returns trigger as $$
declare
  v_count integer;
begin
  select count(*) into v_count
    from public.comments where author_id = NEW.author_id;
  if v_count >= 50 then
    perform public.award_badge(NEW.author_id, 'Commenter');
  end if;
  perform public.check_veteran_badge(NEW.author_id);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger award_comment_badges_trigger
  after insert on public.comments
  for each row execute function public.award_comment_badges();

-- Vote-event badge: Popular (100 lifetime upvotes for posts you authored).
-- Queries the votes table directly so trigger firing order vs.
-- update_post_vote_count doesn't matter.
create or replace function public.award_vote_badges()
returns trigger as $$
declare
  v_author_id uuid;
  v_total_upvotes integer;
begin
  select author_id into v_author_id from public.posts where id = NEW.post_id;
  if v_author_id is null then return NEW; end if;

  select count(*) into v_total_upvotes
    from public.votes v
    join public.posts p on p.id = v.post_id
    where p.author_id = v_author_id and v.value = 1;

  if v_total_upvotes >= 100 then
    perform public.award_badge(v_author_id, 'Popular');
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger award_vote_badges_trigger
  after insert or update on public.votes
  for each row execute function public.award_vote_badges();

-- One-time backfill so existing users get badges they already earned.

insert into public.user_badges (user_id, badge_id)
select distinct p.author_id, b.id
from public.posts p, public.badges b
where b.name = 'First Post'
on conflict do nothing;

insert into public.user_badges (user_id, badge_id)
select p.author_id, b.id
from public.posts p, public.badges b
where b.name = 'Explorer'
group by p.author_id, b.id
having count(distinct p.country_id) >= 5
on conflict do nothing;

insert into public.user_badges (user_id, badge_id)
select p.author_id, b.id
from public.posts p, public.badges b
where b.name = 'Popular'
group by p.author_id, b.id
having coalesce(sum(p.upvote_count), 0) >= 100
on conflict do nothing;

insert into public.user_badges (user_id, badge_id)
select c.author_id, b.id
from public.comments c, public.badges b
where b.name = 'Commenter'
group by c.author_id, b.id
having count(*) >= 50
on conflict do nothing;

insert into public.user_badges (user_id, badge_id)
select pr.id, b.id
from public.profiles pr, public.badges b
where b.name = 'Veteran' and pr.created_at < now() - interval '1 year'
on conflict do nothing;

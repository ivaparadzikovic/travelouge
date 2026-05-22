-- Split vote_count into separate upvote / downvote counters
alter table public.posts
  add column upvote_count integer not null default 0,
  add column downvote_count integer not null default 0;

-- Backfill from existing votes
update public.posts p set
  upvote_count = coalesce((select count(*) from public.votes where post_id = p.id and value = 1), 0),
  downvote_count = coalesce((select count(*) from public.votes where post_id = p.id and value = -1), 0);

-- Rewrite the trigger to keep vote_count, upvote_count, downvote_count, and reputation in sync
create or replace function public.update_post_vote_count()
returns trigger as $$
declare
  v_author uuid;
begin
  if TG_OP = 'INSERT' then
    if NEW.value = 1 then
      update public.posts
        set vote_count = vote_count + 1,
            upvote_count = upvote_count + 1
        where id = NEW.post_id
        returning author_id into v_author;
      update public.profiles set reputation = reputation + 10 where id = v_author;
    else
      update public.posts
        set vote_count = vote_count - 1,
            downvote_count = downvote_count + 1
        where id = NEW.post_id
        returning author_id into v_author;
      update public.profiles set reputation = reputation - 2 where id = v_author;
    end if;
    return NEW;

  elsif TG_OP = 'UPDATE' then
    -- value can only flip between +1 and -1 (check constraint)
    if NEW.value = 1 then
      update public.posts
        set vote_count = vote_count + 2,
            upvote_count = upvote_count + 1,
            downvote_count = downvote_count - 1
        where id = NEW.post_id
        returning author_id into v_author;
      update public.profiles set reputation = reputation + 12 where id = v_author;
    else
      update public.posts
        set vote_count = vote_count - 2,
            upvote_count = upvote_count - 1,
            downvote_count = downvote_count + 1
        where id = NEW.post_id
        returning author_id into v_author;
      update public.profiles set reputation = reputation - 12 where id = v_author;
    end if;
    return NEW;

  elsif TG_OP = 'DELETE' then
    if OLD.value = 1 then
      update public.posts
        set vote_count = vote_count - 1,
            upvote_count = upvote_count - 1
        where id = OLD.post_id
        returning author_id into v_author;
      update public.profiles set reputation = reputation - 10 where id = v_author;
    else
      update public.posts
        set vote_count = vote_count + 1,
            downvote_count = downvote_count - 1
        where id = OLD.post_id
        returning author_id into v_author;
      update public.profiles set reputation = reputation + 2 where id = v_author;
    end if;
    return OLD;
  end if;
end;
$$ language plpgsql security definer;

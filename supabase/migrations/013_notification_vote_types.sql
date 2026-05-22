-- Distinguish upvote vs downvote in notifications.

alter table public.notifications drop constraint notifications_type_check;

-- Backfill existing 'vote' rows from the current vote value. If the vote was
-- since deleted (toggled off) we fall back to 'upvote' as a best guess.
update public.notifications n set type = coalesce(
  (select case when v.value = 1 then 'upvote' else 'downvote' end
   from public.votes v
   where v.user_id = n.actor_id and v.post_id = n.post_id),
  'upvote'
)
where n.type = 'vote';

alter table public.notifications add constraint notifications_type_check
  check (type in ('upvote', 'downvote', 'comment'));

-- Rewrite the vote-insert trigger to record direction.
create or replace function public.create_vote_notification()
returns trigger as $$
declare
  post_author_id uuid;
begin
  select author_id into post_author_id from public.posts where id = NEW.post_id;
  if post_author_id != NEW.user_id then
    insert into public.notifications (user_id, type, post_id, actor_id)
    values (
      post_author_id,
      case when NEW.value = 1 then 'upvote' else 'downvote' end,
      NEW.post_id,
      NEW.user_id
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Also notify when a user switches their vote direction (e.g. upvote -> downvote).
create or replace function public.create_vote_update_notification()
returns trigger as $$
declare
  post_author_id uuid;
begin
  if NEW.value = OLD.value then
    return NEW;
  end if;
  select author_id into post_author_id from public.posts where id = NEW.post_id;
  if post_author_id != NEW.user_id then
    insert into public.notifications (user_id, type, post_id, actor_id)
    values (
      post_author_id,
      case when NEW.value = 1 then 'upvote' else 'downvote' end,
      NEW.post_id,
      NEW.user_id
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_vote_change_notify on public.votes;
create trigger on_vote_change_notify
  after update on public.votes
  for each row execute function public.create_vote_update_notification();

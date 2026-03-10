-- Notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('vote', 'comment')),
  post_id uuid not null references public.posts(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;

-- Enable RLS
alter table public.notifications enable row level security;

-- Users can view their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- System creates notifications via triggers (security definer functions)
-- Notification on new comment
create or replace function public.create_comment_notification()
returns trigger as $$
declare
  post_author_id uuid;
begin
  select author_id into post_author_id from public.posts where id = NEW.post_id;
  -- Don't notify if commenting on own post
  if post_author_id != NEW.author_id then
    insert into public.notifications (user_id, type, post_id, actor_id)
    values (post_author_id, 'comment', NEW.post_id, NEW.author_id);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_new_comment_notify
  after insert on public.comments
  for each row execute function public.create_comment_notification();

-- Notification on new vote
create or replace function public.create_vote_notification()
returns trigger as $$
declare
  post_author_id uuid;
begin
  select author_id into post_author_id from public.posts where id = NEW.post_id;
  -- Don't notify if voting on own post
  if post_author_id != NEW.user_id then
    insert into public.notifications (user_id, type, post_id, actor_id)
    values (post_author_id, 'vote', NEW.post_id, NEW.user_id);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_new_vote_notify
  after insert on public.votes
  for each row execute function public.create_vote_notification();

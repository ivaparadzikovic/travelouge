-- Likes on comments (heart).

create table public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(comment_id, user_id)
);

create index idx_comment_likes_comment on public.comment_likes(comment_id);
create index idx_comment_likes_user on public.comment_likes(user_id);

alter table public.comment_likes enable row level security;

create policy "Comment likes are viewable by everyone"
  on public.comment_likes for select using (true);

create policy "Authenticated users can like comments"
  on public.comment_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own comment likes"
  on public.comment_likes for delete
  using (auth.uid() = user_id);

alter table public.comments add column like_count integer not null default 0;

create or replace function public.update_comment_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.comments set like_count = like_count + 1 where id = NEW.comment_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.comments set like_count = like_count - 1 where id = OLD.comment_id;
    return OLD;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_comment_like_change
  after insert or delete on public.comment_likes
  for each row execute function public.update_comment_like_count();

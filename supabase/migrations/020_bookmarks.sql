-- Bookmarks: a user can save posts for later.
-- Private to the bookmarker (unlike votes, which are public by author intent).

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

create index idx_bookmarks_user on public.bookmarks(user_id);
create index idx_bookmarks_post on public.bookmarks(post_id);

alter table public.bookmarks enable row level security;

-- Each user sees only their own bookmarks. No public read.
create policy "Users can read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

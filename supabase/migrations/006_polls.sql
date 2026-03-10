-- Polls table
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid unique not null references public.posts(id) on delete cascade,
  question text not null,
  is_multiple boolean default false,
  created_at timestamptz default now()
);

-- Poll options table
create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  text text not null,
  position integer not null default 0
);

-- Poll votes table
create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(poll_id, user_id, option_id)
);

-- Indexes
create index idx_polls_post on public.polls(post_id);
create index idx_poll_options_poll on public.poll_options(poll_id);
create index idx_poll_votes_poll on public.poll_votes(poll_id);
create index idx_poll_votes_user on public.poll_votes(user_id);

-- Enable RLS
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

-- Anyone can view polls and options
create policy "Polls are viewable by everyone"
  on public.polls for select
  using (true);

create policy "Poll options are viewable by everyone"
  on public.poll_options for select
  using (true);

-- Poll votes visible to everyone (needed to show results after voting)
create policy "Poll votes are viewable by everyone"
  on public.poll_votes for select
  using (true);

-- Post author can create poll (same as post author)
create policy "Post authors can create polls"
  on public.polls for insert
  with check (
    auth.uid() = (select author_id from public.posts where id = post_id)
  );

-- Post author can create poll options
create policy "Post authors can create poll options"
  on public.poll_options for insert
  with check (
    auth.uid() = (select p.author_id from public.posts p join public.polls pl on pl.post_id = p.id where pl.id = poll_id)
  );

-- Authenticated users can vote in polls
create policy "Authenticated users can vote in polls"
  on public.poll_votes for insert
  with check (auth.uid() = user_id);

-- Posts table
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  image_url text,
  country_id integer not null references public.countries(id),
  category_id integer not null references public.categories(id),
  vote_count integer default 0,
  comment_count integer default 0,
  is_edited boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_posts_author on public.posts(author_id);
create index idx_posts_country on public.posts(country_id);
create index idx_posts_category on public.posts(category_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_posts_vote_count on public.posts(vote_count desc);

-- Enable RLS
alter table public.posts enable row level security;

-- Anyone can view posts
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

-- Authenticated users can create posts
create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- Authors can update their own posts
create policy "Authors can update own posts"
  on public.posts for update
  using (auth.uid() = author_id);

-- Authors can delete their own posts
create policy "Authors can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

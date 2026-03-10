-- Badges table
create table public.badges (
  id serial primary key,
  name text unique not null,
  description text,
  icon text
);

-- User badges junction table
create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id integer not null references public.badges(id) on delete cascade,
  awarded_at timestamptz default now(),
  primary key (user_id, badge_id)
);

-- Enable RLS
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Anyone can view badges
create policy "Badges are viewable by everyone"
  on public.badges for select
  using (true);

-- Anyone can view user badges
create policy "User badges are viewable by everyone"
  on public.user_badges for select
  using (true);

-- Seed some initial badges
insert into public.badges (name, description, icon) values
  ('First Post', 'Published your first post', 'pencil'),
  ('Explorer', 'Posted about 5 different countries', 'globe'),
  ('Popular', 'Received 100 upvotes total', 'star'),
  ('Commenter', 'Left 50 comments', 'message-circle'),
  ('Veteran', 'Member for over 1 year', 'award');

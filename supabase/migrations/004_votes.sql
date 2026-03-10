-- Votes table
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- Indexes
create index idx_votes_post on public.votes(post_id);
create index idx_votes_user on public.votes(user_id);

-- Enable RLS
alter table public.votes enable row level security;

-- Anyone can view votes
create policy "Votes are viewable by everyone"
  on public.votes for select
  using (true);

-- Authenticated users can insert votes
create policy "Authenticated users can vote"
  on public.votes for insert
  with check (auth.uid() = user_id);

-- Users can update their own votes
create policy "Users can update own votes"
  on public.votes for update
  using (auth.uid() = user_id);

-- Users can delete their own votes
create policy "Users can delete own votes"
  on public.votes for delete
  using (auth.uid() = user_id);

-- Function to update post vote_count when votes change
create or replace function public.update_post_vote_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set vote_count = vote_count + NEW.value where id = NEW.post_id;

    -- Update author reputation
    if NEW.value = 1 then
      update public.profiles set reputation = reputation + 10 where id = (select author_id from public.posts where id = NEW.post_id);
    else
      update public.profiles set reputation = reputation - 2 where id = (select author_id from public.posts where id = NEW.post_id);
    end if;

    return NEW;
  elsif TG_OP = 'UPDATE' then
    update public.posts set vote_count = vote_count - OLD.value + NEW.value where id = NEW.post_id;

    -- Update author reputation for the difference
    update public.profiles set reputation = reputation + (
      case when NEW.value = 1 then 10 else -2 end
    ) - (
      case when OLD.value = 1 then 10 else -2 end
    ) where id = (select author_id from public.posts where id = NEW.post_id);

    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts set vote_count = vote_count - OLD.value where id = OLD.post_id;

    -- Reverse reputation
    if OLD.value = 1 then
      update public.profiles set reputation = reputation - 10 where id = (select author_id from public.posts where id = OLD.post_id);
    else
      update public.profiles set reputation = reputation + 2 where id = (select author_id from public.posts where id = OLD.post_id);
    end if;

    return OLD;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_vote_change
  after insert or update or delete on public.votes
  for each row execute function public.update_post_vote_count();

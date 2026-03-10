-- Comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_comments_post on public.comments(post_id);
create index idx_comments_author on public.comments(author_id);

-- Enable RLS
alter table public.comments enable row level security;

-- Anyone can view comments
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

-- Authenticated users can create comments
create policy "Authenticated users can comment"
  on public.comments for insert
  with check (auth.uid() = author_id);

-- Authors can delete their own comments
create policy "Authors can delete own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- Function to update post comment_count and reputation
create or replace function public.update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = NEW.post_id;
    -- +2 reputation for commenting on someone's post
    update public.profiles set reputation = reputation + 2 where id = NEW.author_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts set comment_count = comment_count - 1 where id = OLD.post_id;
    update public.profiles set reputation = reputation - 2 where id = OLD.author_id;
    return OLD;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.update_post_comment_count();

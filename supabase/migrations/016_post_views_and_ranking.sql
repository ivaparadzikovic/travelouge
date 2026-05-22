-- View counter and ratio-based ranking for posts.

alter table public.posts
  add column view_count integer not null default 0;

create index idx_posts_view_count on public.posts(view_count desc);

-- Generated ratio column: upvotes / (upvotes + downvotes), 0 when no votes.
alter table public.posts
  add column vote_ratio double precision generated always as (
    case
      when (upvote_count + downvote_count) = 0 then 0
      else upvote_count::double precision / (upvote_count + downvote_count)
    end
  ) stored;

create index idx_posts_vote_ratio on public.posts(vote_ratio desc, upvote_count desc);

-- RPC: increment view count. Posts table only allows the author to UPDATE under
-- RLS, so we expose a SECURITY DEFINER function for everyone (including anon).
create or replace function public.increment_post_view(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
  set view_count = view_count + 1
  where id = p_post_id;
$$;

revoke all on function public.increment_post_view(uuid) from public;
grant execute on function public.increment_post_view(uuid) to anon, authenticated;

-- Storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true);

-- Anyone can view post images
create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- Authenticated users can upload post images
create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

-- Users can delete their own uploaded images
create policy "Users can delete own post images"
  on storage.objects for delete
  using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- +1 reputation for creating a post
create or replace function public.reputation_on_post_create()
returns trigger as $$
begin
  update public.profiles set reputation = reputation + 1 where id = NEW.author_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_post_created_reputation
  after insert on public.posts
  for each row execute function public.reputation_on_post_create();

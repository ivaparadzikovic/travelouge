-- Storage bucket for profile avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Anyone can view avatars
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users can upload avatars
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Users can replace their own avatar
create policy "Users can update own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own avatar
create policy "Users can delete own avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

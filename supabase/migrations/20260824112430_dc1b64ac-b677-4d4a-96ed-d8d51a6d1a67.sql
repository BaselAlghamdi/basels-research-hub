create policy "admins manage research files" on storage.objects for all to authenticated
using (bucket_id = 'research-files' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'research-files' and public.has_role(auth.uid(), 'admin'));
-- 1. Allow the role lookup used inside policies (own row only; policy already exists)
GRANT SELECT ON public.user_roles TO authenticated;

-- 2. Replace SECURITY DEFINER helper usage inside policies with a direct,
--    RLS-respecting lookup so the helper no longer needs to be callable.
DROP POLICY IF EXISTS "admins delete certifications" ON public.certifications;
DROP POLICY IF EXISTS "admins insert certifications" ON public.certifications;
DROP POLICY IF EXISTS "admins read all certifications" ON public.certifications;
DROP POLICY IF EXISTS "admins update certifications" ON public.certifications;

CREATE POLICY "admins read all certifications" ON public.certifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins insert certifications" ON public.certifications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins update certifications" ON public.certifications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins delete certifications" ON public.certifications FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "admins delete projects" ON public.projects;
DROP POLICY IF EXISTS "admins insert projects" ON public.projects;
DROP POLICY IF EXISTS "admins read all projects" ON public.projects;
DROP POLICY IF EXISTS "admins update projects" ON public.projects;

CREATE POLICY "admins read all projects" ON public.projects FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins insert projects" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins update projects" ON public.projects FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins delete projects" ON public.projects FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "admins delete research" ON public.research;
DROP POLICY IF EXISTS "admins insert research" ON public.research;
DROP POLICY IF EXISTS "admins read all research" ON public.research;
DROP POLICY IF EXISTS "admins update research" ON public.research;

CREATE POLICY "admins read all research" ON public.research FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins insert research" ON public.research FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins update research" ON public.research FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins delete research" ON public.research FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

DROP POLICY IF EXISTS "admins delete settings" ON public.site_settings;
DROP POLICY IF EXISTS "admins insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "admins update settings" ON public.site_settings;
DROP POLICY IF EXISTS "settings are public" ON public.site_settings;

-- 3. Only the two intended public keys are world-readable.
CREATE POLICY "public settings keys are readable" ON public.site_settings FOR SELECT TO anon, authenticated
  USING (key IN ('profile', 'about'));
CREATE POLICY "admins read all settings" ON public.site_settings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins insert settings" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins update settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
CREATE POLICY "admins delete settings" ON public.site_settings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- 4. Storage policy for the private research files bucket.
DROP POLICY IF EXISTS "admins manage research files" ON storage.objects;
CREATE POLICY "admins manage research files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'research-files' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (bucket_id = 'research-files' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- 5. The SECURITY DEFINER helper is no longer callable through the API.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
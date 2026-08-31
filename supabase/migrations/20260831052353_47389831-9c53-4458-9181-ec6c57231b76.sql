-- 1. Remove first-user-becomes-admin bootstrap
DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_admin ON auth.users;
DROP FUNCTION IF EXISTS public.bootstrap_first_admin();

-- 2. Certifications
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL,
  description text NOT NULL DEFAULT '',
  issue_date date,
  expiration_date date,
  does_not_expire boolean NOT NULL DEFAULT true,
  credential_id text,
  credential_url text,
  certificate_image_path text,
  certificate_pdf_path text,
  issuer_logo_path text,
  skills text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published certifications are public"
  ON public.certifications FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "admins read all certifications"
  ON public.certifications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert certifications"
  ON public.certifications FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update certifications"
  ON public.certifications FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete certifications"
  ON public.certifications FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER certifications_touch
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX certifications_order_idx ON public.certifications (display_order, created_at DESC);

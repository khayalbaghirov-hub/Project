CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, role text NOT NULL CHECK (role = 'admin'), UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_role_read ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'); $$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
CREATE TABLE public.leads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
 contact text NOT NULL CHECK (char_length(trim(contact)) BETWEEN 3 AND 150),
 procedure text NOT NULL CHECK (procedure IN ('rhinoplasty','facelift','other')),
 timing text NOT NULL CHECK (timing IN ('within_3_months','3_to_6_months','later','not_sure')),
 country_city text NOT NULL CHECK (char_length(trim(country_city)) BETWEEN 1 AND 150),
 matters_most text NOT NULL CHECK (matters_most IN ('experience','price','language','recovery')),
 would_pay text NOT NULL CHECK (would_pay IN ('yes','maybe','no')),
 comment text NOT NULL DEFAULT '' CHECK (char_length(comment) <= 2000),
 consent boolean NOT NULL CHECK (consent = true),
 language text NOT NULL CHECK (language IN ('ru','en')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_lead_insert ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (consent = true);
CREATE POLICY admin_lead_read ON public.leads FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);

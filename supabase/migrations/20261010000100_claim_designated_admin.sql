CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = uid AND lower(email) = 'khayal.baghirov@gmail.com' AND email_confirmed_at IS NOT NULL) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = uid AND role = 'admin');
END $$;
REVOKE ALL ON FUNCTION public.claim_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

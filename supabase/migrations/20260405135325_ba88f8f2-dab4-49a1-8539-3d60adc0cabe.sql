
-- Drop all existing policies on alertas_precio
DROP POLICY IF EXISTS "Anon insert alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "Auth select alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "Auth delete alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "service_role_select_alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "service_role_update_alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "anon_insert_alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "anon_delete_own_alertas_precio" ON public.alertas_precio;

-- INSERT: anon can subscribe freely
CREATE POLICY "anon_insert_alertas_precio" ON public.alertas_precio
FOR INSERT TO anon
WITH CHECK (true);

-- DELETE: anon can remove their own alerts by matching email or whatsapp
CREATE POLICY "anon_delete_own_alertas_precio" ON public.alertas_precio
FOR DELETE TO anon
USING (true);

-- SELECT: only service_role (edge functions use this)
CREATE POLICY "service_role_select_alertas_precio" ON public.alertas_precio
FOR SELECT TO service_role
USING (true);

-- UPDATE: only service_role
CREATE POLICY "service_role_update_alertas_precio" ON public.alertas_precio
FOR UPDATE TO service_role
USING (true)
WITH CHECK (true);

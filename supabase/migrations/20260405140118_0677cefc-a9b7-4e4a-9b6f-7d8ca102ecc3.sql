-- Recreate anon INSERT policy (drop + create to ensure clean state)
DROP POLICY IF EXISTS "anon_insert_alertas_precio" ON public.alertas_precio;

CREATE POLICY "anon_insert_alertas_precio" ON public.alertas_precio
FOR INSERT TO anon
WITH CHECK (true);

-- Also allow authenticated users to insert (e.g. admin testing from public page)
CREATE POLICY "authenticated_insert_alertas_precio" ON public.alertas_precio
FOR INSERT TO authenticated
WITH CHECK (true);
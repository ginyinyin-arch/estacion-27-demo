
DROP POLICY IF EXISTS "service_role_select_alertas_precio" ON public.alertas_precio;

CREATE POLICY "authenticated_select_alertas_precio"
ON public.alertas_precio
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "service_role_select_alertas_precio"
ON public.alertas_precio
FOR SELECT
TO service_role
USING (true);

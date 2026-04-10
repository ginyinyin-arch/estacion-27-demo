ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_insert_pedidos ON public.pedidos;
CREATE POLICY anon_insert_pedidos
ON public.pedidos
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS authenticated_update_pedidos ON public.pedidos;
CREATE POLICY authenticated_update_pedidos
ON public.pedidos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
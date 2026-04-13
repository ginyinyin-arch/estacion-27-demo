CREATE POLICY "anon_select_pedido_by_id"
ON public.pedidos
FOR SELECT
TO anon
USING (true);
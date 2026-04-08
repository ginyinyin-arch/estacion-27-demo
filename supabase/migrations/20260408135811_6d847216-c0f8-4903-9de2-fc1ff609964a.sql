
-- Add takeaway_activo column to configuracion
ALTER TABLE public.configuracion
ADD COLUMN IF NOT EXISTS takeaway_activo BOOLEAN NOT NULL DEFAULT false;

-- Ensure at least one row exists
INSERT INTO public.configuracion (takeaway_activo)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM public.configuracion);

-- Create pedidos table
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  nombre_cliente TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- INSERT: anon can create orders
CREATE POLICY "anon_insert_pedidos"
ON public.pedidos FOR INSERT
TO anon
WITH CHECK (true);

-- SELECT: authenticated users can view orders
CREATE POLICY "authenticated_select_pedidos"
ON public.pedidos FOR SELECT
TO authenticated
USING (true);

-- SELECT: service_role can view orders
CREATE POLICY "service_role_select_pedidos"
ON public.pedidos FOR SELECT
TO service_role
USING (true);

-- UPDATE: service_role only
CREATE POLICY "service_role_update_pedidos"
ON public.pedidos FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);


-- ============================================
-- PROBLEMA 1: alertas_precio - Restrict RLS
-- ============================================

-- Drop all existing policies on alertas_precio
DROP POLICY IF EXISTS "Auth delete alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "Auth select alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "Auth update alertas_precio" ON public.alertas_precio;
DROP POLICY IF EXISTS "Public insert alertas_precio" ON public.alertas_precio;

-- SELECT: No policy for anon/authenticated. Service_role bypasses RLS automatically.
-- This means only service_role (Edge Functions) can read.

-- INSERT: anon can subscribe with validation
CREATE POLICY "Anon insert alertas_precio"
ON public.alertas_precio
FOR INSERT
TO anon
WITH CHECK (
  (canal = ANY (ARRAY['email'::text, 'whatsapp'::text]))
  AND (length(TRIM(BOTH FROM contacto)) > 0)
  AND (activa = true)
);

-- DELETE: anon can delete only their own records (for /baja page)
CREATE POLICY "Anon delete own alertas_precio"
ON public.alertas_precio
FOR DELETE
TO anon
USING (true);

-- Note: The actual filtering by contacto is done in the Edge Function (cancelar-alertas)
-- which uses service_role. The anon DELETE policy is not needed since /baja calls
-- the edge function. But let's restrict it properly anyway - remove the anon delete
-- and rely on the edge function with service_role.
DROP POLICY IF EXISTS "Anon delete own alertas_precio" ON public.alertas_precio;

-- Authenticated (admin) can still SELECT for AdminIntereses page
CREATE POLICY "Auth select alertas_precio"
ON public.alertas_precio
FOR SELECT
TO authenticated
USING (true);

-- Authenticated (admin) can DELETE for AdminIntereses page
CREATE POLICY "Auth delete alertas_precio"
ON public.alertas_precio
FOR DELETE
TO authenticated
USING (true);

-- UPDATE: only service_role (no policy needed, it bypasses RLS)

-- ============================================
-- PROBLEMA 2: reservas - Remove from Realtime
-- ============================================
-- Idempotent: only drops if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'reservas'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.reservas;
  END IF;
END $$;

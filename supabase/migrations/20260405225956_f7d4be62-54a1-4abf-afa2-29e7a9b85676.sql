
-- Drop the existing permissive anon insert policy
DROP POLICY IF EXISTS "anon_insert_alertas_precio" ON public.alertas_precio;

-- Recreate with server-side validation constraints
CREATE POLICY "anon_insert_alertas_precio"
ON public.alertas_precio
FOR INSERT
TO anon
WITH CHECK (
  canal IN ('email', 'whatsapp')
  AND length(contacto) BETWEEN 3 AND 100
  AND (email IS NULL OR (length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'))
  AND (whatsapp IS NULL OR whatsapp ~ '^\+?[0-9]{7,15}$')
  AND activa = true
);

-- Also tighten the authenticated insert policy
DROP POLICY IF EXISTS "authenticated_insert_alertas_precio" ON public.alertas_precio;

CREATE POLICY "authenticated_insert_alertas_precio"
ON public.alertas_precio
FOR INSERT
TO authenticated
WITH CHECK (
  canal IN ('email', 'whatsapp')
  AND length(contacto) BETWEEN 3 AND 100
  AND (email IS NULL OR (length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'))
  AND (whatsapp IS NULL OR whatsapp ~ '^\+?[0-9]{7,15}$')
  AND activa = true
);

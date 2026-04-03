-- 1. Remove reservas from Realtime publication (contains customer PII)
ALTER PUBLICATION supabase_realtime DROP TABLE public.reservas;

-- 2. Replace permissive public INSERT on reservas with validated version
DROP POLICY "Public insert reservas" ON public.reservas;
CREATE POLICY "Public insert reservas" ON public.reservas
  FOR INSERT TO public
  WITH CHECK (
    length(trim(nombre)) > 0
    AND length(trim(telefono)) >= 6
    AND fecha >= CURRENT_DATE
    AND personas >= 1 AND personas <= 20
    AND estado = 'pendiente'
    AND length(trim(hora)) > 0
  );

-- 3. Replace permissive public INSERT on alertas_precio with validated version
DROP POLICY "Public insert alertas_precio" ON public.alertas_precio;
CREATE POLICY "Public insert alertas_precio" ON public.alertas_precio
  FOR INSERT TO public
  WITH CHECK (
    canal IN ('email', 'whatsapp')
    AND length(trim(contacto)) > 0
    AND activa = true
  );
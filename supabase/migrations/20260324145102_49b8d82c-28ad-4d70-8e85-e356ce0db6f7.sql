
CREATE TABLE public.alertas_precio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plato_id uuid NOT NULL REFERENCES public.platos(id) ON DELETE CASCADE,
  canal text NOT NULL CHECK (canal IN ('email', 'whatsapp')),
  contacto text NOT NULL,
  activa boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.alertas_precio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert alertas_precio" ON public.alertas_precio FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Auth select alertas_precio" ON public.alertas_precio FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth update alertas_precio" ON public.alertas_precio FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete alertas_precio" ON public.alertas_precio FOR DELETE TO authenticated USING (true);

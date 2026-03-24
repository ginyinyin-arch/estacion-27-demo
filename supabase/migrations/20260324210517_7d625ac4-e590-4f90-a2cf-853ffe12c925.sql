
CREATE TABLE public.configuracion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_numero text NOT NULL DEFAULT '+543515511843',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read configuracion" ON public.configuracion FOR SELECT TO public USING (true);
CREATE POLICY "Auth update configuracion" ON public.configuracion FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.configuracion (whatsapp_numero) VALUES ('+543515511843');

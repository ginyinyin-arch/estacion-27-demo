
CREATE TABLE public.reservas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  telefono text NOT NULL,
  email text,
  fecha date NOT NULL,
  hora text NOT NULL,
  personas integer NOT NULL,
  comentarios text,
  evento_id uuid REFERENCES public.eventos(id),
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert reservas" ON public.reservas FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Auth select reservas" ON public.reservas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth update reservas" ON public.reservas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete reservas" ON public.reservas FOR DELETE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.reservas;

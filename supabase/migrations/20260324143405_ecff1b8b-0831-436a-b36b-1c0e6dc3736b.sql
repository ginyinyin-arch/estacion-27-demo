
-- Table: promociones
CREATE TABLE public.promociones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plato_id uuid NOT NULL REFERENCES public.platos(id) ON DELETE CASCADE,
  tipo_descuento text NOT NULL,
  valor_descuento numeric NOT NULL,
  mensaje text,
  activa boolean NOT NULL DEFAULT false,
  expira_en timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promociones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read promociones" ON public.promociones FOR SELECT TO public USING (true);
CREATE POLICY "Auth insert promociones" ON public.promociones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update promociones" ON public.promociones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete promociones" ON public.promociones FOR DELETE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.promociones;

-- Table: menu_del_dia
CREATE TABLE public.menu_del_dia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrada text,
  plato_principal text NOT NULL,
  postre text,
  bebida_incluida boolean NOT NULL DEFAULT false,
  precio numeric NOT NULL,
  valido_hasta_hora text NOT NULL DEFAULT '16:00',
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_del_dia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read menu_del_dia" ON public.menu_del_dia FOR SELECT TO public USING (true);
CREATE POLICY "Auth insert menu_del_dia" ON public.menu_del_dia FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update menu_del_dia" ON public.menu_del_dia FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete menu_del_dia" ON public.menu_del_dia FOR DELETE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_del_dia;

-- Table: eventos
CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  fecha date NOT NULL,
  hora_inicio text NOT NULL,
  imagen_url text,
  precio_entrada numeric NOT NULL DEFAULT 0,
  requiere_reserva boolean NOT NULL DEFAULT false,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read eventos" ON public.eventos FOR SELECT TO public USING (true);
CREATE POLICY "Auth insert eventos" ON public.eventos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update eventos" ON public.eventos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete eventos" ON public.eventos FOR DELETE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos;

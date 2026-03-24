
-- Tabla platos
CREATE TABLE public.platos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  imagen_url text,
  disponible boolean NOT NULL DEFAULT true,
  disponible_hasta date,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabla horarios
CREATE TABLE public.horarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia text NOT NULL UNIQUE,
  hora_apertura text NOT NULL DEFAULT '08:00',
  hora_cierre text NOT NULL DEFAULT '02:00',
  cerrado boolean NOT NULL DEFAULT false
);

-- Tabla galeria
CREATE TABLE public.galeria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imagen_url text NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabla estado_local (solo 1 fila)
CREATE TABLE public.estado_local (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  abierto boolean NOT NULL DEFAULT true,
  motivo_cierre text,
  fecha_vuelta date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insertar fila única de estado_local
INSERT INTO public.estado_local (abierto) VALUES (true);

-- Enable RLS
ALTER TABLE public.platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estado_local ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can read)
CREATE POLICY "Public read platos" ON public.platos FOR SELECT USING (true);
CREATE POLICY "Public read horarios" ON public.horarios FOR SELECT USING (true);
CREATE POLICY "Public read galeria" ON public.galeria FOR SELECT USING (true);
CREATE POLICY "Public read estado_local" ON public.estado_local FOR SELECT USING (true);

-- Authenticated write policies
CREATE POLICY "Auth insert platos" ON public.platos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update platos" ON public.platos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete platos" ON public.platos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth update horarios" ON public.horarios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth insert galeria" ON public.galeria FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update galeria" ON public.galeria FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete galeria" ON public.galeria FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth update estado_local" ON public.estado_local FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.platos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.horarios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.galeria;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estado_local;

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('imagenes', 'imagenes', true);

-- Storage policies
CREATE POLICY "Public read imagenes" ON storage.objects FOR SELECT USING (bucket_id = 'imagenes');
CREATE POLICY "Auth upload imagenes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'imagenes');
CREATE POLICY "Auth update imagenes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'imagenes');
CREATE POLICY "Auth delete imagenes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'imagenes');

-- Seed horarios
INSERT INTO public.horarios (dia, hora_apertura, hora_cierre, cerrado) VALUES
  ('lunes', '08:00', '02:00', false),
  ('martes', '08:00', '02:00', false),
  ('miércoles', '08:00', '02:00', false),
  ('jueves', '08:00', '02:00', false),
  ('viernes', '08:00', '02:00', false),
  ('sábado', '08:00', '02:00', false),
  ('domingo', '20:00', '02:00', false);

-- Seed platos - LOMOS
INSERT INTO public.platos (categoria, nombre, descripcion, precio, orden) VALUES
  ('Lomos', 'Lomo Estación ★', 'Queso, panceta, tomate, huevo, cebolla caramelizada, salsa golf y papas fritas.', 24000, 1),
  ('Lomos', 'Lomo Insurrecto', 'Rúcula, tomates asados, huevo, parmesano, olivas negras, mayonesa y papas fritas.', 24000, 2),
  ('Lomos', 'Lomo al Roquefort', 'Rúcula, tomate, olivas negras, roquefort, jamón, queso, huevo y papas fritas.', 24000, 3),
  ('Lomos', 'Lomo Completo', 'Jamón, queso, lechuga, tomate, huevo, mayonesa y papas fritas.', 20000, 4),
  ('Lomos', 'Lomo Simple', 'Queso, tomate, lechuga, mayonesa y papas fritas.', 18000, 5);

-- Seed platos - HAMBURGUESAS
INSERT INTO public.platos (categoria, nombre, descripcion, precio, orden) VALUES
  ('Hamburguesas', 'Cheddar Doble Burguer', 'Doble bife, aderezo americano, cheddar, tomate, pepinillos, lechuga, huevo y papas fritas.', 13300, 1),
  ('Hamburguesas', 'Completa Doble Burguer', 'Doble bife, queso, tomate, lechuga, huevo, aderezo americano y papas fritas.', 12000, 2),
  ('Hamburguesas', 'Insurrecta Triple Burguer', 'Triple bife, aderezo americano, rúcula, tomates asados, huevo, parmesano, olivas negras y papas fritas.', 15500, 3),
  ('Hamburguesas', 'Cheddar Triple Burguer', 'Triple bife, aderezo americano, cheddar, tomate, pepinillos, lechuga, huevo y papas fritas.', 15500, 4);

-- Seed platos - TEX MEX
INSERT INTO public.platos (categoria, nombre, descripcion, precio, orden) VALUES
  ('Tex Mex', 'Tacos', 'De carne, pollo o mixtos, cebolla y pimientos salteados, guacamole, mayonesa casera y salsa de ají poblano.', 18000, 1),
  ('Tex Mex', 'Quesadilla Insurrecta', 'Carne, pollo o mixtos, queso, champignones, rúcula, guacamole, mayonesa casera y salsa de ají poblano.', 19500, 2),
  ('Tex Mex', 'Quesadilla Vegetariana', 'Champignones, muzzarella, rúcula, cebollas y pimientos, guacamole y mayonesa casera.', 17000, 3),
  ('Tex Mex', 'Nachos con Cheddar y Guacamole', NULL, 9000, 4);

-- Seed platos - ENSALADAS
INSERT INTO public.platos (categoria, nombre, descripcion, precio, orden) VALUES
  ('Ensaladas', 'Insurrecta', 'Rúcula, tomates asados, parmesano, nueces, olivas negras y pollo grillado.', 15000, 1),
  ('Ensaladas', 'Ibérica', 'Lechuga, rúcula, jamón crudo, tomate, muzzarella fresca, aceitunas negras y pan de pizza.', 15000, 2),
  ('Ensaladas', 'Ensalada César', 'Lechuga, parmesano, huevo duro, pollo, croutones y aderezo césar.', 15000, 3),
  ('Ensaladas', 'Ensalada de Rogelio', 'Rúcula, tomates asados, nueces, olivas negras y parmesano.', 14000, 4);

-- Seed platos - PICADAS
INSERT INTO public.platos (categoria, nombre, descripcion, precio, orden) VALUES
  ('Picadas', 'Provoleta a la chapa', NULL, 9000, 1),
  ('Picadas', 'Papas Fritas con Cheddar', 'Con cheddar, cebolla dorada y panceta.', 13000, 2),
  ('Picadas', 'Milanesa Picada', 'Con mayonesa y mostaza.', 17000, 3),
  ('Picadas', 'Pan de Pizza', 'A la parrilla con crema de roquefort o guacamole.', 9000, 4),
  ('Picadas', 'Dados de queso', NULL, 4000, 5);

-- Seed platos - BAR (placeholder)
INSERT INTO public.platos (categoria, nombre, descripcion, precio, orden) VALUES
  ('Bar', 'Carta de tragos', 'Gin tonic de autor, vermouths clásicos y cocteles de la casa. Preguntanos en el salón.', 0, 1);

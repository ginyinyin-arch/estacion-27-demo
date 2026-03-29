
ALTER TABLE public.promociones
  ADD COLUMN IF NOT EXISTS cantidad integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cantidad_restante integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS agotar_al_terminar boolean NOT NULL DEFAULT false;

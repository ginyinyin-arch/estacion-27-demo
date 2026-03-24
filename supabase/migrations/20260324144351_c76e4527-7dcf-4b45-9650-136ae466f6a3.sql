
ALTER TABLE public.platos ADD COLUMN nombre_en text;
ALTER TABLE public.platos ADD COLUMN descripcion_en text;

ALTER TABLE public.menu_del_dia ADD COLUMN entrada_en text;
ALTER TABLE public.menu_del_dia ADD COLUMN plato_principal_en text;
ALTER TABLE public.menu_del_dia ADD COLUMN postre_en text;

ALTER TABLE public.eventos ADD COLUMN nombre_en text;
ALTER TABLE public.eventos ADD COLUMN descripcion_en text;

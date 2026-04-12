
-- Create trigger function that calls the edge function via pg_net
CREATE OR REPLACE FUNCTION public.trigger_procesar_reembolso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _body jsonb;
  _service_key text;
BEGIN
  -- Only fire when estado changes TO 'rechazado'
  IF NEW.estado = 'rechazado' AND (OLD.estado IS DISTINCT FROM 'rechazado') THEN
    _url := rtrim(current_setting('app.settings.supabase_url', true), '/') 
             || '/functions/v1/procesar-reembolso-mp';
    
    -- If app.settings not available, use env
    IF _url IS NULL OR _url = '' OR _url = '/functions/v1/procesar-reembolso-mp' THEN
      _url := 'https://ivpdncxflieucmenbxzj.supabase.co/functions/v1/procesar-reembolso-mp';
    END IF;

    _service_key := coalesce(
      current_setting('app.settings.service_role_key', true),
      current_setting('supabase.service_role_key', true),
      ''
    );

    _body := jsonb_build_object(
      'record', row_to_json(NEW)::jsonb,
      'old_record', row_to_json(OLD)::jsonb
    );

    PERFORM net.http_post(
      url := _url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _service_key
      ),
      body := _body
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on pedidos
DROP TRIGGER IF EXISTS on_pedido_rechazado ON public.pedidos;
CREATE TRIGGER on_pedido_rechazado
  AFTER UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_procesar_reembolso();

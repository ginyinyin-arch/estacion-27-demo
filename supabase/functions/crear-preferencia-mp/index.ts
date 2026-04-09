import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pedido_id } = await req.json();
    if (!pedido_id || typeof pedido_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing pedido_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Read MP credentials from configuracion
    const { data: config, error: cfgErr } = await supabase
      .from("configuracion")
      .select("mp_access_token, mp_connected")
      .limit(1)
      .single();

    if (cfgErr || !config) {
      return new Response(
        JSON.stringify({ error: "No se pudo leer la configuración" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!config.mp_connected || !config.mp_access_token) {
      return new Response(
        JSON.stringify({ error: "Pagos no configurados" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read the order
    const { data: pedido, error: pedErr } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedido_id)
      .single();

    if (pedErr || !pedido) {
      return new Response(
        JSON.stringify({ error: "Pedido no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SITE_URL = Deno.env.get("SITE_URL") || "";

    // Build preference items
    const items = (pedido.items as any[]).map((item: any) => ({
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: Number(item.precio),
      currency_id: "ARS",
    }));

    const prefBody: any = {
      items,
      external_reference: pedido_id,
      auto_return: "approved",
      back_urls: {
        success: `${SITE_URL}/pedido-confirmado`,
        failure: `${SITE_URL}/pedido-fallido`,
        pending: `${SITE_URL}/pedido-pendiente`,
      },
    };

    // Add payer info if available
    if (pedido.email || pedido.nombre_cliente) {
      prefBody.payer = {};
      if (pedido.email) prefBody.payer.email = pedido.email;
      if (pedido.nombre_cliente) {
        prefBody.payer.name = pedido.nombre_cliente;
      }
    }

    // Create preference in MercadoPago
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.mp_access_token}`,
      },
      body: JSON.stringify(prefBody),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok || !mpData.id) {
      console.error("MP preference creation failed:", JSON.stringify(mpData));
      return new Response(
        JSON.stringify({ error: mpData.message || "Error al crear preferencia de pago" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update pedido with preference id
    await supabase
      .from("pedidos")
      .update({ mp_preference_id: mpData.id })
      .eq("id", pedido_id);

    return new Response(
      JSON.stringify({ init_point: mpData.init_point }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("crear-preferencia-mp error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
    const body = await req.json();
    const { items, nombre, email, telefono, notas, programado_para } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing nombre" }),
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

    // Calculate total
    const total = items.reduce((sum: number, i: any) => sum + Number(i.precio) * Number(i.cantidad), 0);

    // Insert pedido (service_role bypasses RLS)
    const { data: pedido, error: pedErr } = await supabase
      .from("pedidos")
      .insert({
        items,
        total,
        nombre_cliente: nombre.trim(),
        email: email?.trim() || null,
        telefono: telefono?.trim() || null,
        notas: notas?.trim() || null,
      })
      .select("id")
      .single();

    if (pedErr || !pedido) {
      console.error("Insert pedido failed:", pedErr);
      return new Response(
        JSON.stringify({ error: "Error al crear pedido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pedido_id = pedido.id;
    const SITE_URL = Deno.env.get("SITE_URL") || "";
    const baseUrl = SITE_URL.replace(/\/$/, '');

    // Build preference items
    const mpItems = items.map((item: any) => ({
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: Number(item.precio),
      currency_id: "ARS",
    }));

    const marketplace_fee = Math.round(total * 0.0153);

    const prefBody: any = {
      items: mpItems,
      external_reference: pedido_id,
      auto_return: "approved",
      marketplace_fee,
      back_urls: {
        success: `${baseUrl}/seguimiento/${pedido_id}`,
        failure: `${baseUrl}/pedido-fallido`,
        pending: `${baseUrl}/pedido-pendiente`,
      },
    };

    // Add payer info if available
    if (email?.trim() || nombre.trim()) {
      prefBody.payer = {};
      if (email?.trim()) prefBody.payer.email = email.trim();
      if (nombre.trim()) prefBody.payer.name = nombre.trim();
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

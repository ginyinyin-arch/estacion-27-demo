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
    if (!telefono || typeof telefono !== "string" || telefono.replace(/\D/g, "").length < 8) {
      return new Response(
        JSON.stringify({ error: "Teléfono obligatorio para pago en efectivo (mín. 8 dígitos)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const total = items.reduce(
      (sum: number, i: any) => sum + Number(i.precio) * Number(i.cantidad),
      0
    );

    const { data: pedido, error: pedErr } = await supabase
      .from("pedidos")
      .insert({
        items,
        total,
        nombre_cliente: nombre.trim(),
        email: email?.trim() || null,
        telefono: telefono.trim(),
        notas: notas?.trim() || null,
        programado_para: programado_para || null,
        estado: "pendiente_efectivo",
        metodo_pago: "efectivo",
      })
      .select("id")
      .single();

    if (pedErr || !pedido) {
      console.error("Insert pedido efectivo failed:", pedErr);
      return new Response(
        JSON.stringify({ error: "Error al crear pedido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ pedido_id: pedido.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("crear-pedido-efectivo error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

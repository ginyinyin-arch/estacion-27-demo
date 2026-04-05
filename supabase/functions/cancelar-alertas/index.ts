import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tipo, valor } = await req.json();

    if (!tipo || !valor || (tipo !== "email" && tipo !== "whatsapp")) {
      return new Response(
        JSON.stringify({ error: "Datos inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query;
    if (tipo === "email") {
      query = supabase
        .from("alertas_precio")
        .delete()
        .eq("canal", "email")
        .eq("contacto", valor.trim().toLowerCase());
    } else {
      // Normalize phone
      let cleaned = valor.replace(/[\s\-\(\)]/g, "").replace(/[^+\d]/g, "");
      if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
      query = supabase
        .from("alertas_precio")
        .delete()
        .eq("canal", "whatsapp")
        .eq("contacto", cleaned);
    }

    const { data, error } = await query.select("id");

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const count = data?.length || 0;

    return new Response(
      JSON.stringify({ deleted: count }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

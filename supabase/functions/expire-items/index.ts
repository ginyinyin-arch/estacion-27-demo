import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const now = new Date().toISOString();
    const today = now.split("T")[0];

    // 1. Expire promotions past expira_en
    await supabase.from("promociones").update({ activa: false }).eq("activa", true).lt("expira_en", now);

    // 2. Expire daily menus: deactivate past dates
    await supabase.from("menu_del_dia").update({ activo: false }).eq("activo", true).lt("fecha", today);

    // 3. Deactivate past events
    await supabase.from("eventos").update({ activo: false }).eq("activo", true).lt("fecha", today);

    // 4. Reactivate platos whose disponible_hasta has passed
    await supabase.from("platos").update({ disponible: true, disponible_hasta: null }).eq("disponible", false).lte("disponible_hasta", today).not("disponible_hasta", "is", null);

    // 5. Reactivate estado_local if fecha_vuelta reached
    const { data: estado } = await supabase.from("estado_local").select("*").limit(1).maybeSingle();
    if (estado && !estado.abierto && estado.fecha_vuelta && estado.fecha_vuelta <= today) {
      await supabase.from("estado_local").update({ abierto: true, motivo_cierre: null, fecha_vuelta: null }).eq("id", estado.id);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plato_id, precio_anterior, precio_nuevo } = await req.json();

    if (!plato_id || precio_anterior === undefined || precio_nuevo === undefined) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only notify if price actually dropped
    if (precio_nuevo >= precio_anterior) {
      return new Response(JSON.stringify({ notified: 0, reason: "price did not drop" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get plato name
    const { data: plato } = await supabase
      .from("platos")
      .select("nombre")
      .eq("id", plato_id)
      .single();

    if (!plato) {
      return new Response(JSON.stringify({ error: "Plato not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get active alerts for this plato
    const { data: alertas } = await supabase
      .from("alertas_precio")
      .select("id, canal, contacto")
      .eq("plato_id", plato_id)
      .eq("activa", true);

    if (!alertas || alertas.length === 0) {
      return new Response(JSON.stringify({ notified: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let notifiedCount = 0;

    for (const alerta of alertas) {
      if (alerta.canal === "whatsapp") {
        // For WhatsApp we just log - actual sending would need Twilio
        console.log(`WhatsApp notification to ${alerta.contacto}: ${plato.nombre} bajó de $${precio_anterior} a $${precio_nuevo}`);
        notifiedCount++;
      } else if (alerta.canal === "email") {
        // Log email notification - would integrate with email service
        console.log(`Email notification to ${alerta.contacto}: ${plato.nombre} bajó de $${precio_anterior} a $${precio_nuevo}`);
        notifiedCount++;
      }

      // Deactivate the alert after notification
      await supabase
        .from("alertas_precio")
        .update({ activa: false })
        .eq("id", alerta.id);
    }

    return new Response(JSON.stringify({ notified: notifiedCount, plato: plato.nombre }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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
    const { plato_id, tipo_descuento, valor_descuento, mensaje, fecha_fin } =
      await req.json();

    if (!plato_id || !tipo_descuento || valor_descuento == null || !fecha_fin) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get dish info
    const { data: plato } = await supabase
      .from("platos")
      .select("nombre, precio")
      .eq("id", plato_id)
      .single();

    if (!plato) {
      return new Response(
        JSON.stringify({ error: "Plato no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Calculate promo price
    const precioBase = Number(plato.precio);
    const precioPromo =
      tipo_descuento === "porcentaje"
        ? precioBase * (1 - Number(valor_descuento) / 100)
        : precioBase - Number(valor_descuento);

    // 3. Get active subscribers for this dish
    const { data: suscriptores } = await supabase
      .from("alertas_precio")
      .select("canal, contacto, email, whatsapp")
      .eq("plato_id", plato_id)
      .eq("activa", true);

    if (!suscriptores || suscriptores.length === 0) {
      return new Response(
        JSON.stringify({ notified: 0, reason: "Sin suscriptores" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://estacion-27-demo.lovable.app";

    const fechaFin = new Date(fecha_fin).toLocaleString("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const nombrePlato = plato.nombre;
    const mensajePromo = mensaje || "¡Oferta especial!";

    let notified = 0;

    for (const sub of suscriptores) {
      const emailAddr = sub.email || (sub.canal === "email" ? sub.contacto : null);
      const whatsappNum = sub.whatsapp || (sub.canal === "whatsapp" ? sub.contacto : null);

      // Send email via Resend
      if (emailAddr && RESEND_API_KEY) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Estación 27 <noreply@estacion27.com>",
              to: [emailAddr],
              subject: `🎉 ¡Promo en ${nombrePlato}! — Estación 27`,
              text: `${mensajePromo}. Precio especial: $${Math.round(precioPromo)} (antes $${precioBase}). Válido hasta ${fechaFin}: ${SITE_URL}`,
            }),
          });
          await res.text();
          notified++;
        } catch (e) {
          console.error("Error enviando email:", e);
        }
      }

      // Send WhatsApp via Twilio
      if (whatsappNum && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
          const body = new URLSearchParams({
            To: `whatsapp:${whatsappNum}`,
            From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
            Body: `¡Buenas! El ${nombrePlato} en Estación 27 tiene promo: ${mensajePromo} → $${Math.round(precioPromo)} (antes $${precioBase}) 🎉 Hasta ${fechaFin}: ${SITE_URL}`,
          });

          const res = await fetch(twilioUrl, {
            method: "POST",
            headers: {
              Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
          });
          await res.text();
          notified++;
        } catch (e) {
          console.error("Error enviando WhatsApp:", e);
        }
      }
    }

    return new Response(
      JSON.stringify({ notified, plato: nombrePlato }),
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

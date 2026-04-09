import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Always respond 200 to MP
  const ok = () => new Response("OK", { status: 200 });

  try {
    if (req.method !== "POST") return ok();

    const body = await req.json();

    // MP sends { type, data: { id } } or { action, data: { id } }
    const type = body.type || body.action;
    const paymentId = body.data?.id;

    if (!paymentId) return ok();

    // Only handle payment notifications
    if (type !== "payment" && type !== "payment.updated" && type !== "payment.created") {
      return ok();
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Read MP access token
    const { data: config } = await supabase
      .from("configuracion")
      .select("mp_access_token")
      .limit(1)
      .single();

    if (!config?.mp_access_token) {
      console.error("No MP access token configured");
      return ok();
    }

    // Fetch payment details from MP
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${config.mp_access_token}` },
      }
    );

    if (!mpRes.ok) {
      console.error("Failed to fetch payment from MP:", mpRes.status);
      return ok();
    }

    const payment = await mpRes.json();
    const externalRef = payment.external_reference;
    const status = payment.status;

    if (!externalRef) {
      console.log("Payment without external_reference, skipping");
      return ok();
    }

    if (status === "approved") {
      await supabase
        .from("pedidos")
        .update({
          estado: "pagado",
          mp_payment_id: String(paymentId),
        })
        .eq("id", externalRef);
      console.log(`Pedido ${externalRef} marked as pagado`);
    } else if (status === "cancelled" || status === "rejected") {
      await supabase
        .from("pedidos")
        .update({
          estado: "cancelado",
          mp_payment_id: String(paymentId),
        })
        .eq("id", externalRef);
      console.log(`Pedido ${externalRef} marked as cancelado`);
    }

    return ok();
  } catch (err) {
    console.error("webhook-mp error:", err);
    return new Response("OK", { status: 200 });
  }
});

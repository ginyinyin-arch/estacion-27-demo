import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const ok = (msg = "OK") => new Response(msg, { status: 200 });

  try {
    if (req.method !== "POST") return ok();

    const body = await req.json();

    // Database webhook sends { type, table, record, old_record }
    const record = body.record;
    const oldRecord = body.old_record;

    if (!record || record.estado !== "rechazado") return ok("Not a rejection");

    // Only process if status actually changed to rechazado
    if (oldRecord?.estado === "rechazado") return ok("Already rechazado");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const pedidoId = record.id;

    // ── PASO 1: Reembolso MP ──
    if (record.metodo_pago !== "efectivo" && record.mp_payment_id) {
      const { data: config } = await supabase
        .from("configuracion")
        .select("mp_access_token")
        .limit(1)
        .single();

      if (config?.mp_access_token) {
        try {
          const refundRes = await fetch(
            `https://api.mercadopago.com/v1/payments/${record.mp_payment_id}/refunds`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${config.mp_access_token}`,
                "Content-Type": "application/json",
              },
              body: "{}",
            }
          );

          if (refundRes.ok) {
            const refund = await refundRes.json();
            await supabase
              .from("pedidos")
              .update({ reembolso_id: String(refund.id) })
              .eq("id", pedidoId);
            console.log(`Refund OK for pedido ${pedidoId}, refund id: ${refund.id}`);
          } else {
            const errText = await refundRes.text();
            console.error(`Refund failed for pedido ${pedidoId}: ${refundRes.status} ${errText}`);
          }
        } catch (err) {
          console.error(`Refund error for pedido ${pedidoId}:`, err);
        }
      } else {
        console.log(`No MP access token, skipping refund for pedido ${pedidoId}`);
      }
    }

    // ── PASO 2: Auto-rechazo de pedidos en espera prolongada ──
    const { data: stale, error: staleErr } = await supabase
      .from("pedidos")
      .select("id")
      .eq("estado", "en_espera")
      .lt("espera_desde", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
      .or("programado_para.is.null,programado_para.lt." + new Date().toISOString());

    if (staleErr) {
      console.error("Error querying stale orders:", staleErr);
    } else if (stale && stale.length > 0) {
      const ids = stale.map((p) => p.id);
      console.log(`Auto-rejecting ${ids.length} stale orders: ${ids.join(", ")}`);

      for (const id of ids) {
        await supabase
          .from("pedidos")
          .update({ estado: "rechazado" })
          .eq("id", id);
      }
    }

    return ok("Processed");
  } catch (err) {
    console.error("procesar-reembolso-mp error:", err);
    return ok("Error handled");
  }
});

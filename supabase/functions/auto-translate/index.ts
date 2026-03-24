import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { table, id, fields } = await req.json();
    // fields: { nombre: "Lomo Especial", descripcion: "Con queso y huevo" }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const systemPrompt = "Translate the following Argentine Spanish restaurant text to natural English. Keep names of dishes in Spanish when they are proper names (like 'Lomo Estación'). Return only the translated text, nothing else.";

    const updates: Record<string, string> = {};

    for (const [field, text] of Object.entries(fields)) {
      if (!text || typeof text !== "string" || text.trim() === "") continue;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
        }),
      });

      if (!response.ok) {
        console.error(`AI translation failed for ${field}:`, response.status);
        continue;
      }

      const data = await response.json();
      const translated = data.choices?.[0]?.message?.content?.trim();
      if (translated) {
        updates[`${field}_en`] = translated;
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from(table).update(updates).eq("id", id);
      if (error) console.error("DB update error:", error);
    }

    return new Response(JSON.stringify({ success: true, translated: Object.keys(updates) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-translate error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

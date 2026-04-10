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
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'code' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const MP_APP_ID = Deno.env.get("MP_APP_ID");
    const MP_CLIENT_SECRET = Deno.env.get("MP_CLIENT_SECRET");
    const SITE_URL = Deno.env.get("SITE_URL");

    if (!MP_APP_ID || !MP_CLIENT_SECRET || !SITE_URL) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured: missing MP secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: MP_APP_ID,
        client_secret: MP_CLIENT_SECRET,
        code,
        redirect_uri: `${SITE_URL.replace(/\/+$/, "")}/mp-callback`,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("MP token exchange failed:", JSON.stringify(tokenData));
      return new Response(
        JSON.stringify({ error: tokenData.message || "Token exchange failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to configuracion
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabase
      .from("configuracion")
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token,
        mp_user_id: String(tokenData.user_id),
        mp_connected: true,
        updated_at: new Date().toISOString(),
      })
      .not("id", "is", null); // update all rows (there's only one)

    if (dbError) {
      console.error("DB update failed:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("mp-oauth-exchange error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

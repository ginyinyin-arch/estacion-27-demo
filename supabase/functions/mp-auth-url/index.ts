import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const MP_APP_ID = Deno.env.get("MP_APP_ID");
  const SITE_URL = Deno.env.get("SITE_URL");

  if (!MP_APP_ID || !SITE_URL) {
    return new Response(
      JSON.stringify({ error: "Missing MP_APP_ID or SITE_URL secrets" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const redirectUri = `${SITE_URL.replace(/\/+$/, "")}/mp-callback`;
  const url = `https://auth.mercadopago.com/authorization?client_id=${MP_APP_ID}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return new Response(
    JSON.stringify({ url }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

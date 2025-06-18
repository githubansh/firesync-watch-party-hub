import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS", // ← added
};

serve(async (req) => {
  /* CORS pre-flight ------------------------------------------------------ */
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    /* Verify the caller actually sent a token ---------------------------- */
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    /* Supabase client ---------------------------------------------------- */
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!, // ← non-null assertion
      Deno.env.get("SERVICE_ROLE_KEY")!, // ← same name everywhere
      {
        global: {
          headers: {
            Authorization: authHeader, // ← already checked
            apikey: Deno.env.get("SERVICE_ROLE_KEY")!,
          },
        },
      },
    );

    /* Business logic stays the same ------------------------------------- */
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(); // ← valid call
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { roomCode, username, deviceType, deviceName } = await req.json();

    const { data: room, error: roomError } = await supabaseClient
      .from("rooms")
      .select("*")
      .ilike("code", roomCode) // ← syntax is correct; `%` wildcards are optional
      .in("status", ["waiting", "active"])
      .single();

    if (roomError || !room) {
      /* …unchanged error handling… */
    }

    /* …rest of the original logic… */
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

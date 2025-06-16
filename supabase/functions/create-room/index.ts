
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { name, allowRemoteControl, autoDiscovery } = await req.json()

    // Generate room code
    const { data: codeData, error: codeError } = await supabaseClient
      .rpc('generate_room_code')

    if (codeError) {
      throw codeError
    }

    // Create room
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .insert({
        code: codeData,
        name: name || 'Watch Party',
        host_id: user.id,
        allow_remote_control: allowRemoteControl ?? true,
        auto_discovery: autoDiscovery ?? true,
      })
      .select()
      .single()

    if (roomError) {
      throw roomError
    }

    // Add host as participant
    const { error: participantError } = await supabaseClient
      .from('participants')
      .insert({
        room_id: room.id,
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Host',
        role: 'host',
        device_type: 'firetv',
        device_name: 'Host Device',
      })

    if (participantError) {
      throw participantError
    }

    return new Response(
      JSON.stringify({ room }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

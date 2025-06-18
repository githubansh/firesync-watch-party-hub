
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')!,
            apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
          },
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

    const { name = 'Family Movie Night', allowRemoteControl = true, autoDiscovery = true } = await req.json()

    console.log('Creating room for user:', user.id, { name, allowRemoteControl, autoDiscovery })

    // Generate room code
    const { data: roomCode, error: codeError } = await supabaseClient
      .rpc('generate_room_code')

    if (codeError || !roomCode) {
      console.error('Failed to generate room code:', codeError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate room code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create room
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .insert({
        code: roomCode,
        name,
        host_id: user.id,
        status: 'waiting',
        allow_remote_control: allowRemoteControl,
        auto_discovery: autoDiscovery,
      })
      .select()
      .single()

    if (roomError) {
      console.error('Room creation error:', roomError)
      return new Response(
        JSON.stringify({ error: 'Failed to create room' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add host as participant
    const { error: participantError } = await supabaseClient
      .from('participants')
      .insert({
        room_id: room.id,
        user_id: user.id,
        username: 'Host',
        role: 'host',
        device_type: 'firetv',
        device_name: 'Host Device',
      })

    if (participantError) {
      console.error('Host participant creation error:', participantError)
      // Don't fail room creation if participant creation fails
    }

    console.log('Room created successfully:', room)
    return new Response(
      JSON.stringify({ room }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Create room function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

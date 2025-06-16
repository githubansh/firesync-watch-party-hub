
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

    const { roomCode, username, deviceType, deviceName } = await req.json()

    // Find room by code
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .eq('status', 'waiting')
      .single()

    if (roomError || !room) {
      return new Response(
        JSON.stringify({ error: 'Room not found or no longer available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is already in the room
    const { data: existingParticipant } = await supabaseClient
      .from('participants')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .single()

    if (existingParticipant) {
      // Update existing participant
      const { error: updateError } = await supabaseClient
        .from('participants')
        .update({
          username,
          device_type: deviceType,
          device_name: deviceName,
          is_connected: true,
          last_seen: new Date().toISOString(),
        })
        .eq('id', existingParticipant.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Add new participant
      const { error: participantError } = await supabaseClient
        .from('participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          username,
          role: 'member',
          device_type: deviceType,
          device_name: deviceName,
        })

      if (participantError) {
        throw participantError
      }
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

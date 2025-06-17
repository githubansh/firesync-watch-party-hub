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
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',      // ← updated here
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

    console.log('Join room request:', { roomCode, username, deviceType, deviceName, userId: user.id })

    // Find room by code - using service role to bypass RLS
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .eq('status', 'waiting')
      .single()

    if (roomError || !room) {
      console.error('Room lookup error:', roomError)
      return new Response(
        JSON.stringify({ error: 'Room not found or no longer available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Found room:', room)

    // Check if user is already in the room - using service role to bypass RLS
    const { data: existingParticipant, error: participantLookupError } = await supabaseClient
      .from('participants')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (participantLookupError) {
      console.error('Participant lookup error:', participantLookupError)
      return new Response(
        JSON.stringify({ error: 'Failed to check existing participation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingParticipant) {
      console.log('Updating existing participant:', existingParticipant.id)
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
        console.error('Update participant error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update participation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      console.log('Creating new participant')
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
        console.error('Create participant error:', participantError)
        return new Response(
          JSON.stringify({ error: 'Failed to join room' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('Successfully joined room')
    return new Response(
      JSON.stringify({ room }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Join room function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


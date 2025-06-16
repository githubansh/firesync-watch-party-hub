
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

    const { roomId, eventType, eventData, timestampMs } = await req.json()

    // Verify user is in the room
    const { data: participant } = await supabaseClient
      .from('participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return new Response(
        JSON.stringify({ error: 'Not authorized for this room' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create sync event
    const { error: syncError } = await supabaseClient
      .from('sync_events')
      .insert({
        room_id: roomId,
        user_id: user.id,
        event_type: eventType,
        event_data: eventData,
        timestamp_ms: timestampMs,
      })

    if (syncError) {
      throw syncError
    }

    // Update room state based on event type
    if (eventType === 'play' || eventType === 'pause') {
      const { error: roomUpdateError } = await supabaseClient
        .from('rooms')
        .update({
          is_playing: eventType === 'play',
          current_position: eventData?.position || 0,
        })
        .eq('id', roomId)

      if (roomUpdateError) {
        throw roomUpdateError
      }
    } else if (eventType === 'seek') {
      const { error: roomUpdateError } = await supabaseClient
        .from('rooms')
        .update({
          current_position: eventData?.position || 0,
        })
        .eq('id', roomId)

      if (roomUpdateError) {
        throw roomUpdateError
      }
    } else if (eventType === 'content_change') {
      const { error: roomUpdateError } = await supabaseClient
        .from('rooms')
        .update({
          current_content_url: eventData?.url,
          current_position: 0,
          is_playing: false,
        })
        .eq('id', roomId)

      if (roomUpdateError) {
        throw roomUpdateError
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

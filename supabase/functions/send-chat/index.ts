
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

    const { roomId, message, messageType = 'text', voiceDuration } = await req.json()

    console.log('Chat message:', { roomId, message, messageType, voiceDuration, userId: user.id })

    // Verify user is in the room and get their username
    const { data: participant } = await supabaseClient
      .from('participants')
      .select('username')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return new Response(
        JSON.stringify({ error: 'Not authorized for this room' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare the chat message data
    const chatData: any = {
      room_id: roomId,
      user_id: user.id,
      username: participant.username,
      message,
      message_type: messageType,
    }

    // Add voice duration if it's a voice message
    if (messageType === 'voice' && voiceDuration) {
      chatData.voice_duration = voiceDuration
    }

    // Insert chat message
    const { error: chatError } = await supabaseClient
      .from('chat_messages')
      .insert(chatData)

    if (chatError) {
      console.error('Chat message error:', chatError)
      throw chatError
    }

    console.log('Chat message sent successfully')
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Send chat function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

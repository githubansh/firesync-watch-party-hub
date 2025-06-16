
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncEvent {
  id: string;
  room_id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  timestamp_ms: number;
  created_at: string;
}

interface Room {
  id: string;
  code: string;
  name: string;
  status: string;
  current_position: number;
  is_playing: boolean;
  current_content_url?: string;
}

export const useRealtimeSync = (roomId: string | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);

  useEffect(() => {
    if (!roomId) return;

    // Subscribe to room changes
    const roomChannel = supabase
      .channel('room-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new as Room);
        }
      )
      .subscribe();

    // Subscribe to participant changes
    const participantChannel = supabase
      .channel('participant-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          // Refetch participants when changes occur
          const { data } = await supabase
            .from('participants')
            .select('*')
            .eq('room_id', roomId);
          
          if (data) {
            setParticipants(data);
          }
        }
      )
      .subscribe();

    // Subscribe to sync events
    const syncChannel = supabase
      .channel('sync-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sync_events',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setSyncEvents(prev => [...prev, payload.new as SyncEvent]);
        }
      )
      .subscribe();

    // Initial data fetch
    const fetchInitialData = async () => {
      const [roomResult, participantsResult] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', roomId).single(),
        supabase.from('participants').select('*').eq('room_id', roomId),
      ]);

      if (roomResult.data) setRoom(roomResult.data);
      if (participantsResult.data) setParticipants(participantsResult.data);
    };

    fetchInitialData();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(participantChannel);
      supabase.removeChannel(syncChannel);
    };
  }, [roomId]);

  const sendSyncEvent = async (eventType: string, eventData: any) => {
    if (!roomId) return;

    try {
      await supabase.functions.invoke('sync-playback', {
        body: {
          roomId,
          eventType,
          eventData,
          timestampMs: Date.now(),
        },
      });
    } catch (error) {
      console.error('Failed to send sync event:', error);
    }
  };

  return {
    room,
    participants,
    syncEvents,
    sendSyncEvent,
  };
};

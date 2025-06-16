
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateRoomData {
  name?: string;
  allowRemoteControl?: boolean;
  autoDiscovery?: boolean;
}

interface JoinRoomData {
  roomCode: string;
  username: string;
  deviceType: 'firetv' | 'mobile';
  deviceName?: string;
}

export const useRoomManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = async (data: CreateRoomData) => {
    setIsLoading(true);
    try {
      console.log('Creating room with data:', data);
      
      const { data: result, error } = await supabase.functions.invoke('create-room', {
        body: data,
      });

      if (error) {
        console.error('Create room error:', error);
        throw error;
      }

      console.log('Room created successfully:', result);
      
      toast({
        title: "Room Created!",
        description: `Your party room ${result.room.code} is ready`,
      });

      return result.room;
    } catch (error: any) {
      console.error('Create room failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (data: JoinRoomData) => {
    setIsLoading(true);
    try {
      console.log('Joining room with data:', data);
      
      const { data: result, error } = await supabase.functions.invoke('join-room', {
        body: data,
      });

      if (error) {
        console.error('Join room error:', error);
        throw error;
      }

      console.log('Joined room successfully:', result);
      
      toast({
        title: "Connected!",
        description: `Joined room ${data.roomCode} successfully`,
      });

      return result.room;
    } catch (error: any) {
      console.error('Join room failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join room",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRoom,
    joinRoom,
    isLoading,
  };
};

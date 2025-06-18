
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useChatManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (roomId: string, message: string, messageType: string = 'text') => {
    setIsLoading(true);
    try {
      console.log('Sending chat message:', { roomId, message, messageType });
      
      const { data: result, error } = await supabase.functions.invoke('send-chat', {
        body: {
          roomId,
          message,
          messageType,
        },
      });

      if (error) {
        console.error('Send message error:', error);
        throw error;
      }

      console.log('Message sent successfully:', result);
      return true;
    } catch (error: any) {
      console.error('Send message failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
};

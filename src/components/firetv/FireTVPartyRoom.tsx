import { useEffect, useState, useRef } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useChatManagement } from '@/hooks/useChatManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Send, Users, Video } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { ChatMessage } from '@/types/chat';

interface FireTVPartyRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export const FireTVPartyRoom = ({ roomId, onLeaveRoom }: FireTVPartyRoomProps) => {
  const { room, participants, chatMessages, connectionStatus } = useRealtimeSync(roomId);
  const { sendMessage } = useChatManagement();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const chatMessagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    if (room?.status === 'ended') {
      toast({
        title: 'Party Ended',
        description: 'The host has ended the watch party.',
      });
      onLeaveRoom();
    }
  }, [room, onLeaveRoom, toast]);

  useEffect(() => {
    // Only show toast for new messages, not initial load
    if (chatMessages.length > chatMessagesRef.current.length) {
      const latestMessage = chatMessages[chatMessages.length - 1];
      if (latestMessage && latestMessage.user_id !== currentUser?.id) {
        toast({
          title: `New Message from ${latestMessage.username || 'a guest'}`,
          description: latestMessage.message_type === 'text' ? latestMessage.message : `Sent a ${latestMessage.message_type}`,
        });
      }
    }
    chatMessagesRef.current = chatMessages;
  }, [chatMessages, currentUser, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(roomId, newMessage, 'text');
      setNewMessage('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-4rem)]">
      {/* Main Content: Video Player */}
      <div className="lg:col-span-2 bg-card/50 rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Video size={64} className="mx-auto mb-4" />
          <p>Video Player Area</p>
          <p className="text-sm">Sync Status: {connectionStatus}</p>
          {room && <p className="text-sm">Content: {room.current_content_url || 'N/A'}</p>}
        </div>
      </div>

      {/* Sidebar: Participants and Chat */}
      <div className="flex flex-col gap-4">
        <Card className="flex-shrink-0 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center"><Users className="mr-2" /> Participants</CardTitle>
            <Button variant="ghost" size="sm" onClick={onLeaveRoom}><LogOut className="mr-2" /> Leave</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://api.dicebear.com/6.x/bottts/svg?seed=${p.username}`} />
                      <AvatarFallback>{p.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{p.username} {p.user_id === room?.host_id && '(Host)'}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex-grow flex flex-col bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Party Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.user_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${msg.user_id === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      <p className="font-bold text-xs">{msg.username}</p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow"
              />
              <Button type="submit" size="icon"><Send /></Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}; 
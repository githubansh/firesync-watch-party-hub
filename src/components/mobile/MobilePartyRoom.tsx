import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Share2, MessageCircle, Tv } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useState, useEffect, useRef } from 'react';
import { RoomSharing } from '../RoomSharing';
import { EnhancedChatSystem } from '../EnhancedChatSystem';
import { FireTVRemoteControl } from '../FireTVRemoteControl';
import { ChatMessage } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface MobilePartyRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export const MobilePartyRoom = ({ roomId, onLeaveRoom }: MobilePartyRoomProps) => {
  const { room, participants, chatMessages, sendSyncEvent, leaveRoom, endParty, connectionStatus } = useRealtimeSync(roomId);
  const [activeTab, setActiveTab] = useState<'remote' | 'chat' | 'share'>('remote');
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();
  const chatMessagesRef = useRef<ChatMessage[]>([]);

  // Get current user information
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // First try to get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Find the participant entry for this user
          const currentParticipant = participants.find(p => p.user_id === user.id);
          if (currentParticipant) {
            setCurrentUsername(currentParticipant.username);
            setCurrentUserId(user.id);
            return;
          }
        }
        
        // If no authenticated user or participant not found, try to get from localStorage
        const storedUsername = localStorage.getItem(`room_${roomId}_username`);
        const storedUserId = localStorage.getItem(`room_${roomId}_userid`);
        
        if (storedUsername && storedUserId) {
          setCurrentUsername(storedUsername);
          setCurrentUserId(storedUserId);
          return;
        }
        
        // Fallback: try to find a participant that might be the current user
        // This is a heuristic - we'll assume the first mobile participant might be the current user
        const mobileParticipant = participants.find(p => p.device_type === 'mobile');
        if (mobileParticipant) {
          setCurrentUsername(mobileParticipant.username);
          setCurrentUserId(mobileParticipant.user_id);
          // Store for future reference
          localStorage.setItem(`room_${roomId}_username`, mobileParticipant.username);
          localStorage.setItem(`room_${roomId}_userid`, mobileParticipant.user_id);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    if (participants.length > 0) {
      getCurrentUser();
    }
  }, [participants, roomId]);

  useEffect(() => {
    if (chatMessages.length > chatMessagesRef.current.length) {
      const newMessage = chatMessages[chatMessages.length - 1];
      if (activeTab !== 'chat' && newMessage.user_id !== currentUserId) {
        toast({
          title: `New Message from ${newMessage.username}`,
          description: newMessage.message_type === 'text' ? newMessage.message : `Sent a ${newMessage.message_type}`,
        });
      }
    }
    chatMessagesRef.current = chatMessages;
  }, [chatMessages, activeTab, currentUserId, toast]);

  // Auto-leave when party is ended
  useEffect(() => {
    if (room?.status === 'ended') {
      console.log('Party ended, leaving room automatically');
      toast({
        title: 'Party Ended',
        description: 'The host has ended the watch party.',
      });
      onLeaveRoom();
    }
  }, [room?.status, onLeaveRoom, toast]);

  // Mock data for demonstration
  const mockRoom = room || {
    id: roomId,
    code: 'ABC123',
    name: 'Family Movie Night',
    status: 'active',
    is_playing: false,
    current_position: 0,
    host_id: currentUserId || 'mock-host-id',
  };

  const mockParticipants = participants.length > 0 ? participants : [
    { id: '1', username: 'You', role: 'member', device_type: 'mobile', device_name: 'iPhone', is_connected: true },
    { id: '2', username: 'Dad (Host)', role: 'host', device_type: 'firetv', device_name: 'Living Room Fire TV', is_connected: true },
    { id: '3', username: 'Mom', role: 'member', device_type: 'mobile', device_name: 'Android', is_connected: true },
  ];

  const mockMessages: ChatMessage[] = chatMessages.length > 0 ? chatMessages : [
    {
      id: '1',
      room_id: roomId,
      user_id: 'system',
      username: 'System',
      message: 'Everyone has joined the watch party!',
      message_type: 'system' as const,
      created_at: new Date(Date.now() - 120000).toISOString(),
    }
  ];

  // Find current user in participants
  const currentUser = mockParticipants.find(p => 
    p.user_id === currentUserId || p.username === currentUsername
  );
  
  // Determine if current user is host
  const isHost = currentUser?.role === 'host' || 
                 (mockRoom.host_id && mockRoom.host_id === currentUserId);

  // Debug logging
  console.log('Current user detection:', {
    currentUsername,
    currentUserId,
    currentUser,
    isHost,
    mockRoomHostId: mockRoom.host_id,
    participants: mockParticipants.map(p => ({ username: p.username, user_id: p.user_id, role: p.role }))
  });

  const handleStartParty = () => {
    if (isHost && mockRoom.status === 'waiting') {
      sendSyncEvent('start_party', {});
    }
  };

  const handleEndParty = async () => {
    if (isHost) {
      try {
        await endParty();
        // After ending party, leave the room
        onLeaveRoom();
      } catch (error) {
        console.error('Failed to end party:', error);
      }
    }
  };

  const handleLeaveParty = async () => {
    try {
      await leaveRoom();
      // After leaving room, call the parent callback
      onLeaveRoom();
    } catch (error) {
      console.error('Failed to leave room:', error);
      // Even if the API call fails, still leave the room UI
      onLeaveRoom();
    }
  };

  const tabs = [
    { key: 'remote', label: 'Remote', icon: Tv },
    { key: 'chat', label: 'Chat', icon: MessageCircle },
    { key: 'share', label: 'Share', icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-teal-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-teal-500/30 p-4">
        <div className="flex items-center justify-between">
          {isHost ? (
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={handleEndParty}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              End Party
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-white hover:bg-teal-500/20"
              onClick={handleLeaveParty}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Leave Party
            </Button>
          )}
          <div className="text-center">
            <h1 className="text-white font-bold">{mockRoom.name}</h1>
            <p className="text-gray-400 text-sm">Room {mockRoom.code}</p>
            {isHost && (
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs mt-1">
                👑 You are the Host
              </Badge>
            )}
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' :
                connectionStatus === 'connecting' ? 'bg-yellow-400' :
                connectionStatus === 'error' ? 'bg-red-400' :
                'bg-gray-400'
              }`} />
              <span className={`text-xs ${
                connectionStatus === 'connected' ? 'text-green-400' :
                connectionStatus === 'connecting' ? 'text-yellow-400' :
                connectionStatus === 'error' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 connectionStatus === 'error' ? 'Connection Error' :
                 'Disconnected'}
              </span>
              {connectionStatus === 'error' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-1"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
          <Badge className={
            mockRoom.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            mockRoom.status === 'waiting' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
            'bg-red-500/20 text-red-400 border-red-500/30'
          }>
            {mockRoom.status === 'active' ? 'Live' : mockRoom.status === 'waiting' ? 'Waiting' : 'Ended'}
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-black/10 border-b border-teal-500/30">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-white bg-teal-500/20 border-b-2 border-teal-400'
                    : 'text-gray-400 hover:text-white hover:bg-teal-500/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'chat' && mockMessages.length > 0 && (
                  <Badge className="bg-red-500 text-white text-xs ml-1">
                    {mockMessages.length}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Host Controls */}
        {isHost && mockRoom.status === 'waiting' && (
          <Card className="bg-green-500/10 border-green-500/20 p-4">
            <div className="text-center">
              <h3 className="font-semibold text-white mb-2">Ready to start?</h3>
              <p className="text-gray-400 text-sm mb-4">
                {mockParticipants.length} participant{mockParticipants.length !== 1 ? 's' : ''} ready
              </p>
              <Button
                onClick={handleStartParty}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                Start Party
              </Button>
            </div>
          </Card>
        )}

        {/* Participants Quick View */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-teal-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">Participants ({mockParticipants.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockParticipants.map((participant) => (
              <Badge
                key={participant.id}
                className={`${
                  participant.role === 'host'
                    ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                } ${(participant.user_id === currentUserId || participant.username === currentUsername) ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {participant.username}
                {participant.role === 'host' && ' 👑'}
                {(participant.user_id === currentUserId || participant.username === currentUsername) && ' (You)'}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        {activeTab === 'remote' && (
          <FireTVRemoteControl
            roomId={roomId}
            isHost={isHost}
            isPlaying={mockRoom.is_playing || false}
            currentPosition={mockRoom.current_position || 0}
            onSendSyncEvent={sendSyncEvent}
          />
        )}

        {activeTab === 'chat' && (
          <EnhancedChatSystem
            roomId={roomId}
            messages={mockMessages}
            currentUsername={currentUsername || 'You'}
          />
        )}

        {activeTab === 'share' && (
          <RoomSharing
            roomCode={mockRoom.code}
            roomName={mockRoom.name}
            participantCount={mockParticipants.length}
          />
        )}

        {/* Current Status Card */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-teal-500/20 p-4">
          <h3 className="font-semibold text-white mb-3">Playback Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <Badge className={mockRoom.is_playing ? 
                "bg-green-500/20 text-green-400 border-green-500/30" : 
                "bg-red-500/20 text-red-400 border-red-500/30"
              }>
                {mockRoom.is_playing ? 'Playing' : 'Paused'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position:</span>
              <span className="text-white">
                {Math.floor((mockRoom.current_position || 0) / 60000)}:
                {String(Math.floor(((mockRoom.current_position || 0) % 60000) / 1000)).padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sync Status:</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                All Devices Synced
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

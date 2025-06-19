import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Share2, MessageCircle, Tv } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useState } from 'react';
import { RoomSharing } from '../RoomSharing';
import { EnhancedChatSystem } from '../EnhancedChatSystem';
import { FireTVRemoteControl } from '../FireTVRemoteControl';
import { ChatMessage } from '@/types/chat';

interface MobilePartyRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export const MobilePartyRoom = ({ roomId, onLeaveRoom }: MobilePartyRoomProps) => {
  const { room, participants, chatMessages, sendSyncEvent } = useRealtimeSync(roomId);
  const [activeTab, setActiveTab] = useState<'remote' | 'chat' | 'share'>('remote');
  const [currentUsername] = useState('You');

  // Mock data for demonstration
  const mockRoom = room || {
    id: roomId,
    code: 'ABC123',
    name: 'Family Movie Night',
    status: 'active',
    is_playing: false,
    current_position: 0,
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

  const currentUser = mockParticipants.find(p => p.username === currentUsername);
  const isHost = currentUser?.role === 'host';

  const handleStartParty = () => {
    if (isHost && mockRoom.status === 'waiting') {
      sendSyncEvent('start_party', {});
    }
  };

  const handleEndParty = () => {
    if (isHost) {
      sendSyncEvent('end_party', {});
    }
  };

  const tabs = [
    { key: 'remote', label: 'Remote', icon: Tv },
    { key: 'chat', label: 'Chat', icon: MessageCircle },
    { key: 'share', label: 'Share', icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onLeaveRoom}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Leave Party
          </Button>
          <div className="text-center">
            <h1 className="text-white font-bold">{mockRoom.name}</h1>
            <p className="text-gray-400 text-sm">Room {mockRoom.code}</p>
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
      <div className="bg-black/10 border-b border-white/10">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-white bg-white/10 border-b-2 border-orange-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
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
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
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
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}
              >
                {participant.username}
                {participant.role === 'host' && ' 👑'}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        {activeTab === 'remote' && mockRoom.status === 'active' && (
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
            currentUsername={currentUsername}
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
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
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

        {/* End Party Button for Host */}
        {isHost && mockRoom.status === 'active' && (
          <Button
            onClick={handleEndParty}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            End Party
          </Button>
        )}
      </div>
    </div>
  );
};

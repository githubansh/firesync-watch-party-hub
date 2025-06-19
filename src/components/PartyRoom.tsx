
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Users, 
  Crown,
  Smartphone,
  Wifi,
  Settings,
  Share2
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { RoomSharing } from './RoomSharing';
import { EnhancedChatSystem } from './EnhancedChatSystem';
import { FireTVRemoteControl } from './FireTVRemoteControl';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface PartyRoomProps {
  roomCode: string;
  onLeave: () => void;
}

export const PartyRoom = ({ roomCode, onLeave }: PartyRoomProps) => {
  const [showSharing, setShowSharing] = useState(false);
  const [democraticMode, setDemocraticMode] = useState(true);
  const [currentUsername] = useState('You'); // This should come from user context
  
  // Mock room ID - in real app this would come from room lookup
  const roomId = 'mock-room-id'; 
  const { room, participants, chatMessages, sendSyncEvent } = useRealtimeSync(roomId);

  // Mock data for demonstration
  const mockRoom = room || {
    id: roomId,
    code: roomCode,
    name: 'Family Movie Night',
    status: 'active',
    is_playing: false,
    current_position: 0,
  };

  const mockParticipants = participants.length > 0 ? participants : [
    { id: '1', username: 'You (Host)', role: 'host', device_type: 'firetv', device_name: 'Living Room Fire TV', is_connected: true },
    { id: '2', username: 'Alice', role: 'member', device_type: 'mobile', device_name: 'iPhone', is_connected: true },
    { id: '3', username: 'Bob', role: 'member', device_type: 'firetv', device_name: 'Bedroom Fire TV', is_connected: true },
  ];

  const mockMessages = chatMessages.length > 0 ? chatMessages : [
    {
      id: '1',
      room_id: roomId,
      user_id: 'system',
      username: 'System',
      message: `Welcome to ${mockRoom.name}! Everyone is connected and ready.`,
      message_type: 'system' as const,
      created_at: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: '2', 
      room_id: roomId,
      user_id: '2',
      username: 'Alice',
      message: 'Ready for movie night! 🍿',
      message_type: 'text' as const,
      created_at: new Date(Date.now() - 60000).toISOString(),
    }
  ];

  const isHost = mockParticipants.find(p => p.username.includes('You'))?.role === 'host';

  const handleStartParty = () => {
    if (isHost && mockRoom.status === 'waiting') {
      sendSyncEvent('start_party', {});
      toast({
        title: "Party Started!",
        description: "All devices are now synchronized",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={onLeave}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{mockRoom.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Room:</span>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {mockRoom.code}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => setShowSharing(!showSharing)}
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-white">{mockParticipants.length}</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Wifi className="w-3 h-3 mr-1" />
              All Synced
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Room Sharing */}
            {showSharing && (
              <RoomSharing 
                roomCode={mockRoom.code}
                roomName={mockRoom.name}
                participantCount={mockParticipants.length}
              />
            )}

            {/* Host Start Party Control */}
            {isHost && mockRoom.status === 'waiting' && (
              <Card className="bg-green-500/10 border-green-500/20 p-6">
                <div className="text-center">
                  <Crown className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">Ready to Start?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {mockParticipants.length} family member{mockParticipants.length !== 1 ? 's' : ''} connected
                  </p>
                  <Button
                    onClick={handleStartParty}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    Start Family Watch Party
                  </Button>
                </div>
              </Card>
            )}

            {/* Video Player Mockup */}
            <Card className="bg-black border-white/10 aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <div className="text-center z-10">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white text-4xl">🎬</div>
                </div>
                <p className="text-white text-lg font-semibold mb-2">
                  {mockRoom.status === 'active' ? 'Ready to Stream' : 'Waiting for Host'}
                </p>
                <p className="text-gray-400">
                  Content synced across all Fire TV devices
                </p>
              </div>
              
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Wifi className="w-3 h-3 mr-1" />
                  &lt;50ms sync
                </Badge>
              </div>

              {democraticMode && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Democratic Mode
                  </Badge>
                </div>
              )}
            </Card>

            {/* Fire TV Remote Control */}
            {mockRoom.status === 'active' && (
              <FireTVRemoteControl
                roomId={roomId}
                isHost={isHost}
                isPlaying={mockRoom.is_playing || false}
                currentPosition={mockRoom.current_position || 0}
                onSendSyncEvent={sendSyncEvent}
              />
            )}

            {/* Democratic Mode Settings */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Democratic Remote Control</span>
                </div>
                <Switch 
                  checked={democraticMode} 
                  onCheckedChange={setDemocraticMode}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                When enabled, all family members can control playback
              </p>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Participants List */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Family Members ({mockParticipants.length})
              </h3>
              <div className="space-y-3">
                {mockParticipants.map((participant) => (
                  <div key={participant.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          participant.is_connected ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <span className="text-white text-sm">{participant.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {participant.role === 'host' && (
                          <Crown className="w-3 h-3 text-orange-400" />
                        )}
                        <Smartphone className="w-3 h-3 text-blue-400" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 ml-4">
                      {participant.device_name} • {participant.device_type}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Enhanced Chat System */}
            <EnhancedChatSystem
              roomId={roomId}
              messages={mockMessages}
              currentUsername={currentUsername}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

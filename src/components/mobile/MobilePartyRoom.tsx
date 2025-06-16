
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, Users, MessageCircle } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface MobilePartyRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export const MobilePartyRoom = ({ roomId, onLeaveRoom }: MobilePartyRoomProps) => {
  const { room, participants, sendSyncEvent } = useRealtimeSync(roomId);

  const handlePlayPause = () => {
    const eventType = room?.is_playing ? 'pause' : 'play';
    sendSyncEvent(eventType, { position: room?.current_position || 0 });
  };

  const handleSeek = (direction: 'forward' | 'back') => {
    const currentPos = room?.current_position || 0;
    const newPosition = direction === 'forward' ? currentPos + 30000 : Math.max(0, currentPos - 30000);
    sendSyncEvent('seek', { position: newPosition });
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white">Loading room...</div>
      </div>
    );
  }

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
            <h1 className="text-white font-bold">{room.name}</h1>
            <p className="text-gray-400 text-sm">Room {room.code}</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Live
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Participants */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">Participants ({participants.length})</span>
          </div>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-white text-sm">{participant.username}</span>
                  {participant.role === 'host' && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                      Host
                    </Badge>
                  )}
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {participant.device_type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Remote Control */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4 text-center">Remote Control</h3>
          
          {/* Play/Pause Button */}
          <div className="flex justify-center mb-6">
            <Button
              className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
              onClick={handlePlayPause}
            >
              {room.is_playing ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Skip Controls */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => handleSeek('back')}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => handleSeek('forward')}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div className="flex-1 h-2 bg-white/10 rounded-full">
              <div className="w-3/4 h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full" />
            </div>
          </div>
        </Card>

        {/* Current Status */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3">Playback Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <Badge className={room.is_playing ? 
                "bg-green-500/20 text-green-400 border-green-500/30" : 
                "bg-red-500/20 text-red-400 border-red-500/30"
              }>
                {room.is_playing ? 'Playing' : 'Paused'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position:</span>
              <span className="text-white">
                {Math.floor((room.current_position || 0) / 60000)}:
                {String(Math.floor(((room.current_position || 0) % 60000) / 1000)).padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Content:</span>
              <span className="text-white">
                {room.current_content_url ? 'Streaming' : 'No content'}
              </span>
            </div>
          </div>
        </Card>

        {/* Chat Button */}
        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          <MessageCircle className="w-5 h-5 mr-2" />
          Open Chat
        </Button>
      </div>
    </div>
  );
};

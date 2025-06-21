import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Tv,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  Menu,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  VolumeX,
  Volume2,
  Mic,
  Settings
} from 'lucide-react';

interface FireTVRemoteControlProps {
  roomId: string;
  isHost: boolean;
  isPlaying: boolean;
  currentPosition: number;
  onSendSyncEvent: (event: string, data: any) => void;
}

export const FireTVRemoteControl = ({ 
  roomId, 
  isHost, 
  isPlaying, 
  currentPosition, 
  onSendSyncEvent 
}: FireTVRemoteControlProps) => {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);

  const handleRemoteAction = (action: string) => {
    console.log(`Remote action: ${action}`);
    onSendSyncEvent('remote_action', { action });
    setLastActionTime(new Date());
  };

  const handlePlaybackAction = (action: string) => {
    console.log(`Playback action: ${action}`);
    
    switch (action) {
      case 'play':
        onSendSyncEvent('play', {});
        break;
      case 'pause':
        onSendSyncEvent('pause', {});
        break;
      case 'stop':
        onSendSyncEvent('stop', {});
        break;
      case 'rewind-10':
        onSendSyncEvent('seek', { position: currentPosition - 10 });
        break;
      case 'forward-30':
        onSendSyncEvent('seek', { position: currentPosition + 30 });
        break;
      default:
        console.warn(`Unsupported playback action: ${action}`);
    }

    setLastActionTime(new Date());
  };

  const handleVolumeAction = (action: string) => {
    console.log(`Volume action: ${action}`);

    let newVolume = volume;
    let newMuted = isMuted;

    switch (action) {
      case 'up':
        newVolume = Math.min(volume + 10, 100);
        newMuted = false;
        break;
      case 'down':
        newVolume = Math.max(volume - 10, 0);
        newMuted = false;
        break;
      case 'mute':
        newMuted = !isMuted;
        break;
      case 'set':
        // This will be called with a specific volume value
        return;
      default:
        console.warn(`Unsupported volume action: ${action}`);
        return;
    }

    // Update local state
    setVolume(newVolume);
    setIsMuted(newMuted);

    // Send volume sync event to all devices
    onSendSyncEvent('volume_change', {
      volume: newVolume,
      isMuted: newMuted,
      timestamp: Date.now()
    });

    setLastActionTime(new Date());
  };

  const handleVolumeSet = (newVolume: number) => {
    console.log(`Setting volume to: ${newVolume}`);
    
    setVolume(newVolume);
    setIsMuted(false);

    // Send volume sync event to all devices
    onSendSyncEvent('volume_change', {
      volume: newVolume,
      isMuted: false,
      timestamp: Date.now()
    });

    setLastActionTime(new Date());
  };

  return (
    <Card className="bg-[#222299]/30 backdrop-blur-sm border-[#00e6e6]/20 p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Tv className="w-6 h-6 text-[#00e6e6]" />
          Fire TV Remote Control
        </h3>
        <p className="text-gray-300 text-sm">
          {isHost ? 'Host controls - changes sync to all devices' : 'Shared control - vote for actions'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Pad */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-center">Navigation</h4>
          <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
            {/* Top row */}
            <div></div>
            <Button
              className="bg-[#111184]/60 hover:bg-[#111184]/80 text-white border border-[#00e6e6]/30"
              onClick={() => handleRemoteAction('up')}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <div></div>
            
            {/* Middle row */}
            <Button
              className="bg-[#111184]/60 hover:bg-[#111184]/80 text-white border border-[#00e6e6]/30"
              onClick={() => handleRemoteAction('left')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              className="bg-[#00e6e6] hover:bg-[#00cccc] text-[#111184] font-semibold rounded-full"
              onClick={() => handleRemoteAction('select')}
            >
              OK
            </Button>
            <Button
              className="bg-[#111184]/60 hover:bg-[#111184]/80 text-white border border-[#00e6e6]/30"
              onClick={() => handleRemoteAction('right')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            {/* Bottom row */}
            <div></div>
            <Button
              className="bg-[#111184]/60 hover:bg-[#111184]/80 text-white border border-[#00e6e6]/30"
              onClick={() => handleRemoteAction('down')}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <div></div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#00e6e6]/30 text-[#00e6e6] hover:bg-[#00e6e6]/10 bg-[#111184]/40"
              onClick={() => handleRemoteAction('back')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#00e6e6]/30 text-[#00e6e6] hover:bg-[#00e6e6]/10 bg-[#111184]/40"
              onClick={() => handleRemoteAction('home')}
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#00e6e6]/30 text-[#00e6e6] hover:bg-[#00e6e6]/10 bg-[#111184]/40"
              onClick={() => handleRemoteAction('menu')}
            >
              <Menu className="w-4 h-4 mr-1" />
              Menu
            </Button>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-center">Playback</h4>
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={() => handlePlaybackAction('play')}
              disabled={isPlaying}
              className="bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full"
            >
              <Play className="w-6 h-6" />
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handlePlaybackAction('pause')}
                disabled={!isPlaying}
                className="bg-orange-500 hover:bg-orange-600 text-white w-12 h-12 rounded-full"
              >
                <Pause className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handlePlaybackAction('stop')}
                className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handlePlaybackAction('rewind-10')}
                className="bg-[#111184]/60 hover:bg-[#111184]/80 text-[#00e6e6] border border-[#00e6e6]/30"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                10s
              </Button>
              <Button
                onClick={() => handlePlaybackAction('forward-30')}
                className="bg-[#111184]/60 hover:bg-[#111184]/80 text-[#00e6e6] border border-[#00e6e6]/30"
              >
                <RotateCw className="w-4 h-4 mr-1" />
                30s
              </Button>
            </div>
          </div>
        </div>

        {/* Volume & Quick Actions */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-center">Volume & Actions</h4>
          
          {/* Volume Controls */}
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={() => handleVolumeAction('up')}
              className="bg-[#111184]/60 hover:bg-[#111184]/80 text-[#00e6e6] border border-[#00e6e6]/30 w-12 h-12"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            
            <div className="text-center w-full px-2">
              <p className="text-gray-300 text-sm mb-2">Volume</p>
              <Slider
                value={[volume]}
                onValueChange={(value) => handleVolumeSet(value[0])}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-[#00e6e6] font-mono text-sm mt-1">{volume}%</p>
            </div>
            
            <Button
              onClick={() => handleVolumeAction('down')}
              className="bg-[#111184]/60 hover:bg-[#111184]/80 text-[#00e6e6] border border-[#00e6e6]/30 w-12 h-12"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => handleVolumeAction('mute')}
              variant="outline"
              className={`border-[#00e6e6]/30 hover:bg-[#00e6e6]/10 bg-[#111184]/40 ${
                isMuted ? 'text-red-400' : 'text-[#00e6e6]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              onClick={() => handleRemoteAction('voice')}
              variant="outline"
              className="w-full border-[#00e6e6]/30 text-[#00e6e6] hover:bg-[#00e6e6]/10 bg-[#111184]/40"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Search
            </Button>
            <Button
              onClick={() => handleRemoteAction('settings')}
              variant="outline"
              className="w-full border-[#00e6e6]/30 text-[#00e6e6] hover:bg-[#00e6e6]/10 bg-[#111184]/40"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 pt-4 border-t border-[#00e6e6]/20">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              lastActionTime ? 'bg-green-400' : 'bg-gray-400'
            }`} />
            <span className="text-gray-300">
              {lastActionTime ? `Last action: ${lastActionTime.toLocaleTimeString()}` : 'No recent actions'}
            </span>
          </div>
          <Badge 
            className={`${
              isHost 
                ? 'bg-[#00e6e6]/20 text-[#00e6e6] border-[#00e6e6]/30' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}
          >
            {isHost ? 'Host Control' : 'Shared Control'}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

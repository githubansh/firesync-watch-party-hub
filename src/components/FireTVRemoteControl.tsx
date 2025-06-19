
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  RotateCcw,
  RotateCw,
  Home,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Circle,
  Menu,
  Search,
  Mic,
  Settings
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface FireTVRemoteControlProps {
  roomId: string;
  isHost: boolean;
  isPlaying: boolean;
  currentPosition: number;
  onSendSyncEvent: (eventType: string, eventData: any) => void;
}

export const FireTVRemoteControl = ({ 
  roomId, 
  isHost, 
  isPlaying, 
  currentPosition,
  onSendSyncEvent 
}: FireTVRemoteControlProps) => {
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlayPause = () => {
    const eventType = isPlaying ? 'pause' : 'play';
    onSendSyncEvent(eventType, { position: currentPosition });
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: "All devices synchronized",
    });
  };

  const handleSeek = (direction: 'forward' | 'backward', seconds: number = 10) => {
    const newPosition = direction === 'forward' 
      ? currentPosition + (seconds * 1000)
      : Math.max(0, currentPosition - (seconds * 1000));
    
    onSendSyncEvent('seek', { position: newPosition });
    toast({
      title: `Seeked ${direction}`,
      description: `${seconds} seconds`,
    });
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    onSendSyncEvent('volume', { volume: newVolume[0] });
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    onSendSyncEvent('mute', { muted: !isMuted });
  };

  const handleNavigation = (direction: string) => {
    onSendSyncEvent('navigation', { direction });
    toast({
      title: "Navigation",
      description: `Pressed ${direction}`,
    });
  };

  const handleSpecialButton = (button: string) => {
    onSendSyncEvent('special_button', { button });
    toast({
      title: "Button Pressed",
      description: button,
    });
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-lg border-teal-500/20 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="font-semibold text-white mb-2 flex items-center justify-center gap-2">
            🔥📺 Fire TV Remote Control
          </h3>
          <div className="flex items-center justify-center gap-4">
            <Badge className={isPlaying ? 
              "bg-green-500/20 text-green-400 border-green-500/30" : 
              "bg-red-500/20 text-red-400 border-red-500/30"
            }>
              {isPlaying ? 'Playing' : 'Paused'}
            </Badge>
            <span className="text-gray-400 text-sm">
              Position: {formatTime(currentPosition)}
            </span>
          </div>
        </div>

        {/* Top Navigation Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => handleSpecialButton('Home')}
          >
            <Home className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => handleSpecialButton('Menu')}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => handleSpecialButton('Settings')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* D-Pad Navigation */}
        <div className="flex justify-center">
          <div className="grid grid-cols-3 grid-rows-3 gap-1 w-32">
            <div></div>
            <Button
              variant="outline"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={() => handleNavigation('up')}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <div></div>
            
            <Button
              variant="outline"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={() => handleNavigation('left')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              onClick={() => handleNavigation('select')}
            >
              <Circle className="w-4 h-4 fill-current" />
            </Button>
            <Button
              variant="outline"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={() => handleNavigation('right')}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <div></div>
            <Button
              variant="outline"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={() => handleNavigation('down')}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <div></div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="space-y-4">
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={() => handleSeek('backward', 30)}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={() => handleSeek('backward')}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white w-16 h-16 rounded-full"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            
            <Button
              variant="outline"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={() => handleSeek('forward')}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={() => handleSeek('forward', 30)}
            >
              <RotateCw className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">Volume</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
          <div className="px-2">
            <Slider
              value={isMuted ? [0] : volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-full"
              disabled={isMuted}
            />
          </div>
          <div className="text-center text-sm text-gray-400">
            {isMuted ? 'Muted' : `${volume[0]}%`}
          </div>
        </div>

        {/* Voice and Search */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => handleSpecialButton('Voice Search')}
          >
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </Button>
          <Button
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => handleSpecialButton('Search')}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Host Controls Info */}
        {!isHost && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <p className="text-orange-400 text-sm text-center">
              🔒 Remote control available - actions sync to all devices
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

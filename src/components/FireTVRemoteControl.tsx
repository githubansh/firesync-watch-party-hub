
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  FastForward,
  Rewind,
  RotateCcw,
  Home,
  Menu,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Circle,
  Square,
  Triangle,
  Smartphone,
  Tv
} from 'lucide-react';

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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePlayPause = () => {
    const eventType = isPlaying ? 'pause' : 'play';
    onSendSyncEvent(eventType, { position: currentPosition });
  };

  const handleSeek = (seconds: number) => {
    const newPosition = Math.max(0, currentPosition + (seconds * 1000));
    onSendSyncEvent('seek', { position: newPosition });
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    onSendSyncEvent('volume_change', { volume: newVolume[0] });
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    onSendSyncEvent('mute_toggle', { muted: !isMuted });
  };

  const handleNavigation = (direction: string) => {
    onSendSyncEvent('navigation', { direction });
  };

  const handleFireTVAction = (action: string) => {
    onSendSyncEvent('firetv_action', { action });
  };

  return (
    <div className="space-y-4">
      {/* Remote Control Header */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-white">Fire TV Remote</h3>
          </div>
          <div className="flex items-center gap-2">
            {isHost && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Host
              </Badge>
            )}
            <Badge className={
              isPlaying 
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }>
              {isPlaying ? 'Playing' : 'Paused'}
            </Badge>
          </div>
        </div>

        {/* Main Playback Controls */}
        <div className="space-y-6">
          {/* Primary Controls */}
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={() => handleSeek(-30)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Rewind className="w-5 h-5" />
              <span className="ml-1 text-xs">30s</span>
            </Button>
            
            <Button
              onClick={() => handleSeek(-10)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <SkipBack className="w-4 h-4" />
              <span className="ml-1 text-xs">10s</span>
            </Button>
            
            <Button
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
            
            <Button
              onClick={() => handleSeek(10)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <span className="mr-1 text-xs">10s</span>
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => handleSeek(30)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <span className="mr-1 text-xs">30s</span>
              <FastForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleMute}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isMuted || volume[0] === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1">
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-white text-sm w-10">{volume[0]}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Fire TV Navigation */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Navigation</h3>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
        </div>

        {/* D-Pad Navigation */}
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            {/* Up Arrow */}
            <Button
              onClick={() => handleNavigation('up')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 w-12 h-12"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
            
            {/* Left, Select, Right */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleNavigation('left')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 w-12 h-12"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => handleNavigation('select')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white w-12 h-12 rounded-full"
              >
                <Circle className="w-6 h-6 fill-current" />
              </Button>
              
              <Button
                onClick={() => handleNavigation('right')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 w-12 h-12"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Down Arrow */}
            <Button
              onClick={() => handleNavigation('down')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 w-12 h-12"
            >
              <ArrowDown className="w-5 h-5" />
            </Button>
          </div>

          {/* Fire TV Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleFireTVAction('home')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              onClick={() => handleFireTVAction('back')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => handleFireTVAction('menu')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Menu className="w-4 h-4 mr-2" />
              Menu
            </Button>
          </div>

          {/* Advanced Controls */}
          {showAdvanced && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleFireTVAction('voice_search')}
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  🎤 Voice
                </Button>
                <Button
                  onClick={() => handleFireTVAction('apps')}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  📱 Apps
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleFireTVAction('netflix')}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                >
                  Netflix
                </Button>
                <Button
                  onClick={() => handleFireTVAction('prime')}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs"
                >
                  Prime
                </Button>
                <Button
                  onClick={() => handleFireTVAction('youtube')}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                >
                  YouTube
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Connection Status */}
      <div className="text-center">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Smartphone className="w-3 h-3 mr-1" />
          Connected to Fire TV
        </Badge>
      </div>
    </div>
  );
};

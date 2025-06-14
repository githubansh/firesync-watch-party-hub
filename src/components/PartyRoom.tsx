
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Users, 
  MessageCircle, 
  Heart,
  Laugh,
  Zap,
  Copy,
  Settings,
  Share2,
  Timer,
  Vote,
  Crown,
  Smartphone,
  Wifi,
  Bell
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface PartyRoomProps {
  roomCode: string;
  onLeave: () => void;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'reaction' | 'system' | 'notification';
}

interface User {
  id: string;
  name: string;
  isHost: boolean;
  status: 'connected' | 'syncing' | 'disconnected';
  hasRemoteControl: boolean;
  device: string;
}

export const PartyRoom = ({ roomCode, onLeave }: PartyRoomProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(7200); // 2 hours in seconds
  const [chatMessage, setChatMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [countdownMinutes, setCountdownMinutes] = useState(20);
  const [democraticMode, setDemocraticMode] = useState(true);
  const [pendingVotes, setPendingVotes] = useState<{pause: number, play: number}>({pause: 0, play: 0});
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'System',
      message: `Welcome to room ${roomCode}! The party is about to begin.`,
      timestamp: new Date(Date.now() - 60000),
      type: 'system'
    },
    {
      id: '2',
      user: 'System',
      message: `Alice joined the party from Living Room Fire TV`,
      timestamp: new Date(Date.now() - 45000),
      type: 'system'
    }
  ]);
  
  const [users] = useState<User[]>([
    { id: '1', name: 'You (Host)', isHost: true, status: 'connected', hasRemoteControl: true, device: 'Fire TV Stick 4K' },
    { id: '2', name: 'Alice', isHost: false, status: 'connected', hasRemoteControl: true, device: 'Fire TV Cube' },
    { id: '3', name: 'Bob', isHost: false, status: 'syncing', hasRemoteControl: false, device: 'Fire TV Stick' },
    { id: '4', name: 'Charlie', isHost: false, status: 'connected', hasRemoteControl: true, device: 'Fire TV Stick 4K Max' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (democraticMode && !users.find(u => u.name === 'You (Host)')?.isHost) {
      // Voting system for non-hosts
      const action = isPlaying ? 'pause' : 'play';
      setPendingVotes(prev => ({
        ...prev,
        [action]: prev[action] + 1
      }));
      addSystemMessage(`Vote to ${action} received (${pendingVotes[action] + 1}/${users.length - 1} needed)`);
      return;
    }

    setIsPlaying(!isPlaying);
    const action = isPlaying ? 'paused' : 'played';
    addSystemMessage(`Host ${action} the video for everyone`);
    toast({
      title: `Video ${isPlaying ? 'Paused' : 'Playing'}`,
      description: `All Fire TVs have been synchronized`,
    });
  };

  const handleSeek = (direction: 'back' | 'forward') => {
    const seekAmount = direction === 'back' ? -10 : 10;
    setCurrentTime(prev => Math.max(0, Math.min(prev + seekAmount, duration)));
    addSystemMessage(`Host ${direction === 'back' ? 'rewound' : 'fast-forwarded'} 10 seconds on all devices`);
  };

  const sendCountdownNotification = () => {
    const notificationMessage = `🎬 Movie starting in ${countdownMinutes} minutes! Please get ready with snacks and drinks. See you in the living room! 🍿`;
    
    addSystemMessage(`Countdown notification sent to all family members`);
    setShowNotification(true);
    
    toast({
      title: "Notification Sent!",
      description: `All family members notified - movie starts in ${countdownMinutes} minutes`,
    });

    setTimeout(() => setShowNotification(false), 5000);
  };

  const addSystemMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'System',
      message,
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: chatMessage,
      timestamp: new Date(),
      type: 'message'
    };
    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const sendReaction = (emoji: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: emoji,
      timestamp: new Date(),
      type: 'reaction'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    });
  };

  const shareRoom = () => {
    const shareText = `Join our FireSync watch party! Room code: ${roomCode} 🎬🍿`;
    if (navigator.share) {
      navigator.share({
        title: 'FireSync Watch Party',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Share text copied!",
        description: "Share this with your family members",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Countdown Notification Overlay */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-orange-500/90 backdrop-blur-lg border-orange-400 p-6 max-w-md text-center">
            <Bell className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Notification Sent!</h3>
            <p className="text-white/90">All family members have been notified that the movie starts in {countdownMinutes} minutes.</p>
          </Card>
        </div>
      )}

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
              <h1 className="text-2xl font-bold text-white">Family Watch Party</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Room:</span>
                <Badge 
                  className="bg-orange-500/20 text-orange-400 border-orange-500/30 cursor-pointer hover:bg-orange-500/30"
                  onClick={copyRoomCode}
                >
                  {roomCode}
                  <Copy className="w-3 h-3 ml-1" />
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={shareRoom}
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
              <span className="text-white">{users.length}</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Zap className="w-3 h-3 mr-1" />
              All Synced
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player Mockup */}
            <Card className="bg-black border-white/10 aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <div className="text-center z-10">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </div>
                <p className="text-white text-lg font-semibold mb-2">
                  {isPlaying ? 'Now Playing' : 'Ready to Stream'}
                </p>
                <p className="text-gray-400">
                  Content synced across all Fire TV devices
                </p>
              </div>
              
              {/* Sync Status Overlay */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Wifi className="w-3 h-3 mr-1" />
                  &lt;50ms sync
                </Badge>
              </div>

              {/* Democratic Mode Indicator */}
              {democraticMode && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Vote className="w-3 h-3 mr-1" />
                    Democratic Mode
                  </Badge>
                </div>
              )}
            </Card>

            {/* Enhanced Player Controls */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>Netflix • The Avengers</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 cursor-pointer">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleSeek('back')}
                  >
                    <SkipBack className="w-4 h-4" />
                    <span className="ml-1 text-xs">10s</span>
                  </Button>
                  
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white w-12 h-12 rounded-full"
                    onClick={handlePlay}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleSeek('forward')}
                  >
                    <span className="mr-1 text-xs">10s</span>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                {/* Democratic Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={democraticMode} 
                      onCheckedChange={setDemocraticMode}
                    />
                    <span className="text-white text-sm">Democratic Remote Control</span>
                  </div>
                  {pendingVotes.pause > 0 || pendingVotes.play > 0 ? (
                    <div className="text-sm text-orange-400">
                      Votes: Pause {pendingVotes.pause} | Play {pendingVotes.play}
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            {/* Host Controls */}
            <Card className="bg-orange-500/10 border-orange-500/20 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-white">Host Controls</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-orange-400" />
                  <Input
                    type="number"
                    value={countdownMinutes}
                    onChange={(e) => setCountdownMinutes(Number(e.target.value))}
                    className="w-20 bg-white/10 border-white/20 text-white"
                    min="1"
                    max="60"
                  />
                  <span className="text-gray-400 text-sm">minutes</span>
                </div>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={sendCountdownNotification}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Family
                </Button>
              </div>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Users List with Device Info */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Family Members ({users.length})
              </h3>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'connected' ? 'bg-green-400' :
                          user.status === 'syncing' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`} />
                        <span className="text-white text-sm">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {user.isHost && (
                          <Crown className="w-3 h-3 text-orange-400" />
                        )}
                        {user.hasRemoteControl && (
                          <Smartphone className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 ml-4">
                      {user.device} • {user.status}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Enhanced Chat */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4 flex flex-col h-96">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-white" />
                <h3 className="font-semibold text-white">Family Chat</h3>
              </div>
              
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`text-sm ${
                      msg.type === 'system' ? 'text-gray-400 italic' :
                      msg.type === 'reaction' ? 'text-center' :
                      msg.type === 'notification' ? 'text-orange-400 font-semibold' :
                      'text-white'
                    }`}>
                      {msg.type === 'reaction' ? (
                        <div className="text-2xl">{msg.message}</div>
                      ) : (
                        <>
                          <span className="font-semibold text-orange-400">{msg.user}:</span>
                          <span className="ml-2">{msg.message}</span>
                          <div className="text-xs text-gray-500 ml-2">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Enhanced Quick Reactions */}
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 text-lg p-2"
                  onClick={() => sendReaction('❤️')}
                >
                  ❤️
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 text-lg p-2"
                  onClick={() => sendReaction('😂')}
                >
                  😂
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 text-lg p-2"
                  onClick={() => sendReaction('🔥')}
                >
                  🔥
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 text-lg p-2"
                  onClick={() => sendReaction('🍿')}
                >
                  🍿
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 text-lg p-2"
                  onClick={() => sendReaction('👏')}
                >
                  👏
                </Button>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Chat with family..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

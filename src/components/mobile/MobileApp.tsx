import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  Smartphone, 
  Tv, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  MessageCircle, 
  Send,
  Wifi,
  Users,
  Crown,
  Settings,
  LogOut,
  Zap,
  Vote,
  Bell,
  Heart,
  Laugh,
  Flame,
  Coffee
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'reaction' | 'system';
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'fire-tv' | 'mobile';
  status: 'connected' | 'syncing' | 'disconnected';
  isHost: boolean;
}

export const MobileApp = () => {
  const [currentView, setCurrentView] = useState<'join' | 'connected' | 'remote'>('join');
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(7200); // 2 hours in seconds
  const [chatMessage, setChatMessage] = useState('');
  const [remoteEnabled, setRemoteEnabled] = useState(true);
  const [joinedRoom, setJoinedRoom] = useState('');
  const [pendingVotes, setPendingVotes] = useState<{pause: number, play: number}>({pause: 0, play: 0});
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'System',
      message: 'Welcome to the family watch party! 🎬',
      timestamp: new Date(Date.now() - 60000),
      type: 'system'
    }
  ]);
  
  const [devices] = useState<ConnectedDevice[]>([
    { id: '1', name: 'Living Room Fire TV', type: 'fire-tv', status: 'connected', isHost: true },
    { id: '2', name: 'Dad\'s Phone', type: 'mobile', status: 'connected', isHost: false },
    { id: '3', name: 'Mom\'s Phone', type: 'mobile', status: 'connected', isHost: false },
    { id: '4', name: 'Bedroom Fire TV', type: 'mobile', status: 'syncing', isHost: false }
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

  const handleJoinRoom = () => {
    if (!roomCode.trim() || !userName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both room code and your name",
      });
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      setJoinedRoom(roomCode);
      setCurrentView('connected');
      setIsConnecting(false);
      addSystemMessage(`${userName} joined from mobile device`);
      toast({
        title: "Connected!",
        description: `Joined room ${roomCode} successfully`,
      });
    }, 2000);
  };

  const handleRemoteControl = (action: 'play' | 'pause' | 'back' | 'forward') => {
    if (!remoteEnabled) {
      toast({
        title: "Remote Disabled",
        description: "Host has disabled remote control",
      });
      return;
    }

    if (action === 'play' || action === 'pause') {
      const newAction = action === 'play' ? 'play' : 'pause';
      setPendingVotes(prev => ({
        ...prev,
        [newAction]: prev[newAction] + 1
      }));
      addSystemMessage(`Vote to ${newAction} received (${pendingVotes[newAction] + 1}/${devices.filter(d => d.type === 'mobile').length} needed)`);
      
      // Simulate vote threshold reached
      if (pendingVotes[newAction] + 1 >= 2) {
        setIsPlaying(action === 'play');
        addSystemMessage(`Democratic vote passed - video ${action === 'play' ? 'playing' : 'paused'}`);
        setPendingVotes({pause: 0, play: 0});
      }
    } else {
      const seekAmount = action === 'back' ? -10 : 10;
      setCurrentTime(prev => Math.max(0, Math.min(prev + seekAmount, duration)));
      addSystemMessage(`${userName} ${action === 'back' ? 'rewound' : 'fast-forwarded'} 10 seconds`);
    }

    toast({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Command`,
      description: "Sent to all Fire TV devices",
    });
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
      user: userName || 'You',
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
      user: userName || 'You',
      message: emoji,
      timestamp: new Date(),
      type: 'reaction'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const leaveRoom = () => {
    setCurrentView('join');
    setJoinedRoom('');
    setRoomCode('');
    addSystemMessage(`${userName} left the party`);
    toast({
      title: "Left Room",
      description: "Disconnected from watch party",
    });
  };

  // Join Room Screen
  if (currentView === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
        <div className="max-w-md mx-auto pt-16">
          {/* Mobile App Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              FireSync
            </h1>
            <p className="text-gray-300 mt-2">Mobile Remote Control</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Join Watch Party</h2>
                <p className="text-gray-300">Enter the room code from your Fire TV</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName" className="text-white">Your Name</Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="roomCode" className="text-white">Room Code</Label>
                  <Input
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="6-DIGIT CODE"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mt-2 text-center text-lg font-mono"
                    maxLength={6}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3"
                onClick={handleJoinRoom}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Tv className="w-5 h-5 mr-2" />
                    Join Party
                  </>
                )}
              </Button>

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-white font-semibold text-sm">Auto-Discovery Active</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Your phone will automatically find and connect to Fire TVs on the same WiFi network.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Connected/Remote Control Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <h1 className="text-xl font-bold text-white">FireSync Remote</h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Room {joinedRoom}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Synced
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={leaveRoom}
          >
            <LogOut className="w-4 h-4 mr-1" />
            Leave
          </Button>
        </div>

        {/* Now Playing */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">The Avengers</h3>
              <p className="text-gray-400 text-sm">Netflix • {isPlaying ? 'Playing' : 'Paused'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Remote Controls */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Remote Control</h3>
            <div className="flex items-center gap-2">
              <Switch 
                checked={remoteEnabled} 
                onCheckedChange={setRemoteEnabled}
                disabled={true}
              />
              <span className="text-gray-400 text-sm">Enabled</span>
            </div>
          </div>

          {pendingVotes.pause > 0 || pendingVotes.play > 0 ? (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-orange-400 text-sm">
                <Vote className="w-4 h-4" />
                Pending Votes: Pause {pendingVotes.pause} | Play {pendingVotes.play}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 h-12"
              onClick={() => handleRemoteControl('back')}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12"
              onClick={() => handleRemoteControl(isPlaying ? 'pause' : 'play')}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 h-12"
              onClick={() => handleRemoteControl('forward')}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Volume
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </Card>

        {/* Connected Devices */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Connected Devices ({devices.length})
          </h3>
          <div className="space-y-2">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    device.status === 'connected' ? 'bg-green-400' :
                    device.status === 'syncing' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`} />
                  <span className="text-white text-sm">{device.name}</span>
                  {device.isHost && (
                    <Crown className="w-3 h-3 text-orange-400" />
                  )}
                </div>
                <Badge className={`text-xs ${
                  device.type === 'fire-tv' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {device.type === 'fire-tv' ? 'Fire TV' : 'Mobile'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-white" />
            <h3 className="text-white font-semibold">Family Chat</h3>
          </div>
          
          <ScrollArea className="h-32 mb-4">
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`text-sm ${
                  msg.type === 'system' ? 'text-gray-400 italic' :
                  msg.type === 'reaction' ? 'text-center text-lg' :
                  'text-white'
                }`}>
                  {msg.type === 'reaction' ? (
                    <div>{msg.message}</div>
                  ) : (
                    <>
                      <span className="font-semibold text-cyan-400">{msg.user}:</span>
                      <span className="ml-2">{msg.message}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Reactions */}
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-lg"
              onClick={() => sendReaction('❤️')}
            >
              ❤️
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-lg"
              onClick={() => sendReaction('😂')}
            >
              😂
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-lg"
              onClick={() => sendReaction('🔥')}
            >
              🔥
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-lg"
              onClick={() => sendReaction('🍿')}
            >
              🍿
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
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

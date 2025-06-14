
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Settings
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
  type: 'message' | 'reaction' | 'system';
}

interface User {
  id: string;
  name: string;
  isHost: boolean;
  status: 'connected' | 'syncing' | 'disconnected';
}

export const PartyRoom = ({ roomCode, onLeave }: PartyRoomProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(7200); // 2 hours in seconds
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'System',
      message: `Welcome to room ${roomCode}! The party is about to begin.`,
      timestamp: new Date(Date.now() - 60000),
      type: 'system'
    }
  ]);
  const [users] = useState<User[]>([
    { id: '1', name: 'You (Host)', isHost: true, status: 'connected' },
    { id: '2', name: 'Alice', isHost: false, status: 'connected' },
    { id: '3', name: 'Bob', isHost: false, status: 'syncing' },
    { id: '4', name: 'Charlie', isHost: false, status: 'connected' }
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
    setIsPlaying(!isPlaying);
    const action = isPlaying ? 'paused' : 'played';
    addSystemMessage(`Host ${action} the video`);
    toast({
      title: `Video ${isPlaying ? 'Paused' : 'Playing'}`,
      description: `All devices have been ${action}`,
    });
  };

  const handleSeek = (direction: 'back' | 'forward') => {
    const seekAmount = direction === 'back' ? -10 : 10;
    setCurrentTime(prev => Math.max(0, Math.min(prev + seekAmount, duration)));
    addSystemMessage(`Host ${direction === 'back' ? 'rewound' : 'fast-forwarded'} 10 seconds`);
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
              <h1 className="text-2xl font-bold text-white">Watch Party</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Room:</span>
                <Badge 
                  className="bg-orange-500/20 text-orange-400 border-orange-500/30 cursor-pointer hover:bg-orange-500/30"
                  onClick={copyRoomCode}
                >
                  {roomCode}
                  <Copy className="w-3 h-3 ml-1" />
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-white">{users.length}</span>
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
                  Content will appear here when streaming begins
                </p>
              </div>
              
              {/* Sync Status Overlay */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Synced
                </Badge>
              </div>
            </Card>

            {/* Player Controls */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
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
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Users List */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants ({users.length})
              </h3>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'connected' ? 'bg-green-400' :
                        user.status === 'syncing' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`} />
                      <span className="text-white text-sm">{user.name}</span>
                    </div>
                    {user.isHost && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        Host
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Chat */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4 flex flex-col h-96">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-white" />
                <h3 className="font-semibold text-white">Live Chat</h3>
              </div>
              
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`text-sm ${
                      msg.type === 'system' ? 'text-gray-400 italic' :
                      msg.type === 'reaction' ? 'text-center' :
                      'text-white'
                    }`}>
                      {msg.type === 'reaction' ? (
                        <div className="text-2xl">{msg.message}</div>
                      ) : (
                        <>
                          <span className="font-semibold text-orange-400">{msg.user}:</span>
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
                  placeholder="Type a message..."
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

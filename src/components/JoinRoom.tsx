
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Smartphone, Users } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface JoinRoomProps {
  onRoomJoined: (code: string) => void;
  onBack: () => void;
}

export const JoinRoom = ({ onRoomJoined, onBack }: JoinRoomProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room code",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Error", 
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    // Simulate API call
    setTimeout(() => {
      if (roomCode.length === 6) {
        onRoomJoined(roomCode.toUpperCase());
        toast({
          title: "Joined!",
          description: `Welcome to room ${roomCode.toUpperCase()}`,
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "Room code should be 6 characters",
          variant: "destructive",
        });
        setIsJoining(false);
      }
    }, 1500);
  };

  const formatRoomCode = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join Watch Party</h2>
          <p className="text-gray-400">Enter the room code to join your friends</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-white">Your Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mt-2"
            />
          </div>

          <div>
            <Label htmlFor="roomCode" className="text-white">Room Code</Label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(formatRoomCode(e.target.value))}
              placeholder="ABC123"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mt-2 text-center text-2xl font-mono tracking-widest"
              maxLength={6}
            />
            <p className="text-sm text-gray-400 mt-1">Enter the 6-digit code from your host</p>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-white">What happens next?</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Your Fire TV will sync with the host's content</li>
              <li>• Chat and react in real-time</li>
              <li>• Perfect synchronization with &lt;100ms delay</li>
              <li>• No buffering or quality loss</li>
            </ul>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            onClick={handleJoinRoom}
            disabled={isJoining || !roomCode.trim() || !username.trim()}
          >
            {isJoining ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Joining Room...
              </>
            ) : (
              'Join Room'
            )}
          </Button>

          <Button 
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

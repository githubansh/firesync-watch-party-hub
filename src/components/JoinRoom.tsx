import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Smartphone, Users, Wifi, Tv, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useRoomManagement } from '@/hooks/useRoomManagement';
import { supabase } from '@/integrations/supabase/client';

interface JoinRoomProps {
  onRoomJoined: (roomId: string) => void;
  onBack: () => void;
}

export const JoinRoom = ({ onRoomJoined, onBack }: JoinRoomProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'join' | 'connecting'>('join');
  const [discoveredTVs] = useState([
    { id: '1', name: 'Living Room Fire TV', status: 'connected' },
    { id: '2', name: 'Bedroom Fire TV', status: 'available' }
  ]);

  const { joinRoom, isLoading } = useRoomManagement();

  const handleJoinRoom = async () => {
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

    setStep('connecting');
    
    try {
      const room = await joinRoom({
        roomCode: roomCode.toUpperCase(),
        username,
        deviceType: 'mobile',
        deviceName: 'Mobile Device',
      });

      // Store username and user ID in localStorage for later retrieval
      localStorage.setItem(`room_${room.id}_username`, username);
      
      // Get current user ID (authenticated or anonymous)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`room_${room.id}_userid`, user.id);
      } else {
        // For anonymous users, we'll generate a UUID and store it
        const anonymousUserId = crypto.randomUUID();
        localStorage.setItem(`room_${room.id}_userid`, anonymousUserId);
      }

      onRoomJoined(room.id);
    } catch (error) {
      setStep('join');
    }
  };

  const formatRoomCode = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  };

  if (step === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connecting to Party</h2>
            <p className="text-gray-400">Setting up your synchronized experience</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Connection Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Joined room {roomCode}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Discovered Fire TVs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  <span className="text-gray-300">Synchronizing with host...</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Discovered Fire TVs</h3>
              <div className="space-y-2">
                {discoveredTVs.map((tv) => (
                  <div key={tv.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">{tv.name}</span>
                    </div>
                    <Badge className={tv.status === 'connected' ? 
                      "bg-green-500/20 text-green-400 border-green-500/30" : 
                      "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    }>
                      {tv.status === 'connected' ? 'Connected' : 'Connecting...'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Please wait while we sync your device with the host's content...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join Watch Party</h2>
          <p className="text-gray-400">Enter the room code to join your family</p>
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
            <p className="text-sm text-gray-400 mt-1">Enter the 6-digit code from the host</p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-white">Auto-Discovery Ready</span>
            </div>
            <div className="space-y-2">
              {discoveredTVs.map((tv) => (
                <div key={tv.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">{tv.name}</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    Ready
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              FireSync detected these Fire TVs on your WiFi network
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-white">What happens next?</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Your Fire TV will sync with the host's content</li>
              <li>• Get full remote control access via mobile app</li>
              <li>• Chat and react in real-time with family</li>
              <li>• Perfect synchronization with &lt;100ms delay</li>
              <li>• Share remote control democratically</li>
            </ul>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            onClick={handleJoinRoom}
            disabled={isLoading || !roomCode.trim() || !username.trim()}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 mr-2" />
                Join Party
              </>
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

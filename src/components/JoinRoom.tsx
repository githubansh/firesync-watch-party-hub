import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Smartphone, Users, Wifi, Tv, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useRoomManagement } from '@/hooks/useRoomManagement';
import { supabase } from '@/integrations/supabase/client';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

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

  const { toast } = useToast();
  const { joinRoom, isLoading } = useRoomManagement();

  const handleJoinRoom = async () => {
    if (roomCode.length < 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-character room code.",
        variant: "destructive",
      });
      return;
    }
    if (!username.trim()) {
      toast({
        title: "Name Required", 
        description: "Please enter your name to join.",
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

      localStorage.setItem(`room_${room.id}_username`, username);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`room_${room.id}_userid`, user.id);
      } else {
        const anonymousUserId = crypto.randomUUID();
        localStorage.setItem(`room_${room.id}_userid`, anonymousUserId);
      }

      toast({
        title: "Success!",
        description: `You have joined "${room.name}".`,
      });
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Join a Watch Party</CardTitle>
          <CardDescription>
            Enter your name and the 6-character code from the host.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., Jane Doe"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2 text-center">
            <Label htmlFor="room-code">Room Code</Label>
            <InputOTP 
              maxLength={6} 
              value={roomCode} 
              onChange={setRoomCode}
              disabled={isLoading}
            >
              <InputOTPGroup className="mx-auto">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleJoinRoom} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Joining...' : 'Join Room'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

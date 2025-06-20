import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Tv, Users, Copy, CheckCircle, Share2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useRoomManagement } from '@/hooks/useRoomManagement';
import { supabase } from '@/integrations/supabase/client';

interface CreateRoomProps {
  onRoomCreated: (roomId: string) => void;
  onBack: () => void;
}

export const CreateRoom = ({ onRoomCreated, onBack }: CreateRoomProps) => {
  const [roomName, setRoomName] = useState('');
  const [step, setStep] = useState<'setup' | 'created' | 'invite'>('setup');
  const [allowRemoteControl, setAllowRemoteControl] = useState(true);
  const [autoDiscovery, setAutoDiscovery] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [shareableLink, setShareableLink] = useState('');

  const { createRoom, isLoading } = useRoomManagement();

  const handleCreateRoom = async () => {
    try {
      const room = await createRoom({
        name: roomName || 'Family Movie Night',
        allowRemoteControl,
        autoDiscovery,
      });

      // Store username and user ID in localStorage for later retrieval
      // For room creators, we'll use a default host username
      const hostUsername = 'Host';
      localStorage.setItem(`room_${room.id}_username`, hostUsername);
      
      // Get current user ID (authenticated or anonymous)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`room_${room.id}_userid`, user.id);
      } else {
        // For anonymous users, we'll generate a UUID and store it
        const anonymousUserId = crypto.randomUUID();
        localStorage.setItem(`room_${room.id}_userid`, anonymousUserId);
      }

      setRoomCode(room.code);
      setRoomId(room.id);
      setShareableLink(`https://firesync.app/join/${room.code}`);
      setStep('created');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link Copied!",
      description: "Share link copied to clipboard",
    });
  };

  const shareToWhatsApp = () => {
    const message = `Join my FireSync watch party! Room code: ${roomCode} or click: ${shareableLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (step === 'invite') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Invite Your Family</h2>
            <p className="text-gray-400">Share the room code or send a direct link</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <Label className="text-gray-400 text-sm">Room Code</Label>
              <div 
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 mt-2 cursor-pointer hover:from-orange-500/30 hover:to-red-500/30 transition-all"
                onClick={copyRoomCode}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold text-white">{roomCode}</span>
                  <Copy className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-sm text-gray-400 mt-1">Tap to copy</p>
              </div>
            </div>

            <div>
              <Label className="text-gray-400 text-sm">Share Link</Label>
              <div 
                className="bg-white/5 border border-white/10 rounded-lg p-3 mt-2 cursor-pointer hover:bg-white/10 transition-all"
                onClick={copyShareLink}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm truncate flex-1">{shareableLink}</span>
                  <Copy className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={shareToWhatsApp}
              >
                WhatsApp
              </Button>
              <Button 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={copyShareLink}
              >
                Copy Link
              </Button>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              onClick={() => onRoomCreated(roomId)}
            >
              Start Watch Party
            </Button>

            <Button 
              variant="outline" 
              className="w-full border-white/20 text-white hover:bg-white/10"
              onClick={() => setStep('created')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'created') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Room Created!</h2>
            <p className="text-gray-400">Your watch party is ready to go</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <Label className="text-gray-400 text-sm">Room Code</Label>
              <div 
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 mt-2 cursor-pointer hover:from-orange-500/30 hover:to-red-500/30 transition-all"
                onClick={copyRoomCode}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold text-white">{roomCode}</span>
                  <Copy className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-sm text-gray-400 mt-1">Click to copy</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="font-semibold text-white mb-2">Room Settings</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="text-white">{roomName || 'Family Movie Night'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Host:</span>
                  <span className="text-white">You</span>
                </div>
                <div className="flex justify-between">
                  <span>Remote Control:</span>
                  <Badge className={allowRemoteControl ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                    {allowRemoteControl ? 'Shared' : 'Host Only'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Discovery:</span>
                  <Badge className={autoDiscovery ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}>
                    {autoDiscovery ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setStep('invite')}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Invite Family
              </Button>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                onClick={() => onRoomCreated(roomId)}
              >
                Enter Room
              </Button>
            </div>

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Host Watch Party</h2>
          <p className="text-gray-400">Create a synchronized streaming experience</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="roomName" className="text-white">Party Name</Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Family Movie Night"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mt-2"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold">Party Settings</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Shared Remote Control</Label>
                <p className="text-sm text-gray-400">Allow family members to pause/play</p>
              </div>
              <Switch 
                checked={allowRemoteControl} 
                onCheckedChange={setAllowRemoteControl}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto-Discover Fire TVs</Label>
                <p className="text-sm text-gray-400">Find Fire TVs on same WiFi</p>
              </div>
              <Switch 
                checked={autoDiscovery} 
                onCheckedChange={setAutoDiscovery}
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">What Happens Next?</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Generate unique 6-digit party code</li>
              <li>• Share code with family via WhatsApp/SMS</li>
              <li>• Everyone joins with FireSync mobile app</li>
              <li>• Auto-sync playback across all Fire TVs</li>
              <li>• Real-time chat and remote control sharing</li>
            </ul>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            onClick={handleCreateRoom}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Setting Up Party...
              </>
            ) : (
              <>
                <Tv className="w-4 h-4 mr-2" />
                Create Watch Party
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

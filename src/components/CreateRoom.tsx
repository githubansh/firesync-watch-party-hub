
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Tv, Users, Copy, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface CreateRoomProps {
  onRoomCreated: (code: string) => void;
  onBack: () => void;
}

export const CreateRoom = ({ onRoomCreated, onBack }: CreateRoomProps) => {
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [step, setStep] = useState<'setup' | 'created'>('setup');

  const generateRoomCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const handleCreateRoom = () => {
    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      const code = generateRoomCode();
      setRoomCode(code);
      setStep('created');
      setIsCreating(false);
      toast({
        title: "Room Created!",
        description: `Your party room ${code} is ready`,
      });
    }, 2000);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    });
  };

  if (step === 'created') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Room Created!</h2>
            <p className="text-gray-400">Share this code with your friends</p>
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
              <h3 className="font-semibold text-white mb-2">Room Details</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="text-white">{roomName || 'Untitled Room'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Host:</span>
                  <span className="text-white">You</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              onClick={() => onRoomCreated(roomCode)}
            >
              Enter Room
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Watch Party</h2>
          <p className="text-gray-400">Set up your synchronized streaming room</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="roomName" className="text-white">Room Name (Optional)</Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Movie Night with Friends"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mt-2"
            />
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">Party Features</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Real-time chat & emoji reactions</li>
              <li>• Perfect synchronization across all devices</li>
              <li>• Support for all major streaming platforms</li>
              <li>• No content re-streaming (DRM compliant)</li>
            </ul>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            onClick={handleCreateRoom}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creating Room...
              </>
            ) : (
              'Create Room'
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

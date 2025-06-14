
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Tv, 
  Users, 
  Copy, 
  CheckCircle, 
  Wifi, 
  Settings,
  Zap,
  Crown,
  Bell,
  Timer
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export const FireTVApp = () => {
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'hosting'>('home');
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [allowRemoteControl, setAllowRemoteControl] = useState(true);
  const [autoDiscovery, setAutoDiscovery] = useState(true);
  const [countdownMinutes, setCountdownMinutes] = useState(20);

  const generateRoomCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const handleCreateRoom = () => {
    setIsCreating(true);
    setTimeout(() => {
      const code = generateRoomCode();
      setRoomCode(code);
      setCurrentView('hosting');
      setIsCreating(false);
      toast({
        title: "Party Room Created!",
        description: `Room ${code} is ready for family members to join`,
      });
    }, 2000);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Room Code Copied!",
      description: "Share this code with your family",
    });
  };

  const sendNotification = () => {
    toast({
      title: "Notification Sent!",
      description: `All family members notified - movie starts in ${countdownMinutes} minutes`,
    });
  };

  if (currentView === 'hosting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Fire TV Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Tv className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                FireSync
              </h1>
            </div>
            <p className="text-2xl text-gray-300">Fire TV - Party Host</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Status Card */}
            <div className="lg:col-span-2">
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8 mb-6">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Party Room Active</h2>
                  <p className="text-gray-400 text-lg">Your family can now join using the room code</p>
                </div>

                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <Label className="text-gray-400 text-lg">Room Code</Label>
                    <div 
                      className="cursor-pointer hover:from-orange-500/30 hover:to-red-500/30 transition-all mt-2"
                      onClick={copyRoomCode}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-5xl font-mono font-bold text-white">{roomCode}</span>
                        <Copy className="w-8 h-8 text-orange-400" />
                      </div>
                      <p className="text-gray-400 mt-2">Click to copy • Share with family</p>
                    </div>
                  </div>
                </div>

                {/* Host Controls */}
                <Card className="bg-orange-500/10 border-orange-500/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-6 h-6 text-orange-400" />
                    <h3 className="text-xl font-semibold text-white">Host Controls</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Timer className="w-5 h-5 text-orange-400" />
                      <Input
                        type="number"
                        value={countdownMinutes}
                        onChange={(e) => setCountdownMinutes(Number(e.target.value))}
                        className="w-24 bg-white/10 border-white/20 text-white text-lg"
                        min="1"
                        max="60"
                      />
                      <span className="text-gray-400">minutes</span>
                    </div>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3"
                      onClick={sendNotification}
                    >
                      <Bell className="w-5 h-5 mr-2" />
                      Notify Family to Get Ready
                    </Button>
                  </div>
                </Card>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Room Settings
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Party Name:</span>
                    <span className="text-white">{roomName || 'Family Movie Night'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Host Device:</span>
                    <span className="text-white">Fire TV Stick 4K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Remote Control:</span>
                    <Badge className={allowRemoteControl ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {allowRemoteControl ? 'Shared' : 'Host Only'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Auto-Discovery:</span>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {autoDiscovery ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="bg-blue-500/10 border-blue-500/20 p-6">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  Network Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">WiFi Network:</span>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Internet:</span>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">FireSync Server:</span>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Connected</Badge>
                  </div>
                </div>
              </Card>

              <Card className="bg-purple-500/10 border-purple-500/20 p-6">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  How Family Joins
                </h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Install FireSync mobile app</li>
                  <li>• Enter room code: <span className="font-mono text-orange-400">{roomCode}</span></li>
                  <li>• App auto-discovers their Fire TV</li>
                  <li>• Ready to watch together!</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
              onClick={() => setCurrentView('home')}
            >
              End Party
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl bg-white/5 backdrop-blur-lg border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Tv className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Watch Party</h2>
            <p className="text-gray-400 text-lg">Set up a synchronized streaming experience for your family</p>
          </div>

          <div className="space-y-8">
            <div>
              <Label htmlFor="roomName" className="text-white text-lg">Party Name</Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Family Movie Night"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mt-3 text-lg py-3"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-white font-semibold text-xl">Party Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-lg">Shared Remote Control</Label>
                  <p className="text-gray-400">Allow family members to pause/play from their phones</p>
                </div>
                <Switch 
                  checked={allowRemoteControl} 
                  onCheckedChange={setAllowRemoteControl}
                />
              </div>

              <Separator className="bg-white/10" />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-lg">Auto-Discover Fire TVs</Label>
                  <p className="text-gray-400">Find family Fire TVs on same WiFi network</p>
                </div>
                <Switch 
                  checked={autoDiscovery} 
                  onCheckedChange={setAutoDiscovery}
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-blue-400" />
                <span className="font-semibold text-white text-lg">What Happens Next?</span>
              </div>
              <ul className="text-gray-300 space-y-2">
                <li>• Generate unique 6-digit party code displayed on this Fire TV</li>
                <li>• Family downloads FireSync mobile app on their phones</li>
                <li>• They enter the code to join your party room</li>
                <li>• Auto-sync playback across all family Fire TVs</li>
                <li>• Real-time chat and democratic remote control</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 text-lg"
                onClick={handleCreateRoom}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    Creating Party...
                  </>
                ) : (
                  <>
                    <Tv className="w-5 h-5 mr-3" />
                    Create Watch Party
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8"
                onClick={() => setCurrentView('home')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Home Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-8 py-16">
        {/* Fire TV Home Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              FireSync
            </h1>
          </div>
          <p className="text-2xl text-gray-300 mb-4">Fire TV Stick App</p>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transform your Fire TV into the ultimate watch party hub. Host synchronized streaming experiences for your family.
          </p>
        </div>

        {/* Main CTA */}
        <div className="text-center mb-16">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-2xl"
            onClick={() => setCurrentView('create')}
          >
            <Tv className="w-8 h-8 mr-4" />
            Host a Watch Party
          </Button>
          <p className="text-gray-400 mt-4">Create a room and invite your family to join</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Easy Room Creation</h3>
            <p className="text-gray-400">Generate a 6-digit code for family to join instantly</p>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Perfect Sync</h3>
            <p className="text-gray-400">All Fire TVs play content at identical timestamps</p>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Auto-Discovery</h3>
            <p className="text-gray-400">Automatically finds all Fire TVs on your WiFi</p>
          </Card>
        </div>

        {/* Device Info */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Tv className="w-6 h-6" />
            Device Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Label className="text-gray-400">Device</Label>
              <p className="text-white font-semibold">Fire TV Stick 4K Max</p>
            </div>
            <div>
              <Label className="text-gray-400">Network</Label>
              <p className="text-white font-semibold">Home_WiFi_5G</p>
            </div>
            <div>
              <Label className="text-gray-400">Status</Label>
              <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

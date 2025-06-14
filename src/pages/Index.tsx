
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tv, Smartphone, Users, Zap, Shield, Globe } from 'lucide-react';
import { CreateRoom } from '@/components/CreateRoom';
import { JoinRoom } from '@/components/JoinRoom';
import { PartyRoom } from '@/components/PartyRoom';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'join' | 'room'>('home');
  const [roomCode, setRoomCode] = useState<string>('');

  const handleRoomCreated = (code: string) => {
    setRoomCode(code);
    setCurrentView('room');
  };

  const handleRoomJoined = (code: string) => {
    setRoomCode(code);
    setCurrentView('room');
  };

  if (currentView === 'create') {
    return <CreateRoom onRoomCreated={handleRoomCreated} onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'join') {
    return <JoinRoom onRoomJoined={handleRoomJoined} onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'room') {
    return <PartyRoom roomCode={roomCode} onLeave={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 animate-pulse" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                FireSync
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Turn your Fire TV Stick into the ultimate watch party hub. Synchronized streaming across all platforms, without the lag.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg"
                onClick={() => setCurrentView('create')}
              >
                <Tv className="w-5 h-5 mr-2" />
                Host a Party
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8 py-3 text-lg"
                onClick={() => setCurrentView('join')}
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Join with Code
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">73%</div>
              <div className="text-gray-300">Want to watch with friends</div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">&lt;100ms</div>
              <div className="text-gray-300">Synchronization latency</div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-gray-300">DRM compliant</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              The Social Streaming Paradox
            </h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              Netflix, Prime Video, Disney+ and other OTTs lock their streams behind proprietary apps. 
              Traditional screen-share workarounds suffer from lag, DRM violations, and broken user experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-red-500/10 border-red-500/20 p-6">
              <div className="text-red-400 mb-3">❌</div>
              <h3 className="font-semibold text-white mb-2">Platform Lock-in</h3>
              <p className="text-gray-400 text-sm">Each OTT has its own app with no cross-platform sync</p>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20 p-6">
              <div className="text-red-400 mb-3">⏱️</div>
              <h3 className="font-semibold text-white mb-2">Sync Issues</h3>
              <p className="text-gray-400 text-sm">Screen sharing creates lag and timing problems</p>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20 p-6">
              <div className="text-red-400 mb-3">🚫</div>
              <h3 className="font-semibold text-white mb-2">DRM Violations</h3>
              <p className="text-gray-400 text-sm">Most solutions break content protection rules</p>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20 p-6">
              <div className="text-red-400 mb-3">📱</div>
              <h3 className="font-semibold text-white mb-2">Poor UX</h3>
              <p className="text-gray-400 text-sm">Complicated setup and unreliable connections</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              How FireSync Solves It
            </h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              Turn your Fire TV Stick into a synchronized streaming hub that works with all platforms, 
              without re-streaming content or breaking DRM.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Simple Room Creation</h3>
                  <p className="text-gray-400">Generate a 6-digit party code on your Fire TV. Friends join instantly with their mobile app.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Perfect Synchronization</h3>
                  <p className="text-gray-400">Deep-link commands and Alexa Skills launch the same content at identical timestamps across all devices.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">DRM Compliant</h3>
                  <p className="text-gray-400">No content re-streaming. Each device plays from the original source, maintaining full compliance.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">AWS Powered</h3>
                  <p className="text-gray-400">Serverless architecture with API Gateway, Lambda, DynamoDB, and WebSockets for scalable performance.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-2xl p-8 backdrop-blur-lg border border-white/10">
                <div className="text-center mb-6">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Live Demo</Badge>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Room Code</span>
                      <Badge variant="secondary">DEMO123</Badge>
                    </div>
                    <div className="text-white font-mono text-lg text-center">Ready to sync!</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
                      ▶️ Play
                    </Button>
                    <Button className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">
                      ⏸️ Pause
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500/10 to-purple-500/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Watch Parties?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience synchronized streaming like never before. No more "Are you ready?" or "Wait, let me restart."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg"
              onClick={() => setCurrentView('create')}
            >
              Start Your First Party
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg"
              onClick={() => setCurrentView('join')}
            >
              Join Existing Room
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

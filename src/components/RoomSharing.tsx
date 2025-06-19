
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, MessageSquare, QrCode, Users } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface RoomSharingProps {
  roomCode: string;
  roomName: string;
  participantCount: number;
}

export const RoomSharing = ({ roomCode, roomName, participantCount }: RoomSharingProps) => {
  const [shareUrl] = useState(`${window.location.origin}?join=${roomCode}`);
  const [showQR, setShowQR] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    });
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "Share this link with your family",
    });
  };

  const shareRoom = async () => {
    const shareText = `🎬 Join our family watch party!\n\nRoom: ${roomName}\nCode: ${roomCode}\nLink: ${shareUrl}\n\n🍿 Let's watch together!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FireSync Watch Party',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Share text copied!",
          description: "Paste this anywhere to invite family",
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Share text copied!",
        description: "Paste this anywhere to invite family",
      });
    }
  };

  const sendSMS = () => {
    const message = encodeURIComponent(`Join our family watch party! Room: ${roomName}, Code: ${roomCode}, Link: ${shareUrl}`);
    window.open(`sms:?body=${message}`, '_blank');
  };

  const sendWhatsApp = () => {
    const message = encodeURIComponent(`🎬 Join our family watch party!\n\nRoom: ${roomName}\nCode: ${roomCode}\nLink: ${shareUrl}\n\n🍿 Let's watch together!`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Invite Family Members</h3>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Users className="w-3 h-3 mr-1" />
          {participantCount}
        </Badge>
      </div>
      
      {/* Room Code Display */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Room Code</label>
          <div className="flex gap-2">
            <Input
              value={roomCode}
              readOnly
              className="bg-white/10 border-white/20 text-white font-mono text-lg text-center"
            />
            <Button
              onClick={copyRoomCode}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Share Link */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Direct Link</label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="bg-white/10 border-white/20 text-white text-sm"
            />
            <Button
              onClick={copyShareUrl}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Share Options */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={shareRoom}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={sendWhatsApp}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        <Button
          onClick={sendSMS}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          📱 Send SMS Invite
        </Button>

        {/* QR Code Toggle */}
        <Button
          onClick={() => setShowQR(!showQR)}
          variant="outline"
          className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
        >
          <QrCode className="w-4 h-4 mr-2" />
          {showQR ? 'Hide' : 'Show'} QR Code
        </Button>

        {showQR && (
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-8xl">📱</div>
            <p className="text-sm text-gray-600 mt-2">QR Code for: {shareUrl}</p>
            <p className="text-xs text-gray-500">Scan with camera to join</p>
          </div>
        )}
      </div>
    </Card>
  );
};

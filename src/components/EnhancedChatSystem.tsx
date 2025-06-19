
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { VoiceRecorder } from './VoiceRecorder';
import { MessageCircle, Send, Mic, Image, Smile, Volume2, Download } from 'lucide-react';
import { useChatManagement } from '@/hooks/useChatManagement';
import { toast } from "@/hooks/use-toast";
import { ChatMessage } from '@/types/chat';

interface EnhancedChatSystemProps {
  roomId: string;
  messages: ChatMessage[];
  currentUsername: string;
}

export const EnhancedChatSystem = ({ roomId, messages, currentUsername }: EnhancedChatSystemProps) => {
  const [textMessage, setTextMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, isLoading } = useChatManagement();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendTextMessage = async () => {
    if (!textMessage.trim()) return;
    
    const success = await sendMessage(roomId, textMessage, 'text');
    if (success) {
      setTextMessage('');
    }
  };

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    try {
      console.log('Sending voice message:', { duration, size: audioBlob.size });
      
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        if (base64Audio) {
          const voiceData = JSON.stringify({
            audio: base64Audio,
            duration: duration,
            type: audioBlob.type
          });
          
          await sendMessage(roomId, voiceData, 'voice', duration);
        }
      };
      reader.readAsDataURL(audioBlob);
      
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
    }
  };

  const handleSendReaction = async (emoji: string) => {
    await sendMessage(roomId, emoji, 'reaction');
    setShowReactions(false);
  };

  const playVoiceMessage = (message: ChatMessage) => {
    try {
      if (message.message_type === 'voice') {
        const voiceData = JSON.parse(message.message);
        const audio = new Audio(`data:audio/webm;base64,${voiceData.audio}`);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing voice message:', error);
      toast({
        title: "Playback Error",
        description: "Could not play voice message",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatVoiceDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reactions = ['❤️', '😂', '👏', '🔥', '🍿', '👍', '😮', '😢'];

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4 flex flex-col h-96">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-white" />
        <h3 className="font-semibold text-white">Family Chat</h3>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          {messages.length}
        </Badge>
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`${
              msg.message_type === 'system' ? 'text-center' : 'text-left'
            }`}>
              {msg.message_type === 'system' ? (
                <div className="text-gray-400 italic text-sm">
                  {msg.message}
                </div>
              ) : msg.message_type === 'reaction' ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                    <span className="text-2xl">{msg.message}</span>
                    <span className="text-xs text-gray-400">{msg.username}</span>
                  </div>
                </div>
              ) : (
                <div className={`flex ${
                  msg.username === currentUsername ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.username === currentUsername
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}>
                    {msg.username !== currentUsername && (
                      <div className="font-semibold text-orange-400 text-sm mb-1">
                        {msg.username}
                      </div>
                    )}
                    
                    {msg.message_type === 'voice' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => playVoiceMessage(msg)}
                            size="sm"
                            variant="ghost"
                            className="p-1 hover:bg-white/20"
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">
                            Voice Message 
                            {msg.voice_duration && ` (${formatVoiceDuration(msg.voice_duration)})`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">{msg.message}</div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-1">
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <div className="mb-4">
          <VoiceRecorder 
            onSendVoice={handleSendVoiceMessage}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Quick Reactions */}
      {showReactions && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="grid grid-cols-4 gap-2">
            {reactions.map((emoji) => (
              <Button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                variant="ghost"
                className="text-2xl p-2 hover:bg-white/10"
                disabled={isLoading}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowVoiceRecorder(!showVoiceRecorder);
              setShowReactions(false);
            }}
            variant="outline"
            size="sm"
            className={`border-white/20 hover:bg-white/10 ${
              showVoiceRecorder ? 'bg-blue-500/20 text-blue-400' : 'text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              setShowReactions(!showReactions);
              setShowVoiceRecorder(false);
            }}
            variant="outline"
            size="sm"
            className={`border-white/20 hover:bg-white/10 ${
              showReactions ? 'bg-yellow-500/20 text-yellow-400' : 'text-white'
            }`}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendTextMessage()}
          />
          <Button
            onClick={handleSendTextMessage}
            disabled={isLoading || !textMessage.trim()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

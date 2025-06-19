
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Send, 
  Smile, 
  Mic, 
  MicOff,
  Image as ImageIcon,
  Heart,
  ThumbsUp,
  Laugh
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { VoiceRecorder } from './VoiceRecorder';
import { ChatMessage } from '@/types/chat';
import { useChatManagement } from '@/hooks/useChatManagement';

interface EnhancedChatSystemProps {
  roomId: string;
  messages: ChatMessage[];
  currentUsername: string;
}

const quickEmojis = [
  { emoji: '😀', label: 'Happy' },
  { emoji: '😂', label: 'Laughing' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '👍', label: 'Thumbs up' },
  { emoji: '👎', label: 'Thumbs down' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '🍿', label: 'Popcorn' }
];

export const EnhancedChatSystem = ({ roomId, messages, currentUsername }: EnhancedChatSystemProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading } = useChatManagement();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    const success = await sendMessage(roomId, newMessage.trim());
    if (success) {
      setNewMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleQuickReaction = async (emoji: string) => {
    await sendMessage(roomId, emoji, 'reaction');
  };

  const handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    // In a real implementation, you'd upload the audio to storage first
    // For now, we'll send a text representation
    const success = await sendMessage(
      roomId, 
      `🎤 Voice message (${Math.round(duration)}s)`, 
      'voice',
      duration * 1000 // Convert to milliseconds
    );
    
    if (success) {
      setShowVoiceRecorder(false);
      toast({
        title: "Voice message sent!",
        description: `${Math.round(duration)} second message delivered`,
      });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = (messageType: ChatMessage['message_type']) => {
    switch (messageType) {
      case 'voice':
        return <Mic className="w-3 h-3" />;
      case 'image':
        return <ImageIcon className="w-3 h-3" />;
      case 'reaction':
        return <Heart className="w-3 h-3" />;
      case 'system':
        return <MessageCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-lg border-teal-500/20 h-96 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-teal-500/20">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Family Chat
          </h3>
          <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
            {messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="space-y-1">
              <div className={`flex items-start gap-2 ${
                message.message_type === 'system' ? 'justify-center' : ''
              }`}>
                {message.message_type === 'system' ? (
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-2 text-center">
                    <p className="text-teal-400 text-sm">{message.message}</p>
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {message.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">
                          {message.username}
                        </span>
                        {getMessageIcon(message.message_type)}
                        <span className="text-gray-400 text-xs">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                      <div className={`p-2 rounded-lg max-w-xs ${
                        message.username === currentUsername
                          ? 'bg-teal-500/20 border border-teal-500/30 ml-auto'
                          : 'bg-slate-700/50 border border-slate-600/30'
                      }`}>
                        <p className="text-white text-sm break-words">
                          {message.message}
                        </p>
                        {message.voice_duration && (
                          <div className="mt-1 text-xs text-gray-400">
                            Duration: {Math.round(message.voice_duration / 1000)}s
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Reactions */}
      <div className="p-2 border-t border-teal-500/20">
        <div className="flex gap-1 overflow-x-auto">
          {quickEmojis.slice(0, 6).map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="text-lg hover:bg-teal-500/10 min-w-0 p-1"
              onClick={() => handleQuickReaction(item.emoji)}
            >
              {item.emoji}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="bg-teal-500/20" />

      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <div className="p-4 border-t border-teal-500/20">
          <VoiceRecorder
            onRecordingComplete={handleVoiceMessage}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="p-4 border-t border-teal-500/20">
          <div className="grid grid-cols-5 gap-2">
            {quickEmojis.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="text-xl hover:bg-teal-500/10 aspect-square"
                onClick={() => handleEmojiClick(item.emoji)}
                title={item.label}
              >
                {item.emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-teal-500/20">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowVoiceRecorder(false);
            }}
          >
            <Smile className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => {
              setShowVoiceRecorder(!showVoiceRecorder);
              setShowEmojiPicker(false);
            }}
          >
            {showVoiceRecorder ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-slate-700/50 border-slate-600/30 text-white placeholder:text-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

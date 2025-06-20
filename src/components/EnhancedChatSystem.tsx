
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle,
  Mic,
  Send,
  Play,
  Pause
} from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { toast } from "@/hooks/use-toast";
import { ChatMessage } from '@/types/chat';
import { useChatManagement } from '@/hooks/useChatManagement';

interface EnhancedChatSystemProps {
  roomId: string;
  messages: ChatMessage[];
  currentUsername: string;
}

const quickEmojis = ['👍', '🔥', '💯', '👏', '😂', '🎉'];

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
};

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const EnhancedChatSystem = ({ roomId, messages, currentUsername }: EnhancedChatSystemProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({});
  const [playbackProgress, setPlaybackProgress] = useState<{ [key: string]: number }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  
  const { sendMessage, isLoading } = useChatManagement();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    console.log('Sending text message:', newMessage);
    const success = await sendMessage(roomId, newMessage, 'text');
    
    if (success) {
      setNewMessage('');
      scrollToBottom();
    }
  };

  const sendQuickEmoji = async (emoji: string) => {
    if (isLoading) return;
    
    console.log('Sending emoji:', emoji);
    const success = await sendMessage(roomId, emoji, 'emoji');
    
    if (success) {
      scrollToBottom();
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    setShowVoiceRecorder(false);
    
    if (isLoading) return;

    const url = URL.createObjectURL(audioBlob);
    console.log('Sending voice message with duration:', duration);
    
    const success = await sendMessage(roomId, url, 'voice', duration);
    
    if (success) {
      scrollToBottom();
    }
  };

  const togglePlayback = (messageId: string) => {
    const audioUrl = messages.find(msg => msg.id === messageId)?.message;

    if (!audioUrl) {
      console.error('Audio URL not found for message ID:', messageId);
      return;
    }

    if (!audioRefs.current[messageId]) {
      audioRefs.current[messageId] = new Audio(audioUrl);
      
      audioRefs.current[messageId].addEventListener('timeupdate', () => {
        const audio = audioRefs.current[messageId];
        if (audio) {
          const progress = (audio.currentTime / audio.duration) * 100;
          setPlaybackProgress(prevProgress => ({
            ...prevProgress,
            [messageId]: progress,
          }));
        }
      });

      audioRefs.current[messageId].addEventListener('ended', () => {
        setPlayingStates(prevState => ({
          ...prevState,
          [messageId]: false,
        }));
        setPlaybackProgress(prevProgress => ({
          ...prevProgress,
          [messageId]: 0,
        }));
      });
    }

    const audio = audioRefs.current[messageId];

    if (playingStates[messageId]) {
      audio.pause();
      setPlayingStates(prevState => ({
        ...prevState,
        [messageId]: false,
      }));
    } else {
      audio.play();
      setPlayingStates(prevState => {
        // Pause all other audio instances
        Object.keys(prevState).forEach(id => {
          if (id !== messageId && audioRefs.current[id]) {
            audioRefs.current[id].pause();
          }
        });

        return {
          ...Object.fromEntries(Object.keys(prevState)
            .map(key => [key, false])), // Pause all others
          [messageId]: true, // Play current
        };
      });
    }
  };

  return (
    <Card className="bg-[#222299]/30 backdrop-blur-sm border-[#00e6e6]/20 p-4 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Family Chat
        </h3>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#00e6e6]/20 text-[#00e6e6] border-[#00e6e6]/30 text-xs">
            {messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-[#00e6e6]/30 scrollbar-track-transparent">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${
            message.username === currentUsername ? 'justify-end' : 'justify-start'
          }`}>
            <div className={`max-w-[80%] ${
              message.username === currentUsername
                ? 'bg-[#00e6e6]/20 border-[#00e6e6]/30'
                : 'bg-[#111184]/40 border-[#111184]/30'
            } border rounded-lg p-3`}>
              {message.username !== currentUsername && (
                <p className="text-[#00e6e6] text-xs font-medium mb-1">
                  {message.username}
                </p>
              )}
              
              {message.message_type === 'voice' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-[#00e6e6]/10"
                    onClick={() => togglePlayback(message.id)}
                  >
                    {playingStates[message.id] ? 
                      <Pause className="w-4 h-4 text-[#00e6e6]" /> : 
                      <Play className="w-4 h-4 text-[#00e6e6]" />
                    }
                  </Button>
                  <div className="flex-1">
                    <div className="h-1 bg-[#111184]/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00e6e6] transition-all duration-300"
                        style={{ width: `${playbackProgress[message.id] || 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-300">
                    {message.voice_duration ? formatDuration(message.voice_duration) : 
                     message.duration ? formatDuration(message.duration) : '0:00'}
                  </span>
                </div>
              ) : message.message_type === 'emoji' ? (
                <div className="text-2xl">{message.message}</div>
              ) : (
                <p className="text-white text-sm">{message.message}</p>
              )}
              
              <p className="text-gray-400 text-xs mt-1">
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        {/* Voice Recording */}
        {showVoiceRecorder ? (
          <VoiceRecorder
            onRecordingComplete={handleVoiceMessage}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        ) : (
          <>
            {/* Emoji Quick Actions */}
            <div className="flex gap-1 mb-2">
              {quickEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-[#00e6e6]/10 text-lg"
                  onClick={() => sendQuickEmoji(emoji)}
                  disabled={isLoading}
                >
                  {emoji}
                </Button>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-[#111184]/40 border-[#00e6e6]/30 text-white placeholder:text-gray-400 focus:border-[#00e6e6]"
                disabled={isLoading}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0 hover:bg-[#00e6e6]/10"
                onClick={() => setShowVoiceRecorder(true)}
                disabled={isLoading}
              >
                <Mic className="w-4 h-4 text-[#00e6e6]" />
              </Button>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-[#00e6e6] hover:bg-[#00cccc] text-[#111184] font-medium"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

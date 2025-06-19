
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  isLoading?: boolean;
}

export const VoiceRecorder = ({ onSendVoice, isLoading = false }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, recordingDuration);
      setAudioBlob(null);
      setRecordingDuration(0);
    }
  };

  const handleCancel = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
    if (isRecording) {
      stopRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/10 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white font-medium">Voice Message</span>
        <span className="text-gray-400 text-sm">
          {formatDuration(recordingDuration)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <Mic className="w-6 h-6" />
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white animate-pulse"
            >
              <MicOff className="w-6 h-6" />
            </Button>
            <div className="text-white text-sm">Recording...</div>
          </>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

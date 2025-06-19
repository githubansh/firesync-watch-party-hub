
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Square, Play, Pause, Send, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  isLoading?: boolean;
}

export const VoiceRecorder = ({ onSendVoice, isLoading = false }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        setRecordedAudio(audioBlob);
        
        // Create audio URL for playback
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration);
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
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
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current && recordedAudio) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
        }
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        
        // Update playback progress
        playbackIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setPlaybackTime(audioRef.current.currentTime);
            
            if (audioRef.current.ended) {
              setIsPlaying(false);
              setPlaybackTime(0);
              if (playbackIntervalRef.current) {
                clearInterval(playbackIntervalRef.current);
              }
            }
          }
        }, 100);
      }
    }
  };

  const deleteRecording = () => {
    setRecordedAudio(null);
    setIsPlaying(false);
    setPlaybackTime(0);
    setAudioDuration(0);
    if (audioRef.current) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
  };

  const sendVoiceMessage = () => {
    if (recordedAudio) {
      onSendVoice(recordedAudio, audioDuration);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recordedAudio) {
    return (
      <div className="bg-white/5 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">Voice Message ({formatTime(audioDuration)})</span>
          <Button
            onClick={deleteRecording}
            size="sm"
            variant="ghost"
            className="text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={(playbackTime / audioDuration) * 100} 
            className="w-full"
          />
          <div className="text-xs text-gray-400 text-center">
            {formatTime(playbackTime)} / {formatTime(audioDuration)}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={playRecording}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button
            onClick={sendVoiceMessage}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-4 space-y-3">
      {isRecording ? (
        <>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-mono">{formatTime(recordingTime)}</span>
          </div>
          <Button
            onClick={stopRecording}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        </>
      ) : (
        <Button
          onClick={startRecording}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          <Mic className="w-4 h-4 mr-2" />
          Record Voice Message
        </Button>
      )}
    </div>
  );
};


import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
}

export const VoiceRecorder = ({ 
  onRecordingComplete, 
  onCancel, 
  maxDuration = 60 
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedBlob(null);
    setAudioUrl('');
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const sendRecording = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob, recordingTime);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-white mb-2">Voice Message</h4>
        <div className="text-2xl font-mono text-teal-400">
          {formatTime(recordingTime)}
        </div>
        <Progress 
          value={(recordingTime / maxDuration) * 100} 
          className="mt-2"
        />
      </div>

      {/* Recording Controls */}
      {!recordedBlob && (
        <div className="flex justify-center gap-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16"
            >
              <Mic className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-full w-16 h-16"
            >
              <Square className="w-6 h-6" />
            </Button>
          )}
        </div>
      )}

      {/* Playback Controls */}
      {recordedBlob && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={isPlaying ? pausePlayback : playRecording}
            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            onClick={deleteRecording}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={sendRecording}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

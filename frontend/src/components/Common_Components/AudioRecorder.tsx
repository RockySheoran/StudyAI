import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Play, Pause, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onTranscriptReady: (transcript: string) => void;
  onError: (error: string) => void;
  isDisabled?: boolean;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptReady,
  onError,
  isDisabled = false,
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Clean up function
  const cleanup = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Request microphone access with enhanced options
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      mediaStream.current = stream;
      audioChunks.current = [];
      
      // Create MediaRecorder with optimal settings
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };
      
      // Fallback for browsers that don't support webm
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4';
      }
      
      mediaRecorder.current = new MediaRecorder(stream, options);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { 
          type: mediaRecorder.current?.mimeType || 'audio/webm' 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Clean up previous URL
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        toast.success('Recording completed! You can now play it back or use it.');
      };

      mediaRecorder.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        onError('Recording failed. Please try again.');
        stopRecording();
      };

      // Start recording
      mediaRecorder.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started! Speak clearly into your microphone.');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      let errorMessage = 'Microphone access failed.';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please check your device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is busy. Please close other apps using the microphone.';
        } else {
          errorMessage = `Microphone error: ${error.message}`;
        }
      }
      
      onError(errorMessage);
      toast.error(errorMessage);
    }
  }, [onError, audioUrl]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
        mediaStream.current = null;
      }
    }
  }, [isRecording]);

  // Play/pause audio
  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        toast.error('Failed to play audio');
        setIsPlaying(false);
      };
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Playback error:', err);
          toast.error('Failed to play audio');
        });
    }
  }, [audioUrl, isPlaying]);

  // Convert audio to text (mock implementation - you'd integrate with a real service)
  const convertToText = useCallback(async () => {
    if (!audioUrl) return;
    
    setIsProcessing(true);
    
    try {
      // This is a mock implementation
      // In a real app, you'd send the audio to a speech-to-text service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transcript based on recording time
      const mockTranscripts = [
        "Hello, my name is Sahil Sharma and I'm excited about this interview opportunity.",
        "I have experience in software development and I'm passionate about creating innovative solutions.",
        "Thank you for considering my application. I look forward to discussing my qualifications further.",
        "I believe my skills in React and TypeScript make me a strong candidate for this position."
      ];
      
      const transcript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      onTranscriptReady(transcript);
      toast.success('Audio converted to text successfully!');
      
      // Clear the recording
      setAudioUrl(null);
      setRecordingTime(0);
      
    } catch (error) {
      console.error('Transcription error:', error);
      onError('Failed to convert audio to text. Please try again.');
      toast.error('Failed to convert audio to text');
    } finally {
      setIsProcessing(false);
    }
  }, [audioUrl, onTranscriptReady, onError]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className={cn("flex flex-col items-center space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Audio Recorder</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Record your response and convert it to text
        </p>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center space-x-2 text-red-600">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isDisabled || isProcessing}
          className={cn(
            "flex items-center space-x-2 px-6 py-3",
            isRecording 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </>
          )}
        </Button>

        {audioUrl && !isRecording && (
          <>
            <Button
              onClick={togglePlayback}
              variant="outline"
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Play</span>
                </>
              )}
            </Button>

            <Button
              onClick={convertToText}
              disabled={isProcessing}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Use This Recording</span>
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-md">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>1. Click "Start Recording" and speak clearly</p>
            <p>2. Click "Stop Recording" when finished</p>
            <p>3. Play back to review, then click "Use This Recording"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;

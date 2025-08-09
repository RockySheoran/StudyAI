import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef(''); // Track final transcripts separately

  const resetTranscript = useCallback(() => {
    setText('');
    finalTranscriptRef.current = '';
  }, []);

  const updateText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleResult = useCallback((event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Update final transcript ref if we have new finalized text
    if (finalTranscript) {
      finalTranscriptRef.current += finalTranscript;
      setText(finalTranscriptRef.current);
    } 
    // Only show interim results if we're not processing final results
    else if (interimTranscript) {
      setText(finalTranscriptRef.current + interimTranscript);
    }
  }, []);

  const handleError = useCallback((event: any) => {
    console.error('Recognition error:', event.error);
    let errorMessage = 'Microphone error';
    
    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        errorMessage = 'Microphone access denied. Please allow microphone access.';
        break;
      case 'no-speech':
        return; // Ignore no-speech errors
      default:
        errorMessage = `Microphone error: ${event.error}`;
    }
    
    setError(errorMessage);
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) return;
    
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }

    setError(null);
    resetTranscript();

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      await new Promise<void>((resolve) => {
        recognition.onstart = () => {
          setIsListening(true);
          resolve();
        };
        recognition.start();
      });
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Failed to access microphone');
      setIsListening(false);
      throw err;
    }
  }, [isListening, handleResult, handleError, resetTranscript]);

  const stopListening = useCallback(() => {
    if (!isListening || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }, [isListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    text,
    isListening,
    error,
    startListening,
    stopListening,
    setText: updateText,
    resetTranscript,
  };
};
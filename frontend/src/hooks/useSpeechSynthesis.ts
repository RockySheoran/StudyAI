import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthesisRef = useRef<typeof window.speechSynthesis | null>(null);

  const updateVoices = useCallback(() => {
    if (synthesisRef.current) {
      const availableVoices = synthesisRef.current.getVoices();
      setVoices(availableVoices);
    }
  }, []);

  const handleError = useCallback((err: SpeechSynthesisErrorEvent) => {
    console.error('Speech synthesis error:', err.error);
    setIsSpeaking(false);
    
    let errorMessage = 'Speech error';
    switch (err.error) {
      case 'interrupted':
        return; // Ignore interruptions
      case 'not-allowed':
        errorMessage = 'Speech synthesis not allowed';
        break;
      default:
        errorMessage = `Speech error: ${err.error}`;
    }
    
    setError(errorMessage);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('Speech synthesis not supported');
      return;
    }

    synthesisRef.current = window.speechSynthesis;
    updateVoices();
    synthesisRef.current.onvoiceschanged = updateVoices;

    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.onvoiceschanged = null;
        stopSpeaking();
      }
    };
  }, [updateVoices]);

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current?.speaking) {
      synthesisRef.current.cancel();
    }
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text?.trim()) {
      setError('No text to speak');
      return;
    }

    if (!synthesisRef.current) {
      setError('Speech synthesis not available');
      return;
    }

    stopSpeaking();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utteranceRef.current = utterance;

      // Select the best available voice
      const englishVoices = voices.filter(v => v.lang.includes('en'));
      const preferredVoice = englishVoices.find(v => v.name.includes('Natural')) || 
                            englishVoices.find(v => v.name.includes('Google')) || 
                            englishVoices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = (err) => {
        handleError(err);
        resolve();
      };

      try {
        synthesisRef?.current?.speak(utterance);
      } catch (err) {
        handleError(err as SpeechSynthesisErrorEvent);
        resolve();
      }
    });
  }, [voices, stopSpeaking, handleError]);

  return { 
    isSpeaking, 
    speak, 
    stopSpeaking,
    error,
    clearError: () => setError(null)
  };
};
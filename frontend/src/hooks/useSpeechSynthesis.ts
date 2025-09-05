import { useState, useEffect, useRef, useCallback } from 'react';

// Browser compatibility check
const isSpeechSynthesisSupported = () => {
  return typeof window !== 'undefined' && 
         'speechSynthesis' in window && 
         'SpeechSynthesisUtterance' in window;
};

// Check if speech synthesis is actually working (some browsers report support but don't work)
const testSpeechSynthesis = async (): Promise<boolean> => {
  if (!isSpeechSynthesisSupported()) return false;
  
  try {
    const synth = window.speechSynthesis;
    
    // Check if synthesis is available and not permanently disabled
    if (!synth) return false;
    
    // Try to get voices - if this fails, synthesis likely won't work
    const voices = synth.getVoices();
    
    // Some browsers need time to load voices
    if (voices.length === 0) {
      return new Promise((resolve) => {
        let timeoutId: NodeJS.Timeout;
        
        const checkVoices = () => {
          const newVoices = synth.getVoices();
          if (newVoices.length > 0) {
            clearTimeout(timeoutId);
            resolve(true);
          }
        };
        
        // Set timeout to resolve as true even if no voices (some browsers work without listing voices)
        timeoutId = setTimeout(() => {
          synth.onvoiceschanged = null;
          resolve(true); // Changed to true - assume it works
        }, 1000);
        
        synth.onvoiceschanged = checkVoices;
        setTimeout(checkVoices, 100);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Speech synthesis test failed:', error);
    return true; // Still try to use it even if test fails
  }
};

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [speechRate, setSpeechRate] = useState(0.9);
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthesisRef = useRef<typeof window.speechSynthesis | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializationRef = useRef<Promise<boolean> | null>(null);

  const updateVoices = useCallback(() => {
    if (synthesisRef.current && isSupported) {
      try {
        const availableVoices = synthesisRef.current.getVoices();
        setVoices(availableVoices);
        
        // If we got voices, synthesis is working
        if (availableVoices.length > 0 && !isInitialized) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error getting voices:', err);
        setError('Speech synthesis not available on this device');
      }
    }
  }, [isSupported, isInitialized]);

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

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current?.speaking) {
      synthesisRef.current.cancel();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsSpeaking(false);
    setProgress(0);
    setCurrentText('');
    utteranceRef.current = null;
  }, []);

  // Initialize speech synthesis with proper error handling
  useEffect(() => {
    const initializeSpeechSynthesis = async () => {
      // Prevent multiple initializations
      if (initializationRef.current) {
        return initializationRef.current;
      }
      
      initializationRef.current = testSpeechSynthesis();
      const supported = await initializationRef.current;
      
      setIsSupported(supported);
      
      if (!supported) {
        console.warn('Speech synthesis may not be fully supported, but will attempt to use it');
        // Don't return early - still try to initialize
      }
      
      try {
        synthesisRef.current = window.speechSynthesis;
        
        // Clear any pending speech
        if (synthesisRef.current.speaking) {
          synthesisRef.current.cancel();
        }
        
        updateVoices();
        synthesisRef.current.onvoiceschanged = updateVoices;
        
        // Set a timeout to check if voices are loaded
        setTimeout(() => {
          if (voices.length === 0) {
            updateVoices();
          }
        }, 1000);
        
      } catch (err) {
        console.error('Speech synthesis initialization failed:', err);
        setError('Failed to initialize speech synthesis. Please refresh the page.');
        setIsSupported(false);
      }
    };
    
    initializeSpeechSynthesis();

    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.onvoiceschanged = null;
        stopSpeaking();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [updateVoices, stopSpeaking]);

  const speak = useCallback(async (text: string, options?: { rate?: number }): Promise<void> => {
    if (!text?.trim()) {
      setError('No text to speak');
      return;
    }

    // Try to initialize speech synthesis if not ready
    if (!synthesisRef.current && typeof window !== 'undefined' && window.speechSynthesis) {
      synthesisRef.current = window.speechSynthesis;
      setIsSupported(true);
    }
    
    if (!synthesisRef.current) {
      setError('Speech synthesis not available in this browser');
      return;
    }
    
    // Clear any existing speech
    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    stopSpeaking();
    setCurrentText(text.trim());
    setProgress(0);

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utteranceRef.current = utterance;

      // Enhanced voice selection with fallback handling
      let preferredVoice: SpeechSynthesisVoice | null = null;
      
      // Get fresh voices list
      const currentVoices = synthesisRef.current?.getVoices() || [];
      
      if (currentVoices.length > 0) {
        const englishVoices = currentVoices.filter(v => v.lang.includes('en'));
        preferredVoice = 
          englishVoices.find(v => v.name.includes('Neural') || v.name.includes('Premium')) ||
          englishVoices.find(v => v.name.includes('Natural')) || 
          englishVoices.find(v => v.name.includes('Google')) ||
          englishVoices.find(v => v.name.includes('Microsoft')) ||
          englishVoices.find(v => v.localService === false) || // Prefer cloud voices
          englishVoices[0] ||
          currentVoices[0]; // Fallback to any available voice
      } else if (voices.length > 0) {
        // Use stored voices if current list is empty
        const englishVoices = voices.filter(v => v.lang.includes('en'));
        preferredVoice = englishVoices[0] || voices[0];
      }
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Enhanced speech settings
      const rate = options?.rate || speechRate;
      utterance.rate = Math.max(0.5, Math.min(2.0, rate)); // Clamp between 0.5 and 2.0
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Progress tracking
      let startTime: number;
      const textLength = text.length;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
        startTime = Date.now();
        
        // Simulate progress for better UX
        progressIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const estimatedDuration = (textLength / rate) * 100; // Rough estimation
          const progressPercent = Math.min(95, (elapsed / estimatedDuration) * 100);
          setProgress(progressPercent);
        }, 100);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setProgress(100);
        setCurrentText('');
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setTimeout(() => setProgress(0), 1000); // Reset progress after delay
        resolve();
      };
      
      utterance.onerror = (err) => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(0);
        setCurrentText('');
        handleError(err);
        resolve();
      };

      // Enhanced boundary event for better progress tracking
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const wordProgress = (event.charIndex / textLength) * 100;
          setProgress(Math.min(95, wordProgress));
        }
      };

      try {
        // Additional check before speaking
        if (!synthesisRef.current) {
          throw new Error('Speech synthesis not available');
        }
        
        setIsSpeaking(true);
        synthesisRef.current.speak(utterance);
      } catch (err) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(0);
        setCurrentText('');
        
        // Provide more specific error messages
        const errorMessage = err instanceof Error ? err.message : 'Unknown speech error';
        console.error('Speech synthesis error:', errorMessage);
        setError(`Speech failed: ${errorMessage}`);
        resolve();
      }
    });
  }, [voices, stopSpeaking, handleError, speechRate]);

  // Adjust speech rate
  const adjustSpeechRate = useCallback((rate: number) => {
    setSpeechRate(Math.max(0.5, Math.min(2.0, rate)));
  }, []);

  return { 
    isSpeaking, 
    speak, 
    stopSpeaking,
    error,
    progress,
    currentText,
    speechRate,
    voices,
    isSupported,
    isInitialized,
    adjustSpeechRate,
    clearError: () => setError(null)
  };
};
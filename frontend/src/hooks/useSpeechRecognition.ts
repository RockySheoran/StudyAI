import { useState, useEffect, useRef, useCallback } from 'react';

// Mobile detection utility
const isMobile = () => {
  return typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))
  );
};

// Enhanced mobile text cleaning utility
const cleanTextForMobile = (text: string): string => {
  if (!text) return '';
  
  // Advanced cleaning for progressive repetition like "Hello Hello my Hello my name"
  let cleanedText = text.trim();
  
  // Split into words for advanced processing
  const words = cleanedText.split(/\s+/);
  const finalWords: string[] = [];
  
  // Remove progressive repetition patterns
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    
    // Check if this word starts a repetitive pattern
    let isPartOfRepetition = false;
    
    // Look for patterns where the current sequence is repeated
    for (let len = 1; len <= Math.min(5, words.length - i); len++) {
      const sequence = words.slice(i, i + len);
      const nextSequence = words.slice(i + len, i + len * 2);
      
      // If we find the same sequence repeated, skip the repetition
      if (sequence.length === nextSequence.length && 
          sequence.every((word, idx) => word.toLowerCase() === nextSequence[idx]?.toLowerCase())) {
        isPartOfRepetition = true;
        break;
      }
    }
    
    // Only add if it's not part of a repetition or if it's the first occurrence
    if (!isPartOfRepetition) {
      finalWords.push(currentWord);
    }
  }
  
  // Additional cleanup for remaining repetitions
  const result = finalWords.join(' ')
    .replace(/(\b\w+\b)(\s+\1\b)+/gi, '$1') // Remove any remaining word repetitions
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// Advanced text cleaning and processing utility
const cleanText = (text: string): string => {
  if (!text) return '';
  
  // Normalize text
  let cleanedText = text.trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[.,!?]+$/, '') // Remove trailing punctuation
    .toLowerCase();
  
  // Split into words and remove excessive repetition
  const words = cleanedText.split(/\s+/);
  const cleanedWords: string[] = [];
  let consecutiveCount = 1;
  
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    
    if (currentWord === prevWord) {
      consecutiveCount++;
      // Allow max 2 consecutive identical words
      if (consecutiveCount <= 2) {
        cleanedWords.push(words[i]);
      }
    } else {
      consecutiveCount = 1;
      cleanedWords.push(words[i]);
    }
  }
  
  // Capitalize first letter and restore proper sentence structure
  const result = cleanedWords.join(' ').trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// Speech confidence and quality assessment
const assessSpeechQuality = (results: any): { confidence: number; quality: 'high' | 'medium' | 'low' } => {
  if (!results || results.length === 0) return { confidence: 0, quality: 'low' };
  
  const lastResult = results[results.length - 1];
  const confidence = lastResult[0]?.confidence || 0;
  
  let quality: 'high' | 'medium' | 'low' = 'low';
  if (confidence > 0.8) quality = 'high';
  else if (confidence > 0.5) quality = 'medium';
  
  return { confidence, quality };
};

export const useSpeechRecognition = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [speechQuality, setSpeechQuality] = useState<'high' | 'medium' | 'low'>('low');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef(''); 
  const lastProcessedTextRef = useRef(''); 
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobileDevice = useRef(isMobile());
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFinalResultRef = useRef('');
  const isListeningRef = useRef(isListening);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionActiveRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setText('');
    finalTranscriptRef.current = '';
    lastProcessedTextRef.current = '';
    lastFinalResultRef.current = '';
    setConfidence(0);
    setSpeechQuality('low');
    setIsProcessing(false);
    
    // Clear all timers
    [debounceTimerRef, processingTimerRef, restartTimeoutRef].forEach(timerRef => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    });
  }, []);

  const updateText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleResult = useCallback((event: any) => {
    if (!isListeningRef.current) {
      console.log('Received result but not listening anymore, ignoring');
      return;
    }
    
    console.log('Speech result received:', event.results);
    setIsProcessing(true);
    
    // Clear previous processing timer
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
    }
    processingTimerRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, 500);
    
    let interimTranscript = '';
    let finalTranscript = '';
    
    const { confidence: speechConfidence, quality } = assessSpeechQuality(event.results);
    setConfidence(speechConfidence);
    setSpeechQuality(quality);
    
    console.log('Speech quality:', quality, 'Confidence:', speechConfidence);
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Process final transcript - ALWAYS APPEND TO EXISTING TEXT
    if (finalTranscript) {
      const cleanedFinal = isMobileDevice.current ? 
        cleanTextForMobile(finalTranscript) : 
        finalTranscript.trim();
      
      console.log('Final transcript after cleaning:', cleanedFinal);
      
      // Avoid processing the same final result multiple times
      if (cleanedFinal && cleanedFinal !== lastFinalResultRef.current) {
        lastFinalResultRef.current = cleanedFinal;
        
        // CRITICAL CHANGE: Always append to existing text instead of replacing
        // For both mobile and desktop, append to previous text
        const newText = finalTranscriptRef.current ? 
          `${finalTranscriptRef.current} ${cleanedFinal}` : 
          cleanedFinal;
        
        finalTranscriptRef.current = newText;
        setText(newText);
        lastProcessedTextRef.current = cleanedFinal;
      }
    } 
    // Handle interim results - show them alongside the accumulated final text
    else if (interimTranscript) {
      const cleanedInterim = isMobileDevice.current ? 
        cleanTextForMobile(interimTranscript) : 
        interimTranscript;
      
      // For mobile, use debouncing to prevent excessive updates
      if (isMobileDevice.current) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          if (cleanedInterim && isListeningRef.current) {
            // Show interim results alongside accumulated final results
            const displayText = finalTranscriptRef.current ? 
              `${finalTranscriptRef.current} ${cleanedInterim}` : 
              cleanedInterim;
            setText(displayText);
          }
        }, 200);
      } else {
        // Desktop - show interim alongside accumulated final text
        const displayText = finalTranscriptRef.current ? 
          `${finalTranscriptRef.current} ${cleanedInterim}` : 
          cleanedInterim;
        setText(displayText);
      }
    }
  }, []);

  const handleError = useCallback((event: any) => {
    console.error('Recognition error:', event.error, 'Details:', event);
    
    // Clear all timers on error
    [debounceTimerRef, processingTimerRef, restartTimeoutRef].forEach(timerRef => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    });
    
    let errorMessage = 'Microphone error';
    
    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
        break;
      case 'no-speech':
        console.log('No speech detected - continuing recording...');
        return; // Ignore no-speech errors to keep recording
      case 'aborted':
        console.log('Recognition aborted');
        return;
      case 'audio-capture':
        errorMessage = 'Microphone not available. Please check your device.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = `Recognition error: ${event.error}`;
    }
    
    setError(errorMessage);
    setIsListening(false);
    isListeningRef.current = false;
    recognitionActiveRef.current = false;
  }, []);

  const restartRecognition = useCallback(() => {
    if (!isListeningRef.current || !recognitionRef.current) return;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    restartTimeoutRef.current = setTimeout(() => {
      if (isListeningRef.current && recognitionRef.current) {
        try {
          console.log('Restarting recognition for continuous listening...');
          recognitionRef.current.start();
          recognitionActiveRef.current = true;
        } catch (err) {
          console.error('Error restarting recognition:', err);
          // Try again after a longer delay
          restartTimeoutRef.current = setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                recognitionActiveRef.current = true;
              } catch (retryErr) {
                console.error('Retry failed:', retryErr);
              }
            }
          }, 1000);
        }
      }
    }, 100);
  }, []);

  const startListening = useCallback(async () => {
    if (isListeningRef.current) {
      console.log('Already listening, resetting transcript');
      resetTranscript();
      return;
    }
    
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    setError(null);
    resetTranscript();
    setIsListening(true);
    isListeningRef.current = true;

    console.log(`Starting continuous speech recognition for ${isMobileDevice.current ? 'mobile' : 'desktop'}...`);

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Continuous recording settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = isMobileDevice.current ? 1 : 3;
      recognition.lang = 'en-US';
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      
      // Handle automatic restarts for continuous listening
      recognition.onend = () => {
        console.log('Recognition session ended, restarting for continuous listening...');
        recognitionActiveRef.current = false;
        
        if (isListeningRef.current) {
          restartRecognition();
        }
      };

      recognition.onspeechstart = () => {
        console.log('Speech detected');
      };

      recognition.onspeechend = () => {
        console.log('Speech ended, but continuing to listen...');
      };

      // Start recognition
      await new Promise<void>((resolve, reject) => {
        const startTimeout = setTimeout(() => {
          reject(new Error('Recognition start timeout'));
        }, 10000);
        
        recognition.onstart = () => {
          clearTimeout(startTimeout);
          console.log('Continuous recognition started successfully');
          recognitionActiveRef.current = true;
          resolve();
        };
        
        try {
          recognition.start();
        } catch (startError) {
          clearTimeout(startTimeout);
          reject(startError);
        }
      });
    } catch (err: any) {
      console.error('Error starting recognition:', err);
      
      let errorMessage = 'Failed to access microphone';
      if (err.message === 'Recognition start timeout') {
        errorMessage = 'Microphone setup timed out. Please try again.';
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access.';
      } else {
        errorMessage = `Microphone error: ${err.message || 'Unknown error'}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      isListeningRef.current = false;
      recognitionActiveRef.current = false;
      throw new Error(errorMessage);
    }
  }, [handleResult, handleError, resetTranscript, restartRecognition]);

  const stopListening = useCallback(() => {
    if (!isListeningRef.current) return;
    
    console.log('Manually stopping continuous recognition...');
    
    // Clear all timers
    [debounceTimerRef, processingTimerRef, restartTimeoutRef].forEach(timerRef => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    });
    
    // Stop recognition if active
    if (recognitionRef.current && recognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    
    setIsListening(false);
    isListeningRef.current = false;
    recognitionActiveRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timers
      [debounceTimerRef, processingTimerRef, restartTimeoutRef].forEach(timerRef => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      });
      
      // Stop recognition if active
      if (recognitionRef.current && recognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition on unmount:', err);
        }
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    text,
    isListening,
    error,
    confidence,
    speechQuality,
    isProcessing,
    startListening,
    stopListening,
    setText: updateText,
    resetTranscript,
    clearError,
    isMobile: isMobileDevice.current,
  };
};
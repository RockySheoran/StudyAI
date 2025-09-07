import { useState, useEffect, useRef, useCallback } from 'react';

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
};

// Enhanced mobile text cleaning utility
const cleanTextForMobile = (text: string): string => {
  if (!text) return '';
  
  // More conservative cleaning - only remove obvious repetitions
  let cleanedText = text.trim();
  
  // Split into words for processing
  const words = cleanedText.split(/\s+/);
  const finalWords: string[] = [];
  
  // Simple deduplication - only remove consecutive duplicates
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const nextWord = i < words.length - 1 ? words[i + 1] : '';
    
    // Only add if not the same as previous or next word (consecutive duplicates)
    if (currentWord !== prevWord && currentWord !== nextWord) {
      finalWords.push(currentWord);
    }
  }
  
  const result = finalWords.join(' ')
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
    const nextWord = i < words.length - 1 ? words[i + 1] : '';
    
    if (currentWord === prevWord) {
      consecutiveCount++;
      // Allow max 1 consecutive identical words to prevent repetition
      if (consecutiveCount <= 1) {
        cleanedWords.push(words[i]);
      }
    } else if (currentWord !== nextWord) {
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
  const lastFinalResultRef = useRef(''); // Track the last final result to avoid duplicates
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(isListening);
  const restartAttemptsRef = useRef(0);
  const isStoppingRef = useRef(false); // Track if we're in the process of stopping

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
    restartAttemptsRef.current = 0;
    isStoppingRef.current = false;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  const updateText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const stopListening = useCallback(() => {
    if (!isListeningRef.current || !recognitionRef.current || isStoppingRef.current) return;
    
    isStoppingRef.current = true;
    
    try {
      // Clear all timers when manually stopping
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
        processingTimerRef.current = null;
      }
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      
      // Stop the recognition and prevent auto-restart
      recognitionRef.current.onend = null; // Remove the auto-restart handler
      recognitionRef.current.stop();
      
      setIsListening(false);
      isListeningRef.current = false;
      isStoppingRef.current = false;
      restartAttemptsRef.current = 0;
      
      console.log('Speech recognition manually stopped by user');
    } catch (err) {
      console.error('Error stopping recognition:', err);
      isStoppingRef.current = false;
    }
  }, []);

  const handleResult = useCallback((event: any) => {
    if (!isListeningRef.current) {
      console.log('Received result but not listening anymore, ignoring');
      return;
    }
    
    console.log('Speech result received:', event.results);
    setIsProcessing(true);
    
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

    // Process final transcript
    if (finalTranscript) {
      const cleanedFinal = isMobileDevice.current ? cleanTextForMobile(finalTranscript) : cleanText(finalTranscript);
      console.log('Final transcript after cleaning:', cleanedFinal);
      
      // Avoid processing the same final result multiple times
      if (cleanedFinal && cleanedFinal !== lastFinalResultRef.current) {
        lastFinalResultRef.current = cleanedFinal;
        
        // Append to previous text for both mobile and desktop
        finalTranscriptRef.current += cleanedFinal + ' ';
        const fullText = cleanText(finalTranscriptRef.current);
        setText(fullText);
        
        lastProcessedTextRef.current = cleanedFinal;
        console.log('Updated text with final result:', cleanedFinal);
      }
    } 
    // Handle interim results
    else if (interimTranscript) {
      const cleanedInterim = isMobileDevice.current ? cleanTextForMobile(interimTranscript) : cleanText(interimTranscript);
      console.log('Interim transcript after cleaning:', cleanedInterim);
      
      // Show interim results along with final results
      const fullText = cleanText(finalTranscriptRef.current + ' ' + cleanedInterim);
      setText(fullText);
    }
  }, []);

  const handleError = useCallback((event: any) => {
    console.error('Recognition error:', event.error, 'Details:', event);
    
    // Don't handle errors if we're in the process of stopping
    if (isStoppingRef.current) return;
    
    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        setError('NotAllowedError: Microphone access denied');
        setIsListening(false);
        isListeningRef.current = false;
        break;
      case 'no-speech':
        // Ignore no-speech errors and restart immediately
        console.log('No speech detected - continuing listening...');
        return;
      case 'aborted':
        console.log('Recognition aborted - restarting if still listening...');
        if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
              try {
                recognitionRef.current.start();
                console.log('Restarted after abort');
              } catch (err) {
                console.error('Failed to restart after abort:', err);
              }
            }
          }, 100);
        }
        return;
      case 'audio-capture':
        setError('NotFoundError: Microphone not available');
        setIsListening(false);
        isListeningRef.current = false;
        break;
      case 'network':
        setError('Network error. Please check your connection.');
        setIsListening(false);
        isListeningRef.current = false;
        break;
      default:
        // For any other error, try to restart if still listening
        console.log(`Unknown error ${event.error} - attempting restart...`);
        if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
              try {
                recognitionRef.current.start();
                console.log('Restarted after unknown error');
              } catch (err) {
                console.error('Failed to restart after unknown error:', err);
                setError(`${event.error}: Recognition failed`);
                setIsListening(false);
                isListeningRef.current = false;
              }
            }
          }, 100);
        } else {
          setError(`${event.error}: Recognition failed`);
          setIsListening(false);
          isListeningRef.current = false;
        }
    }
  }, []);

  const startListening = useCallback(async () => {
    if (isListeningRef.current) {
      // If already listening, just reset the transcript
      resetTranscript();
      return;
    }
    
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }

    setError(null);
    resetTranscript();
    setIsListening(true);
    isListeningRef.current = true;
    isStoppingRef.current = false;
    restartAttemptsRef.current = 0;

    console.log('Starting speech recognition for mobile/desktop...');

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Continuous recording settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1; // Reduced to 1 to prevent repetition
      recognition.lang = 'en-US';
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      
      // Handle recognition end - restart automatically
      recognition.onend = () => {
        console.log('Recognition ended, isListening:', isListeningRef.current, 'isStopping:', isStoppingRef.current);
        
        // Don't auto-restart if we're manually stopping
        if (isStoppingRef.current) {
          console.log('Not restarting - manual stop in progress');
          return;
        }
        
        // Auto-restart if still listening
        if (isListeningRef.current) {
          restartAttemptsRef.current++;
          
          // Prevent infinite restart loops
          if (restartAttemptsRef.current > 5) {
            console.error('Too many restart attempts, stopping recognition');
            setIsListening(false);
            isListeningRef.current = false;
            setError('Speech recognition stopped due to too many restarts');
            return;
          }
          
          try {
            setTimeout(() => {
              if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
                console.log('Restarting recognition for continuous recording...');
                try {
                  recognition.start();
                } catch (startErr) {
                  console.error('Error in recognition.start():', startErr);
                }
              }
            }, 100);
          } catch (err) {
            console.error('Error in onend handler:', err);
          }
        }
      };

      // Start the recognition
      await new Promise<void>((resolve, reject) => {
        recognition.onstart = () => {
          console.log('Recognition started successfully');
          restartAttemptsRef.current = 0;
          resolve();
        };
        
        const startTimeout = setTimeout(() => {
          console.error('Recognition start timeout');
          reject(new Error('timeout'));
        }, 5000);
        
        try {
          recognition.start();
          clearTimeout(startTimeout);
        } catch (startError) {
          console.error('Start error:', startError);
          clearTimeout(startTimeout);
          reject(startError);
        }
      });
    } catch (err: any) {
      console.error('Error starting recognition:', err);
      
      let errorMessage = 'Failed to access microphone';
      if (err.message === 'timeout') {
        errorMessage = 'Microphone setup timed out';
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied';
      } else {
        errorMessage = `${err.name || 'UnknownError'}: ${err.message || 'Failed to start recognition'}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [handleResult, handleError, resetTranscript]);

  useEffect(() => {
    return () => {
      // Cleanup function
      isStoppingRef.current = true;
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
      }
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition during cleanup:', err);
        }
      }
    };
  }, []);

  // Clear error function
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
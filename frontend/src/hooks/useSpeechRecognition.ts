import { useState, useEffect, useRef, useCallback } from 'react';

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
};

// Enhanced mobile text cleaning utility - FIXED VERSION
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
    
    // Only add if not the same as previous word (consecutive duplicates)
    if (currentWord !== prevWord) {
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
  const lastFinalResultRef = useRef(''); // Track the last final result to avoid duplicates
  const isListeningRef = useRef(isListening);

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
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
  }, []);

  const updateText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const stopListening = useCallback(() => {
    if (!isListeningRef.current || !recognitionRef.current) return;
    
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
      
      recognitionRef.current.stop();
      setIsListening(false);
      isListeningRef.current = false;
      console.log('Speech recognition manually stopped by user');
    } catch (err) {
      console.error('Error stopping recognition:', err);
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

    // Process final transcript with mobile-specific cleaning
    if (finalTranscript) {
      const cleanedFinal = isMobileDevice.current ? cleanTextForMobile(finalTranscript) : cleanText(finalTranscript);
      console.log('Final transcript after cleaning:', cleanedFinal);
      
      // Avoid processing the same final result multiple times
      if (cleanedFinal && cleanedFinal !== lastFinalResultRef.current) {
        lastFinalResultRef.current = cleanedFinal;
        
        // For mobile, use the original logic that doesn't cause echoing
        if (isMobileDevice.current) {
          finalTranscriptRef.current = cleanedFinal;
          setText(cleanedFinal);
        } else {
          // For desktop, append to previous text
          finalTranscriptRef.current += cleanedFinal + ' ';
          const fullText = cleanText(finalTranscriptRef.current);
          setText(fullText);
        }
        lastProcessedTextRef.current = cleanedFinal;
        console.log('Updated text with final result:', cleanedFinal);
      }
    } 
    // Handle interim results differently for mobile - FIXED to prevent echoing
    else if (interimTranscript) {
      const cleanedInterim = isMobileDevice.current ? cleanTextForMobile(interimTranscript) : cleanText(interimTranscript);
      console.log('Interim transcript after cleaning:', cleanedInterim);
      
      // For mobile, use the original logic that prevents echoing
      if (isMobileDevice.current) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          // Only update if the interim text is meaningfully different
          if (cleanedInterim && !finalTranscriptRef.current.includes(cleanedInterim)) {
            setText(cleanedInterim);
          }
        }, 150); // 150ms debounce for mobile
      } else {
        const fullText = cleanText(finalTranscriptRef.current + ' ' + cleanedInterim);
        setText(fullText);
      }
    }
  }, []);

  const handleError = useCallback((event: any) => {
    console.error('Recognition error:', event.error, 'Details:', event);
    let errorMessage = 'Microphone error';
    
    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        errorMessage = 'NotAllowedError: Microphone access denied';
        break;
      case 'no-speech':
        // Ignore no-speech errors for continuous recording
        console.log('No speech detected - continuing recording...');
        return; // Ignore no-speech errors to keep recording
      case 'aborted':
        console.log('Recognition aborted by user');
        return; // Ignore aborted errors (user stopped)
      case 'audio-capture':
        errorMessage = 'NotFoundError: Microphone not available';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = `${event.error}: Recognition failed`;
    }
    
    console.error('Setting error:', errorMessage);
    setError(errorMessage);
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  const startListening = useCallback(async () => {
    if (isListeningRef.current) {
      // If already listening, reset the transcript (clear previous text)
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

    console.log('Starting speech recognition for mobile/desktop...');

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Continuous recording settings for both mobile and desktop
      recognition.continuous = true; // Always continuous for uninterrupted recording
      recognition.interimResults = true;
      recognition.maxAlternatives = isMobileDevice.current ? 1 : 3;
      recognition.lang = 'en-US';
      
      // Mobile-specific settings - no auto-restart on audio end
      if (isMobileDevice.current) {
        recognition.onaudiostart = () => {
          console.log('Audio recording started on mobile');
        };
        
        recognition.onaudioend = () => {
          console.log('Audio recording ended on mobile - will restart if still listening');
          // Restart if we're still supposed to be listening
          if (isListeningRef.current && recognitionRef.current) {
            setTimeout(() => {
              try {
                if (isListeningRef.current && recognitionRef.current) {
                  console.log('Mobile: Restarting after audio end');
                  recognitionRef.current.start();
                }
              } catch (err) {
                console.error('Mobile: Error restarting after audio end:', err);
              }
            }, 100);
          }
        };
      }
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      
      // Handle recognition end - restart automatically for both mobile and desktop
      recognition.onend = () => {
        console.log('Recognition ended, isListening:', isListeningRef.current, 'isMobile:', isMobileDevice.current);
        
        // Auto-restart for both mobile and desktop if still listening
        if (isListeningRef.current) {
          try {
            const restartDelay = isMobileDevice.current ? 100 : 100;
            setTimeout(() => {
              if (isListeningRef.current && recognitionRef.current) {
                console.log(`${isMobileDevice.current ? 'Mobile' : 'Desktop'}: Restarting recognition for continuous recording...`);
                try {
                  recognition.start();
                } catch (startErr) {
                  console.error('Error in recognition.start():', startErr);
                  // Try again with a longer delay
                  setTimeout(() => {
                    if (isListeningRef.current && recognitionRef.current) {
                      try {
                        recognition.start();
                      } catch (retryErr) {
                        console.error('Retry failed:', retryErr);
                        setIsListening(false);
                        isListeningRef.current = false;
                      }
                    }
                  }, 200);
                }
              }
            }, restartDelay);
          } catch (err) {
            console.error('Error in onend handler:', err);
            setIsListening(false);
            isListeningRef.current = false;
          }
        }
      };

      await new Promise<void>((resolve, reject) => {
        recognition.onstart = () => {
          console.log('Recognition started successfully');
          resolve();
        };
        
        const startTimeout = setTimeout(() => {
          console.error('Recognition start timeout');
          reject(new Error('timeout'));
        }, isMobileDevice.current ? 10000 : 8000); // Longer timeout for mobile to handle slower initialization
        
        try {
          console.log('Attempting to start recognition...');
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
        errorMessage = 'timeout: Microphone setup timed out';
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'NotAllowedError: Microphone access denied';
      } else {
        errorMessage = `${err.name || 'UnknownError'}: ${err.message || 'Failed to start recognition'}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      isListeningRef.current = false;
      throw new Error(errorMessage);
    }
  }, [handleResult, handleError, resetTranscript]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
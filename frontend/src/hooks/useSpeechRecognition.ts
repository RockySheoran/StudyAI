import { useState, useEffect, useRef, useCallback } from 'react';

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
};

// Enhanced mobile text cleaning utility with better deduplication
const cleanTextForMobile = (text: string): string => {
  if (!text) return '';
  
  let cleanedText = text.trim().toLowerCase();
  
  // Split into words for processing
  const words = cleanedText.split(/\s+/);
  const finalWords: string[] = [];
  
  // Advanced deduplication - remove consecutive duplicates and patterns
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    const prevWord = finalWords.length > 0 ? finalWords[finalWords.length - 1] : '';
    
    // Skip if same as previous word (consecutive duplicate)
    if (currentWord === prevWord) {
      continue;
    }
    
    // Check for repetitive patterns (e.g., "my name my name")
    if (finalWords.length >= 2) {
      const prev2Word = finalWords[finalWords.length - 2];
      if (currentWord === prev2Word && prevWord === words[i - 1]) {
        // Skip this word as it's part of a repetitive pattern
        continue;
      }
    }
    
    finalWords.push(currentWord);
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
  
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    const prevWord = cleanedWords.length > 0 ? cleanedWords[cleanedWords.length - 1] : '';
    
    // Skip consecutive duplicates
    if (currentWord === prevWord) {
      continue;
    }
    
    // Check for alternating patterns (A B A B)
    if (cleanedWords.length >= 2) {
      const prev2Word = cleanedWords[cleanedWords.length - 2];
      if (currentWord === prev2Word) {
        // Skip this word as it's likely a repetitive pattern
        continue;
      }
    }
    
    // Check for longer repetitive sequences
    if (cleanedWords.length >= 3) {
      const prev3Word = cleanedWords[cleanedWords.length - 3];
      if (currentWord === prev3Word) {
        continue;
      }
    }
    
    cleanedWords.push(currentWord);
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
      
      // Avoid processing the same final result multiple times and empty results
      if (cleanedFinal && cleanedFinal.trim() && cleanedFinal !== lastFinalResultRef.current) {
        lastFinalResultRef.current = cleanedFinal;
        
        // For mobile, be more careful about appending to avoid duplication
        if (isMobileDevice.current) {
          // Check if this text is already contained in the current transcript
          const currentText = finalTranscriptRef.current.toLowerCase();
          const newText = cleanedFinal.toLowerCase();
          
          if (!currentText.includes(newText)) {
            finalTranscriptRef.current += cleanedFinal + ' ';
            const fullText = cleanTextForMobile(finalTranscriptRef.current);
            setText(fullText);
          }
        } else {
          // Desktop behavior - append normally
          finalTranscriptRef.current += cleanedFinal + ' ';
          const fullText = cleanText(finalTranscriptRef.current);
          setText(fullText);
        }
        
        lastProcessedTextRef.current = cleanedFinal;
        console.log('Updated text with final result:', cleanedFinal);
      }
    } 
    // Handle interim results (only for desktop to reduce mobile echo)
    else if (interimTranscript && !isMobileDevice.current) {
      const cleanedInterim = cleanText(interimTranscript);
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
        console.log('Audio capture error - attempting restart...');
        // Try to restart after audio capture error
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
            try {
              recognitionRef.current.start();
              console.log('Restarted after audio capture error');
            } catch (err) {
              setError('NotFoundError: Microphone not available');
              setIsListening(false);
              isListeningRef.current = false;
            }
          }
        }, 1000);
        break;
      case 'network':
        console.log('Network error - attempting restart...');
        // Try to restart after network error
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
            try {
              recognitionRef.current.start();
              console.log('Restarted after network error');
            } catch (err) {
              setError('Network error. Please check your connection.');
              setIsListening(false);
              isListeningRef.current = false;
            }
          }
        }, 2000);
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
          // Don't stop on unknown errors - log and continue
          console.log(`Unknown error ${event.error} - will keep trying to restart`);
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
              try {
                recognitionRef.current.start();
                console.log('Restarted after unknown error');
              } catch (err) {
                console.error('Failed to restart after unknown error, will try again:', err);
              }
            }
          }, 1000);
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
      
      // Handle recognition end - restart automatically (especially important for mobile)
      recognition.onend = () => {
        console.log('Recognition ended, isListening:', isListeningRef.current, 'isStopping:', isStoppingRef.current);
        
        // Don't auto-restart if we're manually stopping
        if (isStoppingRef.current) {
          console.log('Not restarting - manual stop in progress');
          return;
        }
        
        // Auto-restart if still listening (continuous mode for mobile)
        if (isListeningRef.current) {
          restartAttemptsRef.current++;
          
          // No restart limits - keep listening indefinitely until manually stopped
          // Reset restart counter periodically to prevent overflow
          if (restartAttemptsRef.current > 100) {
            restartAttemptsRef.current = 0;
            console.log('Reset restart counter to prevent overflow');
          }
          
          try {
            // Shorter delay for mobile to ensure seamless listening
            const restartDelay = isMobileDevice.current ? 50 : 100;
            
            setTimeout(() => {
              if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
                console.log('Restarting recognition for continuous recording... (attempt', restartAttemptsRef.current, ')');
                try {
                  recognition.start();
                  // Reset restart counter on successful start for both mobile and desktop
                  restartAttemptsRef.current = Math.max(0, restartAttemptsRef.current - 1);
                  console.log('Successfully restarted recognition, counter:', restartAttemptsRef.current);
                } catch (startErr) {
                  console.error('Error in recognition.start():', startErr);
                  // Continue trying to restart regardless of errors
                  // Only increment counter slightly to track attempts but never stop
                  restartAttemptsRef.current++;
                  
                  // Try again after a slightly longer delay if start fails
                  setTimeout(() => {
                    if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
                      try {
                        recognition.start();
                        console.log('Retry successful after start error');
                      } catch (retryErr) {
                        console.error('Retry failed, will try again on next cycle:', retryErr);
                      }
                    }
                  }, 500);
                }
              }
            }, restartDelay);
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
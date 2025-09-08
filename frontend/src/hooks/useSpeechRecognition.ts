import { useState, useEffect, useRef, useCallback } from 'react';

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
};

// Enhanced mobile text cleaning utility with aggressive deduplication
const cleanTextForMobile = (text: string): string => {
  if (!text) return '';
  
  let cleanedText = text.trim().toLowerCase();
  
  // Remove common repetitive patterns first
  cleanedText = cleanedText
    .replace(/(\b\w+\b)\s+\1\s+\1/g, '$1') // Remove triple repetitions
    .replace(/(\b\w+\b)\s+\1/g, '$1') // Remove double repetitions
    .replace(/(\b\w+\s+\w+\b)\s+\1/g, '$1') // Remove phrase repetitions
    .replace(/\s+/g, ' '); // Normalize spaces
  
  // Split into words for advanced processing
  const words = cleanedText.split(/\s+/);
  const finalWords: string[] = [];
  
  // Advanced deduplication with pattern detection
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];
    const prevWord = finalWords.length > 0 ? finalWords[finalWords.length - 1] : '';
    
    // Skip if same as previous word (consecutive duplicate)
    if (currentWord === prevWord) {
      continue;
    }
    
    // Check for alternating patterns (A B A)
    if (finalWords.length >= 2) {
      const prev2Word = finalWords[finalWords.length - 2];
      if (currentWord === prev2Word) {
        continue;
      }
    }
    
    // Check for longer repetitive sequences (A B C A B C)
    if (finalWords.length >= 3) {
      const prev3Word = finalWords[finalWords.length - 3];
      if (currentWord === prev3Word) {
        continue;
      }
    }
    
    // Check for phrase repetitions
    if (finalWords.length >= 4) {
      const lastTwoWords = finalWords.slice(-2).join(' ');
      const currentTwoWords = [prevWord, currentWord].join(' ');
      if (lastTwoWords === currentTwoWords) {
        continue;
      }
    }
    
    finalWords.push(currentWord);
  }
  
  const result = finalWords.join(' ').trim();
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
  const [showMobileFallback, setShowMobileFallback] = useState(false);
  const [mobileErrorCount, setMobileErrorCount] = useState(0);
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
  const processedTextsRef = useRef<Set<string>>(new Set()); // Track processed texts to avoid duplicates
  const lastErrorTimeRef = useRef(0); // Track last error time for debouncing

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setText('');
    finalTranscriptRef.current = '';
    lastProcessedTextRef.current = '';
    lastFinalResultRef.current = '';
    processedTextsRef.current.clear();
    setConfidence(0);
    setSpeechQuality('low');
    setIsProcessing(false);
    restartAttemptsRef.current = 0;
    isStoppingRef.current = false;
    lastErrorTimeRef.current = 0;
    setError(null); // Clear any existing errors
    
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
    }, isMobileDevice.current ? 300 : 500); // Faster processing for mobile
    
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

    // Process final transcript - clean only for mobile, keep original for desktop
    if (finalTranscript) {
      let processedFinal;
      
      if (isMobileDevice.current) {
        // Mobile: Apply aggressive cleaning to fix repetitive text
        processedFinal = cleanTextForMobile(finalTranscript);
        console.log('Mobile - Final transcript after cleaning:', processedFinal);
        
        // Check for repetitive patterns and show popup if detected
        const originalWords = finalTranscript.toLowerCase().split(/\s+/);
        const cleanedWords = processedFinal.toLowerCase().split(/\s+/);
        const reductionRatio = (originalWords.length - cleanedWords.length) / originalWords.length;
        
        // If we removed more than 30% of words due to repetition, show mobile fallback
        if (reductionRatio > 0.3 && originalWords.length > 5) {
          console.log('Significant repetition detected, showing mobile fallback');
          setShowMobileFallback(true);
        }
      } else {
        // Desktop/Laptop: Keep original speech exactly as spoken - NO CLEANING
        processedFinal = finalTranscript.trim();
        console.log('Desktop - Final transcript (original):', processedFinal);
      }
      
      // Enhanced duplicate prevention
      const textHash = processedFinal.toLowerCase().replace(/\s+/g, '');
      
      if (processedFinal && processedFinal.trim() && 
          processedFinal !== lastFinalResultRef.current && 
          !processedTextsRef.current.has(textHash)) {
        
        lastFinalResultRef.current = processedFinal;
        processedTextsRef.current.add(textHash);
        
        // Limit processed texts cache to prevent memory issues
        if (processedTextsRef.current.size > 50) {
          const textsArray = Array.from(processedTextsRef.current);
          processedTextsRef.current = new Set(textsArray.slice(-25));
        }
        
        if (isMobileDevice.current) {
          // Mobile: Enhanced duplicate checking
          const currentText = finalTranscriptRef.current.toLowerCase();
          const newText = processedFinal.toLowerCase();
          
          const words = newText.split(/\s+/);
          const currentWords = currentText.split(/\s+/);
          const overlap = words.filter(word => currentWords.includes(word)).length;
          const overlapRatio = overlap / words.length;
          
          // Only add if overlap is less than 70%
          if (overlapRatio < 0.7) {
            finalTranscriptRef.current += processedFinal + ' ';
            const fullText = cleanTextForMobile(finalTranscriptRef.current);
            setText(fullText);
          }
        } else {
          // Desktop: Append original text without any cleaning
          finalTranscriptRef.current += processedFinal + ' ';
          setText(finalTranscriptRef.current.trim());
        }
        
        lastProcessedTextRef.current = processedFinal;
        console.log('Updated text with final result:', processedFinal);
      }
    } 
    // Handle interim results
    else if (interimTranscript) {
      if (isMobileDevice.current) {
        // Mobile: Use debouncing for interim results with cleaning
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          const cleanedInterim = cleanTextForMobile(interimTranscript);
          const fullText = cleanTextForMobile(finalTranscriptRef.current + ' ' + cleanedInterim);
          setText(fullText);
        }, 150);
      } else {
        // Desktop: Show interim results immediately without cleaning
        const interimText = interimTranscript.trim();
        const fullText = (finalTranscriptRef.current + ' ' + interimText).trim();
        setText(fullText);
      }
    }
  }, []);

  const handleError = useCallback((event: any) => {
    console.error('Recognition error:', event.error, 'Details:', event);
    
    // Don't handle errors if we're in the process of stopping
    if (isStoppingRef.current) return;
    
    // Prevent error spam by debouncing
    const now = Date.now();
    if (now - lastErrorTimeRef.current < 1000) {
      console.log('Ignoring rapid error to prevent spam');
      return;
    }
    lastErrorTimeRef.current = now;
    
    // Track mobile errors for fallback detection
    if (isMobileDevice.current) {
      setMobileErrorCount(prev => {
        const newCount = prev + 1;
        // Show mobile fallback after 2 errors (faster detection)
        if (newCount >= 2) {
          setShowMobileFallback(true);
          setError('Mobile microphone issues detected. Consider using a laptop or desktop for better experience.');
          setIsListening(false);
          isListeningRef.current = false;
        }
        return newCount;
      });
    }
    
    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        setError('NotAllowedError: Microphone access denied');
        setIsListening(false);
        isListeningRef.current = false;
        if (isMobileDevice.current) {
          setShowMobileFallback(true);
        }
        break;
      case 'no-speech':
        // Ignore no-speech errors - they're normal
        console.log('No speech detected - continuing listening...');
        return;
      case 'aborted':
        console.log('Recognition aborted - will restart if needed');
        // Don't immediately restart on abort - let the onend handler do it
        return;
      case 'audio-capture':
        console.log('Audio capture error - attempting restart...');
        if (isMobileDevice.current) {
          setMobileErrorCount(prev => prev + 1);
        }
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
            try {
              recognitionRef.current.start();
              console.log('Restarted after audio capture error');
            } catch (err) {
              setError('NotFoundError: Microphone not available');
              setIsListening(false);
              isListeningRef.current = false;
              if (isMobileDevice.current) {
                setShowMobileFallback(true);
              }
            }
          }
        }, isMobileDevice.current ? 1500 : 1000);
        break;
      case 'network':
        console.log('Network error - attempting restart...');
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
        console.log(`Unknown error ${event.error} - will handle gracefully`);
        // Don't immediately restart on unknown errors - let the system stabilize
        if (!['service-not-allowed', 'bad-grammar'].includes(event.error)) {
          setError(`Speech recognition error: ${event.error}`);
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
      
      // Enhanced settings for mobile optimization
      recognition.continuous = true;
      recognition.interimResults = !isMobileDevice.current; // Disable interim for mobile to reduce repetition
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';
      
      // Mobile-specific optimizations - avoid setting grammars property on mobile
      if (isMobileDevice.current) {
        // Don't set grammars property on mobile devices as it causes TypeError
        // Mobile browsers handle this differently and don't support custom grammars
        console.log('Mobile device detected - skipping grammars configuration');
      } else {
        // Desktop/laptop can handle grammars if needed
        try {
          // Only set grammars on desktop if SpeechGrammarList is available
          if (typeof window !== 'undefined' && 'SpeechGrammarList' in window) {
            // You can add custom grammars here for desktop if needed
            // recognition.grammars = new SpeechGrammarList();
          }
        } catch (err) {
          console.log('Grammars not supported on this browser:', err);
        }
      }
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      
      // Handle recognition end - restart automatically with better error handling
      recognition.onend = () => {
        console.log('Recognition ended, isListening:', isListeningRef.current, 'isStopping:', isStoppingRef.current);
        
        // Don't auto-restart if we're manually stopping
        if (isStoppingRef.current) {
          console.log('Not restarting - manual stop in progress');
          return;
        }
        
        // Auto-restart if still listening with improved logic
        if (isListeningRef.current && recognitionRef.current) {
          restartAttemptsRef.current++;
          
          // Limit restart attempts to prevent infinite loops
          if (restartAttemptsRef.current > 10) {
            console.log('Too many restart attempts, stopping');
            setError('Speech recognition became unstable. Please try again.');
            setIsListening(false);
            isListeningRef.current = false;
            return;
          }
          
          const restartDelay = isMobileDevice.current ? 300 : 150;
          
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current && !isStoppingRef.current) {
              try {
                console.log('Restarting recognition... (attempt', restartAttemptsRef.current, ')');
                recognition.start();
                // Reset counter on successful start
                if (restartAttemptsRef.current > 0) {
                  restartAttemptsRef.current = Math.max(0, restartAttemptsRef.current - 1);
                }
              } catch (startErr) {
                console.error('Failed to restart recognition:', startErr);
                // Don't spam restart attempts
                if (restartAttemptsRef.current >= 5) {
                  setError('Unable to maintain speech recognition. Please try again.');
                  setIsListening(false);
                  isListeningRef.current = false;
                }
              }
            }
          }, restartDelay);
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
    showMobileFallback,
    mobileErrorCount,
    setShowMobileFallback,
  };
};
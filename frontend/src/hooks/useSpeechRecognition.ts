import { useState, useEffect, useRef, useCallback } from 'react';

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
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
  const lastFinalResultRef = useRef(''); // Track the last final result to avoid duplicates
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null); // Auto-stop timer for mobile

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
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const updateText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleResult = useCallback((event: any) => {
    console.log('Speech result received:', event.results);
    setIsProcessing(true);
    
    // Reset silence timer when we get speech input
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    // Set auto-stop timer for mobile (10 seconds of silence)
    if (isMobileDevice.current && isListening) {
      silenceTimerRef.current = setTimeout(() => {
        console.log('Auto-stopping due to silence on mobile');
        stopListening();
      }, 10000);
    }
    
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
        // For mobile, replace rather than append to prevent repetition
        if (isMobileDevice.current) {
          finalTranscriptRef.current = cleanedFinal;
          setText(cleanedFinal);
        } else {
          finalTranscriptRef.current += cleanedFinal + ' ';
          const fullText = cleanText(finalTranscriptRef.current);
          setText(fullText);
        }
        lastProcessedTextRef.current = cleanedFinal;
        console.log('Updated text with final result:', cleanedFinal);
      }
    } 
    // Handle interim results differently for mobile
    else if (interimTranscript) {
      const cleanedInterim = isMobileDevice.current ? cleanTextForMobile(interimTranscript) : cleanText(interimTranscript);
      console.log('Interim transcript after cleaning:', cleanedInterim);
      
      // For mobile, use debouncing to prevent excessive updates
      if (isMobileDevice.current) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          if (cleanedInterim && !finalTranscriptRef.current.includes(cleanedInterim)) {
            setText(cleanedInterim);
          }
        }, 150); // 150ms debounce for mobile
      } else {
        const fullText = cleanText(finalTranscriptRef.current + ' ' + cleanedInterim);
        setText(fullText);
      }
    }
  }, [isListening]);

  const handleError = useCallback((event: any) => {
    console.error('Recognition error:', event.error, 'Details:', event);
    let errorMessage = 'Microphone error';
    
    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        errorMessage = 'NotAllowedError: Microphone access denied';
        break;
      case 'no-speech':
        // On mobile, no-speech is very common, ignore it
        if (isMobileDevice.current) {
          console.log('No speech detected on mobile - continuing...');
          return; // Ignore on mobile
        }
        errorMessage = 'No speech detected. Please try speaking again.';
        break;
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
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) {
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

    console.log('Starting speech recognition for mobile/desktop...');

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Mobile-specific settings
      if (isMobileDevice.current) {
        recognition.continuous = false; // Changed to false for mobile to prevent repetition
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';
        
        recognition.onaudiostart = () => {
          console.log('Audio recording started on mobile');
        };
        
        recognition.onaudioend = () => {
          console.log('Audio recording ended on mobile');
        };
      } else {
        // Desktop settings
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognition.lang = 'en-US';
      }
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      
      // Modified onend handler for mobile
      recognition.onend = () => {
        console.log('Recognition ended, isListening:', isListening);
        
        if (isListening) {
          try {
            // For mobile, don't automatically restart - let user control it
            if (!isMobileDevice.current) {
              setTimeout(() => {
                if (isListening && recognitionRef.current) {
                  console.log('Restarting recognition on desktop...');
                  recognition.start();
                }
              }, 100);
            } else {
              // For mobile, just update the state
              setIsListening(false);
            }
          } catch (err) {
            console.error('Error in onend handler:', err);
            setIsListening(false);
          }
        }
      };

      await new Promise<void>((resolve, reject) => {
        recognition.onstart = () => {
          console.log('Recognition started successfully');
          setIsListening(true);
          resolve();
        };
        
        const startTimeout = setTimeout(() => {
          console.error('Recognition start timeout');
          reject(new Error('timeout'));
        }, isMobileDevice.current ? 5000 : 8000); // Shorter timeout for mobile
        
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
      throw new Error(errorMessage);
    }
  }, [isListening, handleResult, handleError, resetTranscript]);

  const stopListening = useCallback(() => {
    if (!isListening || !recognitionRef.current) return;
    
    try {
      // Clear silence timer when manually stopping
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }, [isListening]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
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





















// import { useState, useEffect, useRef, useCallback } from 'react';

// // Mobile detection utility - improved
// const isMobile = (): boolean => {
//   if (typeof window === 'undefined') return false;
  
//   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
//          (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) ||
//          window.innerWidth < 768;
// };

// // Enhanced mobile text cleaning utility
// const cleanTextForMobile = (text: string): string => {
//   if (!text) return '';
  
//   // Remove repeated phrases commonly seen on mobile (more precise)
//   let cleanedText = text
//     .replace(/(\b\w+\b)(?:\s+\1){2,}/g, '$1') // Remove words repeated 3+ times
//     .replace(/(\b\w+\b\s+\w+\b)(?:\s+\1)+/g, '$1') // Remove repeated phrases
//     .replace(/([.!?])\s*(?=[A-Z])/g, '$1 ') // Fix sentence spacing
//     .replace(/\s+/g, ' ') // Collapse multiple spaces
//     .trim();
  
//   return cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
// };

// // Speech confidence and quality assessment
// const assessSpeechQuality = (results: any): { confidence: number; quality: 'high' | 'medium' | 'low' } => {
//   if (!results || results.length === 0) return { confidence: 0, quality: 'low' };
  
//   const lastResult = results[results.length - 1];
//   const confidence = lastResult[0]?.confidence || 0;
  
//   let quality: 'high' | 'medium' | 'low' = 'low';
//   if (confidence > 0.8) quality = 'high';
//   else if (confidence > 0.5) quality = 'medium';
  
//   return { confidence, quality };
// };

// export const useSpeechRecognition = () => {
//   const [text, setText] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [confidence, setConfidence] = useState(0);
//   const [speechQuality, setSpeechQuality] = useState<'high' | 'medium' | 'low'>('low');
//   const [isProcessing, setIsProcessing] = useState(false);
  
//   const recognitionRef = useRef<any>(null);
//   const finalTranscriptRef = useRef(''); 
//   const lastProcessedTextRef = useRef(''); 
//   const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const isMobileDevice = useRef(isMobile());
//   const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const lastFinalResultRef = useRef('');
//   const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const isListeningRef = useRef(isListening); // Keep ref in sync with state

//   // Keep ref in sync with state
//   useEffect(() => {
//     isListeningRef.current = isListening;
//   }, [isListening]);

//   const resetTranscript = useCallback(() => {
//     setText('');
//     finalTranscriptRef.current = '';
//     lastProcessedTextRef.current = '';
//     lastFinalResultRef.current = '';
//     setConfidence(0);
//     setSpeechQuality('low');
//     setIsProcessing(false);
    
//     // Clear all timers
//     [debounceTimerRef, processingTimerRef, silenceTimerRef].forEach(timerRef => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//         timerRef.current = null;
//       }
//     });
//   }, []);

//   const updateText = useCallback((newText: string) => {
//     setText(newText);
//   }, []);

//   const handleResult = useCallback((event: any) => {
//     console.log('Speech result received:', event.results);
    
//     // Check if we're still listening (important for mobile)
//     if (!isListeningRef.current) {
//       console.log('Received result but not listening anymore, ignoring');
//       return;
//     }
    
//     setIsProcessing(true);
    
//     // Reset silence timer when we get speech input
//     if (silenceTimerRef.current) {
//       clearTimeout(silenceTimerRef.current);
//     }
    
//     // Set auto-stop timer for mobile (8 seconds of silence - shorter)
//     if (isMobileDevice.current && isListeningRef.current) {
//       silenceTimerRef.current = setTimeout(() => {
//         console.log('Auto-stopping due to silence on mobile');
//         if (recognitionRef.current && isListeningRef.current) {
//           recognitionRef.current.stop();
//         }
//       }, 8000);
//     }
    
//     // Clear previous processing timer
//     if (processingTimerRef.current) {
//       clearTimeout(processingTimerRef.current);
//     }
//     processingTimerRef.current = setTimeout(() => {
//       setIsProcessing(false);
//     }, 500);
    
//     let interimTranscript = '';
//     let finalTranscript = '';
    
//     const { confidence: speechConfidence, quality } = assessSpeechQuality(event.results);
//     setConfidence(speechConfidence);
//     setSpeechQuality(quality);
    
//     console.log('Speech quality:', quality, 'Confidence:', speechConfidence);
    
//     // Process all results
//     for (let i = event.resultIndex; i < event.results.length; i++) {
//       const transcript = event.results[i][0].transcript;
      
//       if (event.results[i].isFinal) {
//         finalTranscript += transcript + ' ';
//       } else {
//         interimTranscript += transcript;
//       }
//     }

//     // Process final transcript
//     if (finalTranscript) {
//       const cleanedFinal = isMobileDevice.current ? 
//         cleanTextForMobile(finalTranscript) : 
//         finalTranscript.trim();
      
//       console.log('Final transcript after cleaning:', cleanedFinal);
      
//       // Avoid processing the same final result multiple times
//       if (cleanedFinal && cleanedFinal !== lastFinalResultRef.current) {
//         lastFinalResultRef.current = cleanedFinal;
        
//         if (isMobileDevice.current) {
//           // For mobile, replace rather than append
//           finalTranscriptRef.current = cleanedFinal;
//           setText(cleanedFinal);
//         } else {
//           // For desktop, append to previous text
//           finalTranscriptRef.current += cleanedFinal + ' ';
//           setText(finalTranscriptRef.current.trim());
//         }
        
//         lastProcessedTextRef.current = cleanedFinal;
//       }
//     } 
//     // Handle interim results
//     else if (interimTranscript) {
//       const cleanedInterim = isMobileDevice.current ? 
//         cleanTextForMobile(interimTranscript) : 
//         interimTranscript;
      
//       // For mobile, use debouncing to prevent excessive updates
//       if (isMobileDevice.current) {
//         if (debounceTimerRef.current) {
//           clearTimeout(debounceTimerRef.current);
//         }
        
//         debounceTimerRef.current = setTimeout(() => {
//           if (cleanedInterim && isListeningRef.current) {
//             // Show interim results alongside final results on mobile
//             const displayText = finalTranscriptRef.current ? 
//               `${finalTranscriptRef.current} ${cleanedInterim}` : 
//               cleanedInterim;
//             setText(displayText);
//           }
//         }, 200); // Slightly longer debounce
//       } else {
//         // Desktop - show interim alongside final
//         const displayText = finalTranscriptRef.current ? 
//           `${finalTranscriptRef.current} ${cleanedInterim}` : 
//           cleanedInterim;
//         setText(displayText);
//       }
//     }
//   }, []); // Removed isListening dependency to avoid recreation

//   const handleError = useCallback((event: any) => {
//     console.error('Recognition error:', event.error, 'Details:', event);
    
//     // Clear all timers on error
//     [debounceTimerRef, processingTimerRef, silenceTimerRef].forEach(timerRef => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//         timerRef.current = null;
//       }
//     });
    
//     let errorMessage = 'Microphone error';
    
//     switch (event.error) {
//       case 'not-allowed':
//       case 'permission-denied':
//         errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
//         break;
//       case 'no-speech':
//         if (isMobileDevice.current) {
//           console.log('No speech detected on mobile');
//           return;
//         }
//         errorMessage = 'No speech detected. Please try speaking again.';
//         break;
//       case 'aborted':
//         console.log('Recognition aborted');
//         return;
//       case 'audio-capture':
//         errorMessage = 'Microphone not available. Please check your device.';
//         break;
//       case 'network':
//         errorMessage = 'Network error. Please check your connection.';
//         break;
//       default:
//         errorMessage = `Recognition error: ${event.error}`;
//     }
    
//     setError(errorMessage);
//     setIsListening(false);
//     isListeningRef.current = false;
//   }, []);

//   const startListening = useCallback(async () => {
//     if (isListeningRef.current) {
//       // If already listening, just reset the transcript
//       resetTranscript();
//       return;
//     }
    
//     if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
//       setError('Speech recognition not supported in this browser');
//       return;
//     }

//     setError(null);
//     resetTranscript();

//     console.log(`Starting speech recognition for ${isMobileDevice.current ? 'mobile' : 'desktop'}...`);

//     try {
//       const SpeechRecognition = (window as any).webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();
//       const recognition = recognitionRef.current;
      
//       // Configure based on device type
//       if (isMobileDevice.current) {
//         recognition.continuous = false; // Disable continuous mode for mobile
//         recognition.interimResults = true;
//         recognition.maxAlternatives = 1;
//         recognition.lang = 'en-US';
//       } else {
//         recognition.continuous = true;
//         recognition.interimResults = true;
//         recognition.maxAlternatives = 3;
//         recognition.lang = 'en-US';
//       }
      
//       recognition.onresult = handleResult;
//       recognition.onerror = handleError;
      
//       recognition.onend = () => {
//         console.log('Recognition ended');
        
//         // Clear silence timer
//         if (silenceTimerRef.current) {
//           clearTimeout(silenceTimerRef.current);
//           silenceTimerRef.current = null;
//         }
        
//         // For mobile, we're done
//         if (isMobileDevice.current) {
//           setIsListening(false);
//           isListeningRef.current = false;
//           return;
//         }
        
//         // For desktop, try to restart if we're still supposed to be listening
//         if (isListeningRef.current && recognitionRef.current) {
//           setTimeout(() => {
//             try {
//               if (isListeningRef.current && recognitionRef.current) {
//                 recognitionRef.current.start();
//               }
//             } catch (err) {
//               console.error('Error restarting recognition:', err);
//               setIsListening(false);
//               isListeningRef.current = false;
//             }
//           }, 100);
//         }
//       };

//       // Start recognition with timeout
//       await new Promise<void>((resolve, reject) => {
//         const startTimeout = setTimeout(() => {
//           reject(new Error('Recognition start timeout'));
//         }, isMobileDevice.current ? 5000 : 8000);
        
//         recognition.onstart = () => {
//           clearTimeout(startTimeout);
//           console.log('Recognition started successfully');
//           setIsListening(true);
//           isListeningRef.current = true;
//           resolve();
//         };
        
//         try {
//           recognition.start();
//         } catch (startError) {
//           clearTimeout(startTimeout);
//           reject(startError);
//         }
//       });
//     } catch (err: any) {
//       console.error('Error starting recognition:', err);
      
//       let errorMessage = 'Failed to access microphone';
//       if (err.message === 'Recognition start timeout') {
//         errorMessage = 'Microphone setup timed out. Please try again.';
//       } else if (err.name === 'NotAllowedError') {
//         errorMessage = 'Microphone access denied. Please allow microphone access.';
//       } else {
//         errorMessage = `Microphone error: ${err.message || 'Unknown error'}`;
//       }
      
//       setError(errorMessage);
//       setIsListening(false);
//       isListeningRef.current = false;
//       throw new Error(errorMessage);
//     }
//   }, [handleResult, handleError, resetTranscript]);

//   const stopListening = useCallback(() => {
//     if (!isListeningRef.current || !recognitionRef.current) return;
    
//     try {
//       // Clear all timers
//       [debounceTimerRef, processingTimerRef, silenceTimerRef].forEach(timerRef => {
//         if (timerRef.current) {
//           clearTimeout(timerRef.current);
//           timerRef.current = null;
//         }
//       });
      
//       recognitionRef.current.stop();
//       setIsListening(false);
//       isListeningRef.current = false;
//     } catch (err) {
//       console.error('Error stopping recognition:', err);
//     }
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       // Clear all timers
//       [debounceTimerRef, processingTimerRef, silenceTimerRef].forEach(timerRef => {
//         if (timerRef.current) {
//           clearTimeout(timerRef.current);
//         }
//       });
      
//       // Stop recognition if active
//       if (recognitionRef.current && isListeningRef.current) {
//         try {
//           recognitionRef.current.stop();
//         } catch (err) {
//           console.error('Error stopping recognition on unmount:', err);
//         }
//       }
//     };
//   }, []);

//   const clearError = useCallback(() => {
//     setError(null);
//   }, []);

//   return {
//     text,
//     isListening,
//     error,
//     confidence,
//     speechQuality,
//     isProcessing,
//     startListening,
//     stopListening,
//     setText: updateText,
//     resetTranscript,
//     clearError,
//     isMobile: isMobileDevice.current,
//   };
// };
import { useState, useEffect, useRef, useCallback } from 'react';

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
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
  const finalTranscriptRef = useRef(''); // Track final transcripts separately
  const lastProcessedTextRef = useRef(''); // Track last processed text to avoid duplicates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobileDevice = useRef(isMobile());
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTranscript = useCallback(() => {
    setText('');
    finalTranscriptRef.current = '';
    lastProcessedTextRef.current = '';
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

  const handleResult = useCallback((event: any) => {
    setIsProcessing(true);
    
    // Clear processing timer and set new one
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
    }
    processingTimerRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, 500);
    
    let interimTranscript = '';
    let finalTranscript = '';
    
    // Assess speech quality and confidence
    const { confidence: speechConfidence, quality } = assessSpeechQuality(event.results);
    setConfidence(speechConfidence);
    setSpeechQuality(quality);
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Process final transcript with enhanced cleaning
    if (finalTranscript) {
      const cleanedFinal = cleanText(finalTranscript);
      if (cleanedFinal && cleanedFinal !== lastProcessedTextRef.current) {
        finalTranscriptRef.current += cleanedFinal + ' ';
        const fullText = cleanText(finalTranscriptRef.current);
        setText(fullText);
        lastProcessedTextRef.current = cleanedFinal;
      }
    } 
    // Handle interim results with enhanced mobile logic
    else if (interimTranscript) {
      const cleanedInterim = cleanText(interimTranscript);
      
      if (isMobileDevice.current) {
        // Enhanced mobile debouncing with quality consideration
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        const debounceTime = quality === 'high' ? 100 : quality === 'medium' ? 150 : 200;
        debounceTimerRef.current = setTimeout(() => {
          const fullText = cleanText(finalTranscriptRef.current + ' ' + cleanedInterim);
          setText(fullText);
        }, debounceTime);
      } else {
        // Desktop: immediate update with quality check
        if (quality !== 'low') {
          const fullText = cleanText(finalTranscriptRef.current + ' ' + cleanedInterim);
          setText(fullText);
        }
      }
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
        // On mobile, no-speech is more common, so we handle it gracefully
        if (isMobileDevice.current) {
          return; // Ignore on mobile
        }
        errorMessage = 'No speech detected. Please try speaking again.';
        break;
      case 'aborted':
        return; // Ignore aborted errors (user stopped)
      case 'audio-capture':
        errorMessage = 'Microphone not available. Please check your device.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
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

    // Request microphone permission explicitly
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permissionError) {
      console.error('Microphone permission denied:', permissionError);
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Mobile-optimized settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Enhanced mobile and desktop optimizations
      if (isMobileDevice.current) {
        recognition.maxAlternatives = 3; // Allow more alternatives for better accuracy
        recognition.grammars = undefined; // Use default grammar
      } else {
        recognition.maxAlternatives = 5; // More alternatives on desktop
      }
      
      // Enhanced recognition settings for better understanding
      try {
        recognition.audioTrack = true;
        recognition.enableAutomaticPunctuation = true;
      } catch (e) {
        // Ignore if not supported
      }
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = () => {
        // Mobile browsers sometimes stop recognition unexpectedly
        if (isListening) {
          try {
            // Add a small delay before restarting on mobile to prevent rapid restarts
            if (isMobileDevice.current) {
              setTimeout(() => {
                if (isListening && recognitionRef.current) {
                  recognition.start();
                }
              }, 100);
            } else {
              recognition.start();
            }
          } catch (err) {
            console.error('Error restarting recognition:', err);
            setIsListening(false);
          }
        }
      };

      await new Promise<void>((resolve, reject) => {
        recognition.onstart = () => {
          setIsListening(true);
          resolve();
        };
        
        // Add timeout for mobile devices
        const startTimeout = setTimeout(() => {
          reject(new Error('Recognition start timeout'));
        }, 5000);
        
        try {
          recognition.start();
          clearTimeout(startTimeout);
        } catch (startError) {
          clearTimeout(startTimeout);
          reject(startError);
        }
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
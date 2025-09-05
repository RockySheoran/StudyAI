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
    console.log('Speech result received:', event.results);
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
    
    console.log('Speech quality:', quality, 'Confidence:', speechConfidence);
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      console.log('Transcript:', transcript, 'isFinal:', event.results[i].isFinal);
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Process final transcript with enhanced cleaning
    if (finalTranscript) {
      const cleanedFinal = cleanText(finalTranscript);
      console.log('Final transcript:', cleanedFinal);
      
      if (cleanedFinal && cleanedFinal !== lastProcessedTextRef.current) {
        finalTranscriptRef.current += cleanedFinal + ' ';
        const fullText = cleanText(finalTranscriptRef.current);
        setText(fullText);
        lastProcessedTextRef.current = cleanedFinal;
        console.log('Updated text:', fullText);
      }
    } 
    // Handle interim results - simplified for mobile
    else if (interimTranscript) {
      const cleanedInterim = cleanText(interimTranscript);
      console.log('Interim transcript:', cleanedInterim);
      
      // Simplified approach - always update for better responsiveness
      const fullText = cleanText(finalTranscriptRef.current + ' ' + cleanedInterim);
      setText(fullText);
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
    if (isListening) return;
    
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }

    setError(null);
    resetTranscript();

    // Simplified permission handling - let speech recognition handle it
    // This approach works better on mobile devices
    console.log('Starting speech recognition for mobile/desktop...');

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Optimized settings for mobile devices
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Mobile-specific optimizations
      if (isMobileDevice.current) {
        recognition.maxAlternatives = 1; // Simpler for mobile
        // Don't set grammars on mobile - can cause issues
      } else {
        recognition.maxAlternatives = 3; // Desktop can handle more
      }
      
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = () => {
        console.log('Recognition ended, isListening:', isListening);
        // Mobile browsers sometimes stop recognition unexpectedly
        if (isListening) {
          try {
            // Longer delay for mobile to prevent issues
            const restartDelay = isMobileDevice.current ? 300 : 100;
            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                console.log('Restarting recognition...');
                recognition.start();
              }
            }, restartDelay);
          } catch (err) {
            console.error('Error restarting recognition:', err);
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
        
        // Longer timeout for mobile devices
        const startTimeout = setTimeout(() => {
          console.error('Recognition start timeout');
          reject(new Error('timeout'));
        }, 8000);
        
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
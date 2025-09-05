import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { feedback, IInterview } from '@/types/Interview-type';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, MicOff, Volume2, VolumeX, AlertCircle, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { BiCaretDownCircle } from "react-icons/bi";
import { FeedbackService } from '@/Actions/Interview/interviewService';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import router from 'next/navigation';

interface InterviewContainerProps {
  id: string,
  interview: IInterview;
  onSendMessage: (message?: string) => Promise<void>;
  onComplete: () => void;
  isCompleting?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const InterviewContainer = ({
  id,
  interview,
  onSendMessage,
  onComplete,
  isCompleting,
  isLoading = false,
  error = null,
}: InterviewContainerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showDetails = searchParams.get('details') === 'true';
  const [showMsgBox, setShowMsgBox] = useState(showDetails);
  const [manualSpeechEnabled, setManualSpeechEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(null);
  const [spokenMessageIds, setSpokenMessageIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<feedback>({
    rating: 0,
    suggestions: [],
    strengths: []
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Speech recognition hook
  const {
    text: speechText,
    isListening,
    error: speechError,
    confidence,
    speechQuality,
    isProcessing,
    startListening,
    stopListening,
    resetTranscript,
    clearError: clearSpeechError,
    isMobile,
  } = useSpeechRecognition();
  
  // Speech synthesis hook
  const { 
    isSpeaking, 
    speak, 
    stopSpeaking,
    error: synthesisError,
    progress: speechProgress,
    currentText: currentSpeechText,
    speechRate,
    isSupported: speechSupported,
    isInitialized: speechInitialized,
    adjustSpeechRate,
    clearError: clearSynthesisError
  } = useSpeechSynthesis();

  // Clear all errors
  const clearErrors = useCallback(() => {
    setApiError(null);
    clearSynthesisError();
    clearSpeechError();
  }, [clearSynthesisError, clearSpeechError]);

  // Toggle item expansion
  const toggleExpand = (type: string, index: number) => {
    const key = `${type}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getFeedback = useCallback(async () => {
    setIsFeedbackSubmitting(true);
    try {
      //get feedback
      const response = await FeedbackService(id);
      console.log(response)
      setFeedback(response.feedback);
      if(response.feedback){

        setShowFeedbackModal(true);
      }
    } catch (err) {
      console.error('Error getting feedback:', err);
      toast.error('Failed to get feedback. Please try again.');
    } finally {
      setIsFeedbackSubmitting(false);
    }
  }, [id]);

  // Handle sending messages
  const handleSubmit = useCallback(async (message?: string) => {
    const messageToSend = message || inputText;
    if (!messageToSend.trim()) {
      toast.error('Please enter your response');
      return;
    }
    
    setIsSubmitting(true);
    clearErrors();
    stopSpeaking();
    stopListening();

    try {
      await onSendMessage(messageToSend);
      setInputText('');
      resetTranscript();
    } catch (err) {
      console.error('Error sending message:', err);
      setApiError('Failed to send message');
      toast.error('Failed to send your message. Please try again.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [inputText, onSendMessage, stopListening, stopSpeaking, resetTranscript, clearErrors]);

  // Auto-scroll to bottom when new messages arrive or when coming from history
  useEffect(() => {
    if (messagesEndRef.current && interview?.messages?.length) {
      const shouldAutoScroll = showMsgBox || interview?.messages?.length > 0;
      if (shouldAutoScroll) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [interview?.messages?.length, showMsgBox]);

  // Handle speaking assistant messages - single effect to prevent duplicates
  useEffect(() => {
    if (!interview?.messages?.length || !manualSpeechEnabled || isSpeaking) return;

    const lastMessage = interview.messages[interview.messages.length - 1];
    const currentMessageIndex = interview.messages.length - 1;
    const messageId = `${currentMessageIndex}-${lastMessage.timestamp || Date.now()}`;
    
    // Only speak new assistant messages that haven't been spoken yet
    if (lastMessage.role === 'assistant' && 
        lastMessage.content?.trim() && 
        activeMessageIndex !== currentMessageIndex &&
        !spokenMessageIds.has(messageId)) {
      
      // Speaking new assistant message
      setActiveMessageIndex(currentMessageIndex);
      setSpokenMessageIds(prev => new Set(prev).add(messageId));
      
      // Immediate speech without delay for better responsiveness
      speak(lastMessage.content).catch(err => {
        console.error('Error speaking message:', err);
        setApiError('Failed to speak response');
        toast.error('Failed to speak the response');
      });
    }
  }, [interview?.messages, manualSpeechEnabled, isSpeaking, speak]);

  // Toggle speech recognition with enhanced permission handling
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
      return;
    }

    // Don't start listening if assistant is speaking
    if (isSpeaking) {
      return;
    }

    try {
      clearErrors();
      
      // Show user-friendly message while requesting permission
      if (isMobile) {
        toast.info('Requesting microphone access...');
      }
      
      await startListening();
      setInputText(''); // Clear input when starting to listen
      
      if (isMobile) {
        toast.success('Microphone activated! Start speaking.');
      }
    } catch (err) {
      console.error('Error starting microphone:', err);
      
      // Simplified error handling with better mobile support
      if (err instanceof Error) {
        console.log('Error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        
        if (err.message.includes('NotAllowedError') || err.message.includes('denied')) {
          setApiError('🎤 Microphone access denied. Please allow microphone access when prompted.');
          toast.error('Please allow microphone access when your browser asks.');
        } else if (err.message.includes('timeout')) {
          setApiError('⏱️ Microphone setup timed out. Please try again.');
          toast.error('Microphone setup timed out. Please try again.');
        } else if (err.message.includes('NotFoundError')) {
          setApiError('🔍 No microphone found. Please check your device.');
          toast.error('No microphone detected on your device.');
        } else if (err.message.includes('NotReadableError')) {
          setApiError('📱 Microphone is busy. Please close other apps using the microphone.');
          toast.error('Microphone is being used by another application.');
        } else {
          // Show the actual error for debugging
          setApiError(`🎤 Microphone: ${err.message}`);
          toast.error(`Microphone error: ${err.message}`);
        }
      } else {
        setApiError('🎤 Microphone access failed. Please check your device settings.');
        toast.error('Microphone access failed. Please check your permissions.');
      }
    }
  }, [isListening, isSpeaking, startListening, stopListening, clearErrors, isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Display text from speech recognition while listening with mobile optimization
  useEffect(() => {
    if (isListening && speechText) {
      // On mobile, we already have debounced and cleaned text from the hook
      setInputText(speechText);
    }
  }, [speechText, isListening]);

  // Toggle speech for the assistant
  const toggleAssistantSpeech = useCallback(() => {
    if (!speechSupported) {
      toast.error('Speech synthesis is not supported on this browser/device. Please try Chrome, Edge, or Safari.');
      return;
    }
    
    if (isSpeaking) {
      stopSpeaking();
    } else if (interview?.messages?.length) {
      const lastMessage = interview.messages[interview.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        speak(lastMessage.content).catch(err => {
          console.error('Error speaking message:', err);
          toast.error('Failed to speak the response. Please try refreshing the page.');
        });
      }
    }
  }, [isSpeaking, stopSpeaking, speak, interview?.messages, speechSupported]);

  // Enable continuous speech mode
  const enableContinuousSpeech = useCallback(() => {
    setManualSpeechEnabled(true);
    if (interview?.messages?.length) {
      const lastMessage = interview.messages[interview.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        speak(lastMessage.content).catch(err => {
          console.error('Error speaking message:', err);
          toast.error('Failed to speak the response');
        });
      }
    }
  }, [speak, interview?.messages]);

  // Render feedback item with expand/collapse functionality
  const renderFeedbackItem = (type: 'suggestions' | 'strengths', item: string, index: number) => {
    const key = `${type}-${index}`;
    const isExpanded = expandedItems[key] || false;
    const shouldTruncate = item.length > 150 && !isExpanded;
    
    return (
      <div key={index} className="mb-3 last:mb-0">
        <div className="flex items-start">
          <span className={cn(
            "flex-shrink-0 inline-block w-4 h-4 rounded-full mt-1 mr-2",
            type === 'strengths' ? 'bg-green-500' : 'bg-yellow-500'
          )} />
          <div>
            <p className={cn("text-sm", shouldTruncate ? "line-clamp-3" : "")}>
              {item}
            </p>
            {item.length > 150 && (
              <button
                onClick={() => toggleExpand(type, index)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                {isExpanded ? 'Show less' : 'Show full'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Interview Feedback</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Rating Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-3">Overall Rating</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold mr-4">
                  {feedback?.rating?.toFixed(1)}/5.0
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(feedback?.rating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Strengths Section */}
            {feedback.strengths.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3 text-green-800 dark:text-green-200">
                  Your Strengths
                </h3>
                <div className="space-y-2">
                  {feedback?.strengths?.map((item, index) => 
                    renderFeedbackItem('strengths', item, index)
                  )}
                </div>
              </div>
            )}
            
            {/* Suggestions Section */}
            {feedback.suggestions.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3 text-yellow-800 dark:text-yellow-200">
                  Areas for Improvement
                </h3>
                <div className="space-y-2">
                  {feedback?.suggestions?.map((item, index) => 
                    renderFeedbackItem('suggestions', item, index)
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowFeedbackModal(false)}
                className="mt-4"
              >
                Close Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Header - Fixed */}
       <div className="flex-shrink-0 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      {/* Mobile menu button and title */}
      <div className="md:hidden flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-lg font-semibold dark:text-white truncate">
            {interview.type === 'personal' ? 'Personal' : 'Technical'}
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleAssistantSpeech}
              className={cn(
                "p-1.5 sm:p-2 rounded-full transition-colors relative",
                isSpeaking ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
                !interview?.messages?.length || !speechSupported ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={!interview?.messages?.length || !speechSupported}
              aria-label={isSpeaking ? "Stop assistant" : "Hear last response"}
              title={!speechSupported ? "Speech not supported on this device" : (isSpeaking ? "Stop assistant" : "Hear last response")}
            >
              {!speechSupported ? (
                <div className="relative">
                  <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              ) : isSpeaking ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
            </button>
            {showMsgBox && !manualSpeechEnabled && (
              <button 
                onClick={enableContinuousSpeech}
                className="p-1.5 sm:p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                aria-label="Enable continuous speech"
                title="Enable auto-speech for new responses"
              >
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <BiCaretDownCircle size={25}/>
            )}
          </svg>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        {/* Title and volume button for desktop */}
        <div className="hidden md:flex items-center gap-3">
          <h2 className="text-lg lg:text-xl font-semibold dark:text-white">
            {interview.type === 'personal' ? 'Personal Interview' : 'Technical Interview'}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleAssistantSpeech}
              className={cn(
                "p-2 rounded-full transition-colors relative",
                isSpeaking ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
                !interview?.messages?.length || !speechSupported ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={!interview?.messages?.length || !speechSupported}
              aria-label={isSpeaking ? "Stop assistant" : "Hear last response"}
              title={!speechSupported ? "Speech not supported on this device" : (isSpeaking ? "Stop assistant" : "Hear last response")}
            >
              {!speechSupported ? (
                <div className="relative">
                  <Volume2 className="h-4 w-4 opacity-50" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              ) : isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            {showMsgBox && !manualSpeechEnabled && (
              <button 
                onClick={enableContinuousSpeech}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors text-sm font-medium"
                aria-label="Enable continuous speech"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Enable Auto-Speech
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile menu content */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 py-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
            {showMsgBox ? (
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-green-600 dark:text-green-400 py-2">Completed</span>
                {/* Speech Rate Control - Always show */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustSpeechRate(speechRate - 0.1)}
                    className="p-1 rounded text-gray-600 hover:bg-gray-100"
                    title="Slower speech"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs text-gray-600 min-w-[3rem] text-center">
                    {speechRate.toFixed(1)}x
                  </span>
                  <button
                    onClick={() => adjustSpeechRate(speechRate + 0.1)}
                    className="p-1 rounded text-gray-600 hover:bg-gray-100"
                    title="Faster speech"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                {!manualSpeechEnabled && (
                  <Button 
                    onClick={enableContinuousSpeech}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Enable Auto-Speech
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/interviews/history')}
                  className="w-full"
                >
                  History Page
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  onClick={onComplete}
                  disabled={isSubmitting || isSpeaking || isLoading || isCompleting}
                  className="w-full"
                >
                  {isCompleting ? 'Ending...' : 'End Interview'}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={getFeedback}
                  disabled={isFeedbackSubmitting || isSpeaking || isLoading}
                  className="w-full"
                >
                  {isFeedbackSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : 'Get Feedback'}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Desktop buttons */}
        <div className="hidden md:flex items-center">
          {showMsgBox ? (
            <div className="flex gap-2 justify-center items-center" >
              <span className="text-sm text-green-600 dark:text-green-400 mr-4">Completed</span>
              <Button 
                variant="outline" 
                onClick={() => router.push('/interviews/history')}
                className="min-w-[120px]"
              >
                History Page
              </Button>
              {/* <Button 
                variant="outline" 
                onClick={getFeedback}
                disabled={isFeedbackSubmitting || isSpeaking || isLoading}
                className="min-w-[120px]"
              >
                {isFeedbackSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : 'Get Feedback'}
              </Button> */}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onComplete}
                disabled={isSubmitting || isSpeaking || isLoading}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Ending...' : 'End Interview'}
              </Button>

              <Button 
                variant="outline" 
                onClick={getFeedback}
                disabled={isFeedbackSubmitting || isSpeaking || isLoading}
                className="min-w-[120px]"
              >
                {isFeedbackSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : 'Get Feedback'}
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Enhanced Messages Container - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 max-w-5xl w-full mx-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        <div className="space-y-4 sm:space-y-6 pb-4">
          {interview?.messages?.map((message, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={cn(
                "max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-5 py-3 sm:py-4 relative shadow-sm",
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200/50 dark:shadow-blue-900/30' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 shadow-gray-100/50 dark:shadow-gray-900/30'
              )}>
                <p className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">{message.content}</p>
                
                {/* Message timestamp */}
                <div className={cn(
                  "text-xs mt-2 opacity-70",
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                )}>
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                {message.role === 'assistant' && isSpeaking && activeMessageIndex === index && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-blue-500"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-blue-500"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-blue-500"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Assistant is speaking...</span>
                      </div>
                      
                      {speechProgress > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${speechProgress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                          <span className="text-xs text-blue-500 font-mono">{Math.round(speechProgress)}%</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          
          {(isLoading || isSubmitting) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-5 py-3 sm:py-4 max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-500" />
                    <div className="absolute inset-0 h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
                  </div>
                  <span className="font-medium text-sm sm:text-base">Processing your response...</span>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This may take a few moments
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1" />
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area - Fixed */}
      {(!interview.completedAt && !showMsgBox) && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg"
        >
          <div className="max-w-5xl mx-auto">
            {/* Speech Support Warning */}
            {!speechSupported && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm flex justify-between items-center border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Speech synthesis is not available on this browser/device. Please try Chrome, Edge, or Safari for voice features.</span>
                </div>
                <button 
                  onClick={clearErrors}
                  className="ml-2 p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800/50 rounded transition-colors"
                  aria-label="Dismiss warning"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}
            
            {(error || apiError || speechError || synthesisError) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm flex justify-between items-center border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error || apiError || speechError || synthesisError}</span>
                </div>
                <button 
                  onClick={clearErrors}
                  className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}
            
            <div className="relative">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 
                  (isMobile ? 
                    `🎤 Listening... ${speechQuality === 'high' ? '📶' : speechQuality === 'medium' ? '📶' : '📶'} ${confidence > 0 ? `(${Math.round(confidence * 100)}%)` : ''}` : 
                    `🎤 Speak now (${speechQuality} quality, ${Math.round(confidence * 100)}% confidence)...`
                  ) : 
                  "💬 Type your response or use voice input..."
                }
                className="w-full p-4 pr-14 min-h-[80px] max-h-[140px] resize-none border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 bg-white dark:bg-gray-800 text-base"
                disabled={isSubmitting || isSpeaking || isLoading}
              />
              <div className="absolute right-3 bottom-3 flex flex-col items-end gap-2">
                {/* Speech Quality Indicator */}
                {isListening && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/80 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1"
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      speechQuality === 'high' ? 'bg-green-400' : 
                      speechQuality === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                    )} />
                    <span>{Math.round(confidence * 100)}%</span>
                    {isProcessing && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    )}
                  </motion.div>
                )}
                
                {/* Speech Progress for Assistant */}
                {isSpeaking && speechProgress > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/80 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-2"
                  >
                    <div className="w-full bg-gray-300 rounded-full h-1.5">
                      <div 
                        className="h-full bg-blue-400 transition-all duration-200"
                        style={{ width: `${speechProgress}%` }}
                      />
                    </div>
                    <span>{Math.round(speechProgress)}%</span>
                  </motion.div>
                )}
                
                <motion.button
                  type="button"
                  onClick={toggleListening}
                  whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200 shadow-lg relative overflow-hidden",
                    isListening 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  )}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                  disabled={isSpeaking || isSubmitting}
                >
                  {/* Animated background for listening state */}
                  {isListening && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  <div className="relative z-10">
                    {isListening ? (
                      <div className="flex items-center justify-center">
                        <motion.div 
                          className="w-2 h-2 bg-white rounded-full mr-1"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-white rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="flex gap-2 flex-col sm:flex-row sm:gap-3 mt-3 sm:mt-4">
              <motion.div className="flex-1">
                <Button
                  onClick={() => handleSubmit()}
                  disabled={!inputText.trim() || isSubmitting || isSpeaking || isLoading}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Response
                    </>
                  )}
                </Button>
              </motion.div>
              
              {isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1"
                >
                  <Button
                    onClick={stopSpeaking}
                    className="w-full h-12 text-base font-medium"
                    variant="outline"
                    size="lg"
                    disabled={isSubmitting || isLoading}
                  >
                    <VolumeX className="w-5 h-5 mr-2" />
                    Stop Assistant
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
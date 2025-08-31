import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { feedback, IInterview } from '@/types/Interview-type';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
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
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();
  
  // Speech synthesis hook
  const { 
    isSpeaking, 
    speak, 
    stopSpeaking,
    error: synthesisError,
    clearError: clearSynthesisError
  } = useSpeechSynthesis();

  // Clear all errors
  const clearErrors = useCallback(() => {
    setApiError(null);
    clearSynthesisError();
  }, [clearSynthesisError]);

  // Toggle item expansion
  const toggleExpand = (type: string, index: number) => {
    const key = `${type}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  
  // Handle getting feedback
  const getFeedback = useCallback(async () => {
    setIsFeedbackSubmitting(true);
    try {
      const response = await FeedbackService(id);
      setFeedback(response.feedback);
      setShowFeedbackModal(true);
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
      
      console.log('🎤 Speaking new assistant message:', messageId);
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

  // Toggle speech recognition
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (isSpeaking) {
      toast.error('Please wait until the assistant finishes speaking');
      return;
    }

    try {
      clearErrors();
      await startListening();
      setInputText(''); // Clear input when starting to listen
    } catch (err) {
      console.error('Error starting microphone:', err);
      setApiError('Microphone access denied. Please allow microphone access.');
      toast.error('Microphone access denied. Please check your permissions.');
    }
  }, [isListening, isSpeaking, startListening, stopListening, clearErrors]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Display text from speech recognition while listening
  useEffect(() => {
    if (isListening) {
      setInputText(speechText);
    }
  }, [speechText, isListening]);

  // Toggle speech for the assistant
  const toggleAssistantSpeech = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (interview?.messages?.length) {
      const lastMessage = interview.messages[interview.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        speak(lastMessage.content).catch(err => {
          console.error('Error speaking message:', err);
          toast.error('Failed to speak the response');
        });
      }
    }
  }, [isSpeaking, stopSpeaking, speak, interview?.messages]);

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
                  {feedback.rating.toFixed(1)}/5.0
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(feedback.rating / 5) * 100}%` }}
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
                  {feedback.strengths.map((item, index) => 
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
                  {feedback.suggestions.map((item, index) => 
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
                "p-1.5 sm:p-2 rounded-full transition-colors",
                isSpeaking ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
                !interview?.messages?.length ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={!interview?.messages?.length}
              aria-label={isSpeaking ? "Stop assistant" : "Hear last response"}
            >
              {isSpeaking ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
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
                "p-2 rounded-full transition-colors",
                isSpeaking ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
                !interview?.messages?.length ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={!interview?.messages?.length}
              aria-label={isSpeaking ? "Stop assistant" : "Hear last response"}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Assistant is speaking...</span>
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
            {(error || apiError || speechError || synthesisError) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm flex justify-between items-center border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
                placeholder={isListening ? "🎤 Speak now (your speech will appear here)..." : "💬 Type your response or use voice input..."}
                className="w-full p-4 pr-14 min-h-[80px] max-h-[140px] resize-none border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 bg-white dark:bg-gray-800 text-base"
                disabled={isSubmitting || isSpeaking || isLoading}
              />
              <motion.button
                type="button"
                onClick={toggleListening}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "absolute right-3 bottom-3 p-3 rounded-full transition-all duration-200 shadow-lg",
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200 dark:shadow-red-900/50' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/50',
                  (isSpeaking || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                )}
                disabled={isSpeaking || isSubmitting}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </motion.button>
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
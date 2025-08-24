import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { feedback, IInterview } from '@/types/Interview-type';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { BiCaretDownCircle } from "react-icons/bi";
import { FeedbackService } from '@/services/interviewService';
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
  isLoading?: boolean;
  error?: string | null;
}

export const InterviewContainer = ({
  id,
  interview,
  onSendMessage,
  onComplete,
  isLoading = false,
  error = null,
}: InterviewContainerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showDetails = searchParams.get('details') === 'true';
  const [showMsgBox, setShowMsgBox] = useState(showDetails);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(null);
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [interview?.messages]);

  // Handle speaking assistant messages
  useEffect(() => {
    if (!interview?.messages?.length) return;

    const lastMessage = interview.messages[interview.messages.length - 1];
    
    // Only speak assistant messages that haven't been spoken yet
    if (lastMessage.role === 'assistant' && activeMessageIndex !== interview.messages.length - 1) {
      setActiveMessageIndex(interview.messages.length - 1);
      speak(lastMessage.content).catch(err => {
        console.error('Error speaking message:', err);
        setApiError('Failed to speak response');
        toast.error('Failed to speak the response');
      });
    }
  }, [interview?.messages, activeMessageIndex, speak]);

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
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
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

      {/* Fixed Header - 64px height */}
       <div className="mt-15 md:mt-0 px-2 py-1 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
      {/* Mobile menu button and title */}
      <div className="md:hidden flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold dark:text-white">
            {interview.type === 'personal' ? 'Personal' : 'Technical'}
          </h2>
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
        <div className="hidden md:flex items-center gap-2">
          <h2 className="text-xl font-semibold dark:text-white">
            {interview.type === 'personal' ? 'Personal Interview' : 'Technical Interview'}
          </h2>
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
        </div>
        
        {/* Mobile menu content */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 py-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
            {showMsgBox ? (
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-green-600 dark:text-green-400 py-2">Completed</span>
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
                  disabled={isSubmitting || isSpeaking || isLoading}
                  className="w-full"
                >
                  {isSubmitting ? 'Ending...' : 'End Interview'}
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
            <>
              <span className="text-sm text-green-600 dark:text-green-400 mr-4">Completed</span>
              <Button 
                variant="outline" 
                onClick={() => router.push('/interviews/history')}
                className="min-w-[120px]"
              >
                History Page
              </Button>
            </>
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

      {/* Messages Container - Scrollable Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto"
      >
        <div className="space-y-4">
          {interview?.messages?.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={cn(
                "max-w-full md:max-w-[80%] rounded-lg px-4 py-2 relative",
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
              )}>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                {message.role === 'assistant' && isSpeaking && activeMessageIndex === index && (
                  <div className="mt-1 flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Assistant is speaking...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {(isLoading || isSubmitting) && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 max-w-full md:max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing your response...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area - 72px height (approx) */}
      {(!interview.completedAt && !showMsgBox) && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="max-w-4xl mx-auto">
            {(error || apiError || speechError || synthesisError) && (
              <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-sm flex justify-between items-center">
                <span>{error || apiError || speechError || synthesisError}</span>
                <button 
                  onClick={clearErrors}
                  className="ml-2 font-bold text-lg hover:text-red-800 dark:hover:text-red-300"
                  aria-label="Dismiss error"
                >
                  &times;
                </button>
              </div>
            )}
            
            <div className="relative">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Speak now (your speech will appear here)..." : "Type your response..."}
                className="w-full p-3 pr-12 min-h-[60px] max-h-[120px] resize-none dark:bg-gray-800 dark:border-gray-700"
                disabled={isSubmitting || isSpeaking || isLoading}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "absolute right-3 bottom-3 p-2 rounded-full transition-colors",
                  isListening 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200',
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
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() || isSubmitting || isSpeaking || isLoading}
                className="flex-1"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : 'Send'}
              </Button>
              
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  className="flex-1"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting || isLoading}
                >
                  Stop Assistant
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
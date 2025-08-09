import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { IInterview } from '@/types/interview';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewContainerProps {
  interview: IInterview;
  onSendMessage: (message?: string) => Promise<void>;
  onComplete: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const InterviewContainer = ({
  interview,
  onSendMessage,
  onComplete,
  isLoading = false,
  error = null,
}: InterviewContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(null);
  
  const {
    text: speechText,
    isListening,
    error: speechError,
    startListening,
    stopListening,
    setText: setSpeechText,
    resetTranscript,
  } = useSpeechRecognition();
  
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
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [inputText, onSendMessage, stopListening, stopSpeaking, resetTranscript, clearErrors]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview?.messages]);

  // Handle speaking assistant messages
  useEffect(() => {
    if (!interview?.messages?.length || isListening) return;

    const lastMessage = interview.messages[interview.messages.length - 1];
    
    if (lastMessage.role === 'assistant' && activeMessageIndex !== interview.messages.length - 1) {
      setActiveMessageIndex(interview.messages.length - 1);
      speak(lastMessage.content).catch(err => {
        console.error('Error speaking message:', err);
        setApiError('Failed to speak response');
      });
    }
  }, [interview?.messages, activeMessageIndex, speak, isListening]);

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

  return (
    <div className="interview-page flex flex-col h-full bg-white dark:bg-gray-800 overflow-y-hidden overflow-x-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-10 overflow-hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {interview.type === 'personal' ? 'Personal Interview' : 'Technical Interview'}
          </h2>
          {interview.completedAt ? (
            <span className="text-sm text-green-600">Completed</span>
          ) : (
            <Button 
              variant="outline" 
              onClick={onComplete}
              disabled={isSubmitting || isSpeaking || isLoading}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Ending...' : 'End Interview'}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 max-w-4xl w-full mx-auto dark:bg-gray-800 overflow-y-auto">
        <div className="space-y-4">
          {interview?.messages?.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && isSpeaking && activeMessageIndex === index && (
                  <div className="mt-1 flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-xs text-gray-500 ml-2">Assistant is speaking...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(isLoading || isSubmitting) && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2 max-w-[80%]">
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

      {/* Input Area */}
      {!interview.completedAt && (
        <div className="py-4 border-t  px-auto bg-white dark:bg-gray-800 shadow-sm fixed w-full    bottom-0">
          <div className="max-w-4xl mx-auto">
            {(error || apiError || speechError || synthesisError) && (
              <div className="mb-2 p-2 bg-red-50 text-red-600 rounded text-sm flex justify-between items-center">
                <span>{error || apiError || speechError || synthesisError}</span>
                <button 
                  onClick={clearErrors}
                  className="ml-2 font-bold text-lg"
                  aria-label="Dismiss error"
                >
                  &times;
                </button>
              </div>
            )}
            
            <div className="relative ">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Speak now..." : "Type your response..."}
                className="w-full p-3 pr-12 min-h-[80px] max-h-[200px] resize-none"
                disabled={isSubmitting || isSpeaking || isLoading}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700'
                } ${(isSpeaking || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                disabled={!inputText.trim() || isSubmitting || isSpeaking}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isSubmitting ? 'Sending...' : 'Send'}
              </Button>
              
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  className="flex-1"
                  variant="outline"
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
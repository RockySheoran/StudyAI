import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IInterview } from '@/types/interview';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAutoSubmit } from '@/hooks/useAutoSubmit';

interface InterviewContainerProps {
  interview: IInterview;
  onSendMessage: (message: string) => Promise<void>;
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
  
  const {
    text: speechText,
    isListening,
    error: speechError,
    finalTranscript,
    startListening,
    stopListening,
    setText: setSpeechText,
  } = useSpeechRecognition();
  
  const { isSpeaking, speak, stopSpeaking } = useSpeechSynthesis();

  // Handle sending message to API
  const handleSubmit = async (message?: string) => {
    const messageToSend = message || finalTranscript || speechText || inputText;
    if (!messageToSend.trim()) return;
    
    setIsSubmitting(true);
    setApiError(null);
    stopSpeaking();
    stopListening();

    try {
      await onSendMessage(messageToSend);
      setSpeechText('');
      setInputText('');
    } catch (err) {
      setApiError('Failed to send message. Please try again.');
      console.error('API Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit when final transcript is received
  useAutoSubmit(finalTranscript, isListening, handleSubmit);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview?.messages]);

  // Speak the last AI message when it arrives
  useEffect(() => {
    if (interview?.messages?.length > 0) {
      const lastMessage = interview.messages[interview.messages.length - 1];
      if (lastMessage.role === 'assistant' && !isSpeaking) {
        speak(lastMessage.content);
      }
    }
  }, [interview?.messages, isSpeaking, speak]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
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
              disabled={isSubmitting || isSpeaking}
            >
              End Interview
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto">
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
              </div>
            </div>
          ))}
          {(isLoading || isSubmitting) && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!interview.completedAt && (
        <div className="p-4 border-t bg-white shadow-sm">
          <div className="max-w-4xl mx-auto">
            {(error || apiError) && (
              <div className="mb-2 p-2 bg-red-50 text-red-600 rounded text-sm">
                {error || apiError}
              </div>
            )}
            {speechError && (
              <div className="mb-2 p-2 bg-yellow-50 text-yellow-600 rounded text-sm">
                Microphone error: {speechError}
              </div>
            )}
            
            <div className="relative">
              <textarea
                value={isListening ? speechText : inputText}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isListening) {
                    setSpeechText(value);
                  } else {
                    setInputText(value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Speak now..." : "Type your response..."}
                className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                disabled={isSubmitting || isSpeaking}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-3 bottom-3 p-2 rounded-full ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                disabled={isSubmitting || isSpeaking}
                aria-label={isListening ? "Stop recording" : "Start recording"}
              >
                {isListening ? (
                  <span className="flex items-center">
                    <span className="relative flex h-3 w-3 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Listening...
                  </span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => handleSubmit()}
                disabled={(!inputText.trim() && !finalTranscript.trim()) || isSubmitting || isListening}
                className="flex-1"
                variant="default"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : 'Send Message'}
              </Button>
              
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  className="flex-1"
                  variant="outline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                  Stop Speaking
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
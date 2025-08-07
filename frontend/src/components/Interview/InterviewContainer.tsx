import { useState, useEffect, useRef } from 'react';
import { IInterview } from '@/types/interview';
import { Button } from '../ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAutoSubmit } from '@/hooks/useAutoSubmit';

interface InterviewContainerProps {
  interview: IInterview;
  onSendMessage: (message: string) => Promise<void>;
  onComplete: () => void;
}

export const InterviewContainer = ({
  interview,
  onSendMessage,
  onComplete,
}: InterviewContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    text: speechText,
    isListening,
    error: speechError,
    startListening,
    stopListening,
    setText: setSpeechText,
  } = useSpeechRecognition();
  
  const { isSpeaking, speak, stopSpeaking } = useSpeechSynthesis();

  // Auto-submit when speech stops
  const handleSubmit = async () => {
    if (!speechText.trim()) return;
    setIsSubmitting(true);
    try {
      await onSendMessage(speechText);
      setSpeechText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  useAutoSubmit(speechText, isListening, handleSubmit);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview?.messages]);

  // Speak the last AI message
  useEffect(() => {
    if (interview?.messages?.length > 0) {
      const lastMessage = interview?.messages[interview?.messages?.length - 1];
      if (lastMessage.role === 'assistant' && !isSpeaking) {
        speak(lastMessage.content);
      }
    }
  }, [interview?.messages, isSpeaking, speak]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold">
          {interview?.type === 'personal' ? 'Personal Interview' : 'Technical Interview'}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {interview?.messages?.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!interview?.completedAt && (
        <div className="p-4 border-t bg-gray-50">
          <div className="relative">
            <textarea
              value={speechText || inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setSpeechText(e.target.value);
              }}
              placeholder="Type or speak your response..."
              className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3 bottom-3 p-2 rounded-full ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              disabled={isSubmitting}
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
                '🎤 Speak'
              )}
            </button>
          </div>
          {speechError && (
            <p className="mt-1 text-sm text-red-500">{speechError}</p>
          )}
          <Button
            onClick={() => handleSubmit()}
            disabled={!inputText.trim() || isSubmitting || isListening}
            className="w-full mt-2"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      )}
    </div>
  );
};
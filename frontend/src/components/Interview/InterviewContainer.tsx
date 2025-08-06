import { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';


import { Loading } from '../ui/Loading';
import { Rating } from '../ui/Rating';
import styles from './InterviewContainer.module.css';
import { Button } from '../ui/button';
import { IInterview } from '@/types/interview';

interface InterviewContainerProps {
  interview: IInterview;
  onSendMessage: (message: string) => Promise<void>;
  onComplete: () => void;
}

const InterviewContainer = ({ interview, onSendMessage, onComplete }: InterviewContainerProps) => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    text: speechText,
    isListening,
    error: speechError,
    startListening,
    stopListening,
    setText: setSpeechText,
  } = useSpeechRecognition();
  
  const { isSpeaking, speak, stopSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    if (speechText) {
      setInputText(speechText);
    }
  }, [speechText]);

  useEffect(() => {
    scrollToBottom();
  }, [interview.messages]);

  useEffect(() => {
    // Speak the last AI message when it changes
    if (interview.messages.length > 0) {
      const lastMessage = interview.messages[interview.messages.length - 1];
      if (lastMessage.role === 'assistant' && !isSpeaking) {
        speak(lastMessage.content);
      }
    }
  }, [interview.messages, isSpeaking, speak]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(inputText);
      setInputText('');
      setSpeechText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{interview.type === 'personal' ? 'Personal Interview' : 'Technical Interview'}</h2>
        {interview.completedAt && (
          <div className={styles.feedback}>
            <h3>Interview Feedback</h3>
            <Rating value={interview.feedback?.rating || 0} max={5} />
            <div>
              <h4>Strengths:</h4>
              <ul>
                {interview.feedback?.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Suggestions:</h4>
              <ul>
                {interview.feedback?.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
            <Button onClick={onComplete}>Finish Interview</Button>
          </div>
        )}
      </div>

      <div className={styles.messages}>
        {interview.messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.role === 'user' ? styles.userMessage : styles.aiMessage
            }`}
          >
            <div className={styles.messageContent}>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!interview.completedAt && (
        <form onSubmit={handleSubmit} className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your response or use voice input..."
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
              disabled={isSubmitting}
            >
              {isListening ? '🛑' : '🎤'}
            </button>
          </div>
          {speechError && <p className={styles.error}>{speechError}</p>}
          <Button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? <Loading size="sm" /> : 'Send'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default InterviewContainer;
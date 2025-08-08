import { useState, useEffect, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    // Load voices when they become available
    speechSynthesis.onvoiceschanged = updateVoices;
    updateVoices();

    return () => {
      speechSynthesis.onvoiceschanged = null;
      stopSpeaking();
    };
  }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis || !text.trim()) return;

    stopSpeaking(); // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Find the best available English voice
    const englishVoice = voices.find(v => v.lang.includes('en')) || 
                        voices.find(v => v.lang.includes('en-US')) || 
                        voices[0];

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return { isSpeaking, speak, stopSpeaking, voices };
};
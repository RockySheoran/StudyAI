import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.onvoiceschanged = updateVoices;
    updateVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Female')
    );

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return {
    isSpeaking,
    speak,
    stopSpeaking,
    voices,
  };
};
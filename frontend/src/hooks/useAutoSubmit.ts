import { useEffect } from 'react';

export const useAutoSubmit = (
  text: string,
  isListening: boolean,
  onSubmit: () => void,
  delay = 1500
) => {
  useEffect(() => {
    if (!isListening && text.trim()) {
      const timer = setTimeout(() => {
        onSubmit();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isListening, text, onSubmit, delay]);
};
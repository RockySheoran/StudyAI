import { useEffect, useState } from 'react';

export const useAutoSubmit = (
  finalTranscript: string,
  isListening: boolean,
  handleSubmit: (message?: string) => Promise<void>
) => {
  const [prevFinalTranscript, setPrevFinalTranscript] = useState('');

  useEffect(() => {
    if (finalTranscript && finalTranscript !== prevFinalTranscript && isListening) {
      const trimmedTranscript = finalTranscript.trim();
      if (trimmedTranscript) {
        handleSubmit(trimmedTranscript).catch(console.error);
        setPrevFinalTranscript(trimmedTranscript);
      }
    }
  }, [finalTranscript, isListening, handleSubmit, prevFinalTranscript]);
};
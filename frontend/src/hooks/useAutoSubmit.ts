import { useEffect, useState } from 'react';

export const useAutoSubmit = (
  finalTranscript: string,
  isListening: boolean,
  handleSubmit: (message?: string) => Promise<void>
) => {
  const [prevFinalTranscript, setPrevFinalTranscript] = useState('');

  useEffect(() => {
    if (finalTranscript && finalTranscript !== prevFinalTranscript && isListening) {
      setPrevFinalTranscript(finalTranscript);
      handleSubmit();
    }
  }, [finalTranscript, isListening, handleSubmit, prevFinalTranscript]);
};
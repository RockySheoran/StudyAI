import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';

// Configure the free Llama model (assuming you're running Ollama locally)
export const getChatModel = () => {
  return new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: 'llama2', // Free Llama model
    temperature: 0.7,
  });
};

export const getEmbeddings = () => {
  return new OllamaEmbeddings({
    model: 'llama2',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
};
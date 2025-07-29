import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import logger from './logger';

// Extract text from PDF
export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    const loader = new PDFLoader(pdfUrl);
    const docs = await loader.load();
    
    // Combine all pages text
    const fullText = docs.map(doc => doc.pageContent).join('\n\n');
    return fullText;
  } catch (error) {
    logger.error(`Error extracting text from PDF: ${error}`);
    throw error;
  }
};

// Enhance prompt with RAG
export const enhancePromptWithRAG = async (text: string): Promise<string> => {
  // Split text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  // For simplicity, we're using MemoryVectorStore here
  // In production, you might want to use a persistent vector store
  const vectorStore = new MemoryVectorStore(
    new GoogleGenerativeAIEmbeddings()
  );
  
  // Create documents and add to vector store
  const docs = textSplitter.createDocuments([text]);
  await vectorStore.addDocuments(await docs);
  
  // Create enhanced prompt with context
  const prompt = `
  You are an expert document summarizer. Please analyze the following document and provide:
  
  1. A comprehensive summary that captures all key points, main arguments, and important details.
  2. The summary should be well-structured and easy to understand.
  3. Identify and list 5-7 most important keywords from the document.
  
  Document Context:
  ${text.substring(0, 5000)}... [truncated for context]
  
  Please provide your summary followed by keywords in this format:
  
  [Your summary here]
  
  Keywords: [comma-separated keywords]
  `;
  
  return prompt;
};
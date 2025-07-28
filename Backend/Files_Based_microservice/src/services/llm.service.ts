import { initGemini } from '../config/llm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document as LangchainDocument } from 'langchain/document';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.genAI = initGemini();
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: 'embedding-001',
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  async generateSummary(text: string): Promise<string> {
    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });

    const docs = await textSplitter.createDocuments([text]);

    // Create vector store for RAG
    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      this.embeddings
    );

    // Perform similarity search to get relevant chunks
    const relevantDocs = await vectorStore.similaritySearch(text, 4);

    // Combine relevant chunks
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');

    // Generate summary with context
    const prompt = `
      You are an expert at summarizing complex documents.
      Generate a comprehensive summary of the following document.
      The summary should be detailed yet concise, capturing all key points.
      Include important facts, figures, and conclusions.

      Document:
      ${context}
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      const { default: pdf } = await import('pdf-parse');
      const data = await pdf(pdfBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
}

export default new LLMService();
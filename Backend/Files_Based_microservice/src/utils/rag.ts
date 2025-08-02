// import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// import { MemoryVectorStore } from 'langchain/vectorstores/memory';
// import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
// import axios from 'axios';
// import { Readable } from 'stream';
// import logger from './logger';
// import { embeddings } from '../config/gemini';

// export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
//   try {
//     // 1. Download the PDF from Cloudinary
//     logger.debug(`Downloading PDF from: ${pdfUrl}`);
//     const response = await axios.get(pdfUrl, {
//       responseType: 'arraybuffer',
//       timeout: 30000 // 30 seconds timeout
//     });

//     // 2. Verify the response is a PDF
//     const contentType = response.headers['content-type'];
//     if (!contentType?.includes('application/pdf')) {
//       throw new Error('URL does not point to a valid PDF file');
//     }

//     // 3. Save the PDF buffer to a temporary file
//     const pdfBuffer = Buffer.from(response.data, 'binary');
//     const fs = await import('fs/promises');
//     const path = await import('path');
//     const os = await import('os');
//     const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-'));
//     const tempFilePath = path.join(tempDir, 'temp.pdf');
//     await fs.writeFile(tempFilePath, pdfBuffer);

//     // 4. Load with PDFLoader using the file path
//     const loader = new PDFLoader(tempFilePath);
//     logger.debug('PDF loader created, loading document...');
    
//     const docs = await loader.load();
//     logger.debug(`Loaded ${docs.length} document pages`);

//     // 5. Clean up the temporary file
//     await fs.unlink(tempFilePath);
//     await fs.rmdir(tempDir);

//     if (docs.length === 0) {
//       throw new Error('No text found in the PDF document');
//     }

//     // 5. Combine all pages text
//     const fullText = docs.map(doc => doc.pageContent).join('\n\n');
//     logger.debug(`Extracted text length: ${fullText.length} characters`);
    
//     return fullText;
//   } catch (error) {
//     logger.error('Error extracting text from PDF:', {
//       error: error instanceof Error ? error.message : error,
//       url: pdfUrl
//     });
//     throw error;
//   }
// };


// // Enhance prompt with RAG
// export const enhancePromptWithRAG = async (text: string): Promise<string> => {
//   // Split text into chunks
//   const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//   });
//   console.log(textSplitter, "text for RAG");
//   // For simplicity, we're using MemoryVectorStore here
//   // In production, you might want to use a persistent vector store
//   const vectorStore = new MemoryVectorStore(
//    embeddings
//   );
  
//   // Create documents and add to vector store
//   const docs = textSplitter.createDocuments([text]);
//   await vectorStore.addDocuments(await docs);
  
//   // Create enhanced prompt with context
//   const prompt = `
//   You are an expert document summarizer. Please analyze the following document and provide:
  
//   1. A comprehensive summary that captures all key points, main arguments, and important details.
//   2. The summary should be well-structured and easy to understand.
//   3. Identify and list 5-7 most important keywords from the document.
  
//   Document Context:
//   ${text.substring(0, 5000)}... [truncated for context]
  
//   Please provide your summary followed by keywords in this format:
  
//   [Your summary here]
  
//   Keywords: [comma-separated keywords]
//   `;
//   console.log(prompt,"promt")
  
//   return prompt;
// };
















// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// export class RAGService {
//   private genAI: GoogleGenerativeAI;
//   private embeddings: GoogleGenerativeAIEmbeddings;
//   private textSplitter: RecursiveCharacterTextSplitter;

//   constructor() {
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
//     this.embeddings = new GoogleGenerativeAIEmbeddings();
//     this.textSplitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 1000,
//       chunkOverlap: 200,
//     });
//   }

//   async processPDF(filePath: string): Promise<string> {
//     // 1. Load PDF
//     const loader = new PDFLoader(filePath);
//     const docs = await loader.load();

//     // 2. Split text into chunks
//     const splitDocs = await this.textSplitter.splitDocuments(docs);

//     // 3. Create vector store (in-memory for this example)
//     const vectorStore = await MemoryVectorStore.fromDocuments(
//       splitDocs,
//       this.embeddings
//     );

//     // 4. Retrieve relevant chunks
//     const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
//     const retriever = vectorStore.asRetriever();
//     const relevantDocs = await retriever.getRelevantDocuments(
//       "Generate a comprehensive summary"
//     );

//     // 5. Construct RAG prompt
//     const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");
//     const prompt = `
//       Generate a concise summary of the following document sections.
//       Focus on key points, main ideas, and important details.
//       Keep the summary between 150-300 words.
      
//       Document Context:
//       ${context}
//     `;

//     // 6. Generate summary
//     const result = await model.generateContent(prompt);
//     return result.response.text();
//   }
// }
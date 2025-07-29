import model from '../config/gemini';
import { extractTextFromPdf } from '../utils/rag';
import logger from '../utils/logger';
import { enhancePromptWithRAG } from '../utils/rag';

// Generate summary using Gemini with RAG
export const generateSummary = async (pdfUrl: string): Promise<{ summary: string; keywords: string[] }> => {
  try {
    // Extract text from PDF
    console.log(pdfUrl, "pdfUrl");
    if (!pdfUrl) {
      throw new Error('PDF URL is required');
    }
    const pdfText = await extractTextFromPdf(pdfUrl);
    console.log(pdfText, "pdfText");

    // Enhance prompt with RAG
    const enhancedPrompt = enhancePromptWithRAG(pdfText);
    
    // Generate content
    const result = await model.generateContent(await enhancedPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract summary and keywords
    const summary = text.split('Keywords:')[0].trim();
    const keywords = text.split('Keywords:')[1] 
      ? text.split('Keywords:')[1].trim().split(',').map(k => k.trim())
      : [];
    
    logger.info('Summary generated successfully');
    return { summary, keywords };
  } catch (error) {
    logger.error(`Error generating summary: ${error}`);
    throw error;
  }
};
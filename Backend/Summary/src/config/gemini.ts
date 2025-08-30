import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const generateSummary = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      Generate a concise summary of the following text. 
      Focus on key points, main ideas, and important details.
      Keep the summary between 150-300 words.
      Text: ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

export const generateChunkSummary = async (chunk: string, chunkIndex: number, totalChunks: number) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      This is chunk ${chunkIndex + 1} of ${totalChunks} from a larger document.
      Generate a detailed summary of this chunk, focusing on:
      - Key concepts and main ideas
      - Important facts and details
      - Any conclusions or insights
      
      Chunk content: ${chunk}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error for chunk:', error);
    throw error;
  }
};

export const generateFinalSummary = async (chunkSummaries: string[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const combinedSummaries = chunkSummaries.join('\n\n---\n\n');
    
    const prompt = `
      Below are summaries from different sections of a document. 
      Create a comprehensive, well-structured final summary that:
      - Combines all key points coherently
      - Maintains logical flow and organization
      - Highlights the most important insights
      - Removes redundancy while preserving essential information
      - Keeps the final summary between 300-500 words
      
      Section summaries:
      ${combinedSummaries}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error for final summary:', error);
    throw error;
  }
};
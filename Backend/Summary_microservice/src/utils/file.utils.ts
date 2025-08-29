import axios from 'axios';
import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    // Download the PDF
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const data = await pdf(response.data);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

export const chunkTextForProcessing = async (text: string): Promise<string[]> => {
  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000, // Optimal size for Gemini processing
      chunkOverlap: 200, // Overlap to maintain context between chunks
      separators: ['\n\n', '\n', '. ', '! ', '? ', ' ', ''], // Smart splitting on natural boundaries
    });

    const chunks = await textSplitter.splitText(text);
    console.log(`Text split into ${chunks.length} chunks`);
    return chunks;
  } catch (error) {
    console.error('Error chunking text:', error);
    throw error;
  }
};

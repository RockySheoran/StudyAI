import axios from 'axios';
import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as mammoth from 'mammoth';

export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    // Download the PDF with timeout and proper headers
    const response = await axios.get(pdfUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Validate response
    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Downloaded PDF file is empty or corrupted');
    }

    // Attempt to parse PDF with additional options
    const data = await pdf(response.data, {
      // Add parsing options for better compatibility
      max: 0, // Parse all pages
      version: 'v1.10.100'
    });

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF contains no extractable text content');
    }

    return data.text;
  } catch (error: any) {
    // Enhanced error handling with specific error types
    if (error.message?.includes('Invalid PDF structure')) {
      throw new Error('The PDF file appears to be corrupted or has an invalid format. Please try uploading a different PDF file.');
    } else if (error.message?.includes('Password')) {
      throw new Error('The PDF file is password-protected. Please upload an unprotected PDF file.');
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('Failed to download PDF file due to network timeout. Please try again.');
    } else if (error.response?.status === 404) {
      throw new Error('PDF file not found. The file may have been deleted or moved.');
    } else {
      throw new Error(`Failed to process PDF file: ${error.message || 'Unknown error occurred'}`);
    }
  }
};

/**
 * Extracts text content from DOCX files
 * @param docxUrl - URL of the DOCX file to process
 * @returns Promise containing extracted text content
 */
export const extractTextFromDocx = async (docxUrl: string): Promise<string> => {
  try {
    // Download the DOCX file with timeout and proper headers
    const response = await axios.get(docxUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Validate response
    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Downloaded DOCX file is empty or corrupted');
    }

    // Extract text using mammoth
    const result = await mammoth.extractRawText({ buffer: response.data });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX contains no extractable text content');
    }

    return result.value;
  } catch (error: any) {
    // Enhanced error handling with specific error types
    if (error.message?.includes('corrupted') || error.message?.includes('invalid')) {
      throw new Error('The DOCX file appears to be corrupted or has an invalid format. Please try uploading a different DOCX file.');
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('Failed to download DOCX file due to network timeout. Please try again.');
    } else if (error.response?.status === 404) {
      throw new Error('DOCX file not found. The file may have been deleted or moved.');
    } else {
      throw new Error(`Failed to process DOCX file: ${error.message || 'Unknown error occurred'}`);
    }
  }
};

/**
 * Universal text extraction function that handles both PDF and DOCX files
 * @param fileUrl - URL of the file to process
 * @param fileName - Name of the file to determine type
 * @returns Promise containing extracted text content
 */
export const extractTextFromFile = async (fileUrl: string, fileName: string): Promise<string> => {
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  switch (fileExtension) {
    case '.pdf':
      return await extractTextFromPdf(fileUrl);
    case '.docx':
    case '.doc':
      return await extractTextFromDocx(fileUrl);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}. Supported formats: PDF, DOCX, DOC`);
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
    return chunks;
  } catch (error) {
    throw error;
  }
};

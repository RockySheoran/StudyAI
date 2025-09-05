import axios from 'axios';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text from PDF files
 */
export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const data = await pdf(response.data);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

/**
 * Extract text from DOCX files
 */
export const extractTextFromDocx = async (docxUrl: string): Promise<string> => {
  try {
    const response = await axios.get(docxUrl, { responseType: 'arraybuffer' });
    const result = await mammoth.extractRawText({ buffer: response.data });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
};

/**
 * Extract text from DOC files (legacy format)
 */
export const extractTextFromDoc = async (docUrl: string): Promise<string> => {
  try {
    // For DOC files, we'll use a basic approach
    // Note: This is a simplified implementation
    const response = await axios.get(docUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // Convert buffer to string and clean up
    let text = buffer.toString('utf8');
    
    // Remove non-printable characters and clean up
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
    text = text.replace(/\s+/g, ' ');
    text = text.trim();
    
    if (!text || text.length < 10) {
      throw new Error('No extractable text found in DOC file');
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from DOC:', error);
    throw error;
  }
};

/**
 * Universal text extraction function that supports PDF, DOCX, and DOC formats
 */
export const extractTextFromFile = async (fileUrl: string, originalName: string): Promise<string> => {
  try {
    const extension = originalName.toLowerCase().substring(originalName.lastIndexOf('.'));
    
    switch (extension) {
      case '.pdf':
        return await extractTextFromPdf(fileUrl);
      case '.docx':
        return await extractTextFromDocx(fileUrl);
      case '.doc':
        return await extractTextFromDoc(fileUrl);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
};

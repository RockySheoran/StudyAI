import axios from 'axios';
// import { promisify } from 'util';
// import { exec } from 'child_process';
// const execAsync = promisify(exec);
// import fs from 'fs';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';

// export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
//   try {
//     // Download the PDF
//     const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
//     const tempDir = path.join(__dirname, '../../temp');
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }

//     const tempFilePath = path.join(tempDir, `${uuidv4()}.pdf`);
//     fs.writeFileSync(tempFilePath, response.data);

//     // Use pdftotext to extract text (ensure pdftotext is installed on your system)
//     const { stdout } = await execAsync(`pdftotext "${tempFilePath}" -`);

//     // Clean up
//     fs.unlinkSync(tempFilePath);

//     return stdout;
//   } catch (error) {
//     console.error('Error extracting text from PDF:', error);
//     throw error;
//   }
// };

import pdf from 'pdf-parse';

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

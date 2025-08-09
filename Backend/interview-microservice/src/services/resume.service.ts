// import pdf from 'pdf-parse';

// export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
//   try {
//     const data = await pdf(buffer);
//     return data.text;
//   } catch (error) {
//     console.error('Error extracting text from PDF:', error);
//     throw new Error('Failed to extract text from PDF');
//   }
// };

// export const scheduleResumeDeletion = async (resumeId: string): Promise<void> => {
//   // Schedule deletion after 4 days (96 hours)
//   setTimeout(async () => {
//     try {
//       const Resume = require('../models/resume.model').default;
//       await Resume.findByIdAndDelete(resumeId);
//       console.log(`Automatically deleted resume: ${resumeId}`);
//     } catch (error) {
//       console.error('Error in scheduled resume deletion:', error);
//     }
//   }, 96 * 60 * 60 * 1000); // 96 hours in milliseconds
// // };
import pdf from 'pdf-parse';

export const getPDFInfo = async (pdfBuffer: Buffer) => {
  const data = await pdf(pdfBuffer);
  return {
    numPages: data.numpages,
    text: data.text,
    size: pdfBuffer.length,
  };
};
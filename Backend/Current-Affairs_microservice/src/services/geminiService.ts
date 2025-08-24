import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateCurrentAffairs = async (category: string = 'random') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    let prompt = '';
    if (category === 'random') {
      prompt = `Generate a current affairs article about a recent global event. Provide a title, a short summary (about 100 words), and a detailed article (about 500 words). Format the response as JSON: { "title": "", "summary": "", "fullContent": "" }`;
    } else {
      prompt = `Generate a current affairs article about ${category}. Provide a title, a short summary (about 100 words), and a detailed article (about 500 words). Format the response as JSON: { "title": "", "summary": "", "fullContent": "" }`;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
};
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { IInterviewMessage, Interview } from '../models/interview.model';
import { text } from 'express';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const interviewSystemPrompts = {
  personal: `You are a professional HR interviewer conducting a personal interview. 
Your goal is to assess the candidate's personality, communication skills, and cultural fit. 
Ask relevant questions based on their resume and previous answers. Keep the interview in the personal domain only. dont ask the candidate any technical questions.
Be professional but friendly. After 8-10 questions, provide constructive feedback including a rating (1-5), 
strengths, and areas for improvement. The questions should be in short length, concise, and to the point.`,
  technical: `You are a technical interviewer assessing a candidate's skills based on their resume. 
Ask progressively challenging questions about their mentioned technologies and projects. Keep the interview in the technical domain only. dont ask the candidate any personal questions.
Include some cross-questions to verify depth of knowledge. After 8-10 questions, 
provide detailed feedback including a rating (1-5), technical strengths, and areas needing improvement.The questions should be in short length, concise, and to the point`
};

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateInterviewResponse = async (
  interviewType: 'personal' | 'technical',
  conversationHistory: IInterviewMessage[],
  resumeText: string
): Promise<{ response: string; feedback?: any }> => {
  try {
    // Prepare the initial prompt that combines system instructions and resume
    const systemPrompt = `
      ${interviewSystemPrompts[interviewType]}
      
      Candidate's Resume:
      ${resumeText}
    `;

    // Convert conversation history to Gemini format with proper role alternation
    const chatHistory = conversationHistory.map((msg, index) => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }],
    }));

    // Start chat with the system prompt as the first message
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        ...chatHistory.slice(0, -1) // Include all but the last message
      ]
    });

    // Send the last message in the conversation
    const lastMessage = conversationHistory[conversationHistory.length-1] ;
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    // Check if the response contains feedback (end of interview)
    // if (text.includes('Rating:') || text.includes('Feedback:')) {
    //   const feedback = parseFeedback(text);
    //   return { response: text, feedback };
    // }

    return { response: text };
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw new Error('Failed to generate interview response');
  }
};

export const generateInterviewFeedback = async (
  interviewType: 'personal' | 'technical',
  conversationHistory: IInterviewMessage[],
  resumeText: string,
  interviewId: string
): Promise<{ response: string; feedback: any }> => {

  try {
    // Prepare the initial prompt that combines system instructions and resume
    const systemPrompt = `
      ${interviewSystemPrompts[interviewType]}
      
      Candidate's Resume:
      ${resumeText}
      
      The interview has concluded. Please provide comprehensive feedback based on the entire conversation.
      Include:
      1. Rating (1-5)
      2. Key strengths demonstrated
      3. Areas for improvement
      4. Overall comments on performance
      
      Conversation History:
    `;

    // Convert conversation history to text format
    const conversationText = conversationHistory?.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`)
      .join('\n');

    const prompt = `${systemPrompt}\n${conversationText}\n\nPlease provide your feedback:`;

    // Use the model to generate feedback
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    

    // Parse the feedback
    const feedback = parseFeedback(text);
    
    await Interview.updateOne({ _id: interviewId }, { feedback });
    

    return { 
      response: text,
      feedback 
    };
  } catch (error) {
    console.error('Error generating interview feedback:', error);
    throw new Error('Failed to generate interview feedback');
  }
};


const parseFeedback = (text: string) => {
  // Extract rating
  const ratingMatch = text.match(/Rating:\s*(\d)\/5/);
  const rating = ratingMatch ? parseInt(ratingMatch[1]) : 3;

  // Extract strengths - looking for bullet points under "Key Strengths Demonstrated"
  const strengthsSection = text.match(/Key Strengths Demonstrated:([\s\S]*?)(?=Areas for Improvement:|$)/i);
  let strengths: string[] = [];
  if (strengthsSection) {
    strengths = strengthsSection[1]
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => line.replace(/^\*\s+/, '').trim())
      .filter(line => line.length > 0);
  }

  // Extract suggestions - looking for bullet points under "Areas for Improvement"
  const suggestionsSection = text.match(/Areas for Improvement:([\s\S]*?)(?=Overall Comments|$)/i);
  let suggestions: string[] = [];
  if (suggestionsSection) {
    suggestions = suggestionsSection[1]
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => line.replace(/^\*\s+/, '').trim())
      .filter(line => line.length > 0);
  }

  // If the above didn't work, try a more general approach
  if (strengths.length === 0) {
    const strengthsMatch = text.match(/Strengths:\s*([\s\S]*?)(?=Areas for Improvement|Suggestions:|$)/i);
    strengths = strengthsMatch 
      ? strengthsMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^\*\s+/, '').trim())
      : [];
  }

  if (suggestions.length === 0) {
    const improvementsMatch = text.match(/(Areas for Improvement|Suggestions):\s*([\s\S]*?)(?=Overall Comments|$)/i);
    suggestions = improvementsMatch 
      ? improvementsMatch[2].split('\n').filter(line => line.trim()).map(line => line.replace(/^\*\s+/, '').trim())
      : [];
  }

  return {
    rating,
    strengths,
    suggestions,
  };
};
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { IInterviewMessage, Interview } from '../models/interview.model';
import { text } from 'express';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const interviewSystemPrompts = {
  personal: `You are a professional HR interviewer conducting a personal interview. 

Your goal is to assess the candidate's personality, communication skills, cultural fit, and soft skills. 
Ask relevant questions based on their resume and previous answers. Keep the interview focused on:
- Background and experience
- Behavioral situations
- Career goals and motivations
- Team collaboration
- Problem-solving approach
- Leadership examples

DO NOT ask technical coding questions. Be professional but friendly. 
Ask follow-up questions based on their responses. Keep questions concise and engaging.
When the interview concludes, provide constructive feedback.`,
  
  technical: `You are a senior technical interviewer assessing a candidate's technical skills and knowledge.

Focus on evaluating their technical competency through:
- Programming languages and frameworks mentioned in resume
- System design and architecture
- Problem-solving methodology
- Code quality and best practices
- Technical challenges they've faced
- Depth of understanding in their stated technologies

DO NOT ask personal or behavioral questions. Ask progressively challenging questions.
Include follow-up questions to verify depth of knowledge.
When the interview concludes, provide detailed technical feedback.`
};

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateInterviewResponse = async (
  interviewType: 'personal' | 'technical',
  conversationHistory: IInterviewMessage[],
  resumeText: string,
  shouldEnd: boolean = false
): Promise<{ response: string; feedback?: any }> => {
  try {
    // Prepare the initial prompt that combines system instructions and resume
    const systemPrompt = `
      ${interviewSystemPrompts[interviewType]}
      
      Candidate's Resume:
      ${resumeText}
    `;

    // Convert conversation history to Gemini format with proper role alternation
    const chatHistory = conversationHistory?.map((msg, index) => ({
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

    // If this should be the final response, generate feedback
    if (shouldEnd) {
      const feedbackPrompt = `
        Based on this interview conversation, please provide final feedback and end the interview.
        Include:
        1. A brief closing statement
        2. Rating (1-5)
        3. Key strengths demonstrated
        4. Areas for improvement
        5. Overall performance summary
        
        Format your response as a natural conclusion to the interview followed by structured feedback.
      `;
      
      const feedbackResult = await chat.sendMessage(feedbackPrompt);
      const feedbackResponse = await feedbackResult.response;
      const feedbackText = feedbackResponse.text();
      
      const feedback = parseFeedback(feedbackText);
      return { response: feedbackText, feedback };
    }

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
    console.log(feedback, "feedback")
    
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
  // First clean the text by removing unwanted patterns like "**4." and extra ** markers
  const cleanedText = text
    .replace(/\*\*\d+\./g, '')  // Remove patterns like **4.
    .replace(/^\*\*|\*\*$/g, ''); // Remove ** at start or end of entire text

  // Extract rating - try multiple patterns
  let rating = 3; // default
  const ratingPatterns = [
    /Rating:\s*(\d)\/5/i,
    /Rating:\s*(\d)/i,
    /(\d)\/5/,
    /Score:\s*(\d)/i
  ];
  
  for (const pattern of ratingPatterns) {
    const match = cleanedText.match(pattern);
    if (match) {
      rating = parseInt(match[1]);
      break;
    }
  }

  // Extract strengths - looking for bullet points under "Key Strengths Demonstrated"
  const strengthsSection = cleanedText.match(/Key Strengths Demonstrated:([\s\S]*?)(?=Areas for Improvement:|$)/i);
  let strengths: string[] = [];
  if (strengthsSection) {
    strengths = strengthsSection[1]
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => line
        .replace(/^\*\s+/, '')  // Remove bullet point marker
        .replace(/\*\*/g, '')    // Remove any remaining ** within text
        .trim()
      )
      .filter(line => line.length > 0);
  }

  // Extract suggestions - looking for bullet points under "Areas for Improvement"
  const suggestionsSection = cleanedText.match(/Areas for Improvement:([\s\S]*?)(?=Overall Comments|$)/i);
  let suggestions: string[] = [];
  if (suggestionsSection) {
    suggestions = suggestionsSection[1]
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => line
        .replace(/^\*\s+/, '')  // Remove bullet point marker
        .replace(/\*\*/g, '')    // Remove any remaining ** within text
        .trim()
      )
      .filter(line => line.length > 0);
  }

  // Fallback extraction if the above didn't work
  if (strengths.length === 0) {
    const strengthsMatch = cleanedText.match(/Strengths:\s*([\s\S]*?)(?=Areas for Improvement|Suggestions:|$)/i);
    strengths = strengthsMatch 
      ? strengthsMatch[1]
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^\*\s+/, '').replace(/\*\*/g, '').trim())
      : [];
  }

  if (suggestions.length === 0) {
    const improvementsMatch = cleanedText.match(/(Areas for Improvement|Suggestions):\s*([\s\S]*?)(?=Overall Comments|$)/i);
    suggestions = improvementsMatch 
      ? improvementsMatch[2]
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^\*\s+/, '').replace(/\*\*/g, '').trim())
      : [];
  }

  return {
    rating,
    strengths: strengths.filter(s => s), // Remove any empty strings
    suggestions: suggestions.filter(s => s), // Remove any empty strings
  };
};
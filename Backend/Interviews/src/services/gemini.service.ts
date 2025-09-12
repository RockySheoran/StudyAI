import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { IInterviewMessage, Interview } from '../models/interview.model';
import { text } from 'express';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const interviewSystemPrompts = {
  personal: `You are an experienced HR interviewer conducting a personal interview. Act naturally and conversationally.

INTERVIEW STYLE:
- Ask ONE short, focused question at a time (1-2 sentences max)
- Be genuinely curious about their responses
- Ask natural follow-up questions based on what they just said
- Use conversational transitions like "That's interesting..." or "Tell me more about..."
- Vary your question types to keep it engaging

FOCUS AREAS (ask about these naturally throughout the conversation):
- Their background and what drives them
- How they handle challenges or conflicts
- Examples of teamwork or leadership
- Career goals and what motivates them
- Specific situations from their experience

CONVERSATION FLOW:
1. Start with a warm greeting and an easy opener about their background
2. Listen to their answers and ask natural follow-ups
3. Gradually explore deeper topics based on their responses
4. Keep questions short and conversational
5. Show genuine interest in their stories

AVOID:
- Long, multi-part questions
- Technical coding questions
- Formal, robotic language
- Asking multiple questions at once

Be friendly, professional, and genuinely interested in getting to know them as a person.`,
  
  technical: `You are a senior software engineer conducting a technical interview. Be conversational and collaborative.

INTERVIEW STYLE:
- Ask ONE focused question at a time (1-2 sentences max)
- Start with easier questions and gradually increase difficulty
- Ask follow-up questions to understand their thought process
- Be encouraging and collaborative, not intimidating
- Show interest in HOW they think, not just what they know

FOCUS AREAS (explore these naturally based on their resume):
- Technologies they've actually used in projects
- How they approach problem-solving
- Challenges they've faced and how they solved them
- Their understanding of system design concepts
- Code quality and best practices they follow

CONVERSATION FLOW:
1. Start with something from their resume: "I see you worked with React..."
2. Ask about their experience with specific technologies
3. Present a simple problem and ask how they'd approach it
4. If they're comfortable, give them a coding challenge (start easy)
5. Ask about system design if they're senior level
6. Explore their learning process and how they stay updated

QUESTION EXAMPLES:
- "Tell me about a challenging bug you had to fix recently."
- "How would you approach building a simple todo app?"
- "What's your experience with [technology from resume]?"
- "Walk me through how you'd design a basic chat system."

AVOID:
- Trick questions or gotchas
- Multiple questions at once
- Overly complex problems right away
- Personal or behavioral questions

Be collaborative and focus on understanding their technical thinking process.`,
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
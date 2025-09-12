import { redisClient } from '../config/redis';
import { IInterview, Interview, IInterviewMessage } from '../models/interview.model';
import { Resume } from '../models/resume.model';
import { extractTextFromFile } from '../utils/file.utils';
import {  generateInterviewResponse } from './gemini.service';


 

  export const startInterviewService = async(
    userId: string, 
    type: 'personal' | 'technical', 
    resumeId?: string
  ): Promise<IInterview> => {
    let selectedResumeId = null;
    let resumeText = null;
console.log("dfdsfds",resumeId)
    // Handle resume logic
    if (resumeId) {
      // Use provided resume ID
      const resume = await Resume.findById(resumeId);
      if (resume && resume.userId === userId) {
        selectedResumeId = resumeId;
        resumeText = await extractTextFromFile(resume.url, resume.originalName);
       
        await redisClient.set(`resume/${resumeId}`, resumeText, { EX: 172800 });
      }
    } else {
      // Try to find latest resume for user
      // const latestResume = await Resume.findOne({ userId }).sort({ uploadDate: -1 });
      // if (latestResume) {
      //   selectedResumeId = latestResume._id;
      //   resumeText = await extractTextFromFile(latestResume.url, latestResume.originalName);
      //   await redisClient.set(`resume/${latestResume._id}`, resumeText, { EX: 172800 });
      // }
    }

    // Generate personalized initial message based on interview type and resume
    let initialContent = '';
   
    
    if (type === 'personal') {
      if (resumeText) {
        initialContent = `Welcome to your personal interview! I've reviewed your resume and I'm excited to learn more about your background and experiences. Let's start with: give me your introduction in about 90 to 120 seconds`;
      } else {
        initialContent = `Welcome to your personal interview! Since we don't have your resume, let's start by getting to know you better.  Let's start with: give me your introduction in about 90 to 120 seconds`;
      }
    } else {
      if (resumeText) {
        initialContent = `Welcome to your technical interview! I've reviewed your resume and I'm impressed by your technical background. Let's start with: Give me a technical introduction in about 90 to 120 seconds.`;
      } else {
        initialContent = `Welcome to your technical interview! Let's explore your technical skills and problem-solving abilities. Let's start with: Give me a technical introduction in about 90 to 120 seconds. `;
      }
    }

    const initialMessage: IInterviewMessage = {
      role: 'assistant',
      content: initialContent,
      timestamp: new Date(),
    };

    const interview = new Interview({
      userId,
      type,
      resumeId: selectedResumeId,
      messages: [initialMessage],
      status: 'active'
    });

    return await interview.save();
  }

  export const continueInterviewService = async(
    interviewId: string,
    userId: string,
    userMessage: string
  ): Promise<{ interview: IInterview; isComplete: boolean }> => {
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
      throw new Error('Interview not found or access denied');
    }

    if (interview.completedAt) {
      throw new Error('This interview has already been completed');
    }

    // Validate message content
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    // Add user message to conversation
    const userMessageObj: IInterviewMessage = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    interview.messages.push(userMessageObj);

    // Get resume text from cache or database
    let resumeText = null;
    if (interview.resumeId) {
      resumeText = await redisClient.get(`resume/${interview.resumeId}`);
      
      if (!resumeText) {
        const resume = await Resume.findById(interview.resumeId);
        if (resume) {
          resumeText = await extractTextFromFile(resume.url, resume.originalName);
          await redisClient.set(`resume/${interview.resumeId}`, resumeText, { EX: 172800 });
        }
      }
    }

    // Determine if interview should end based on message count
    const messageCount = interview.messages.filter(msg => msg.role === 'user').length;
    // const shouldEnd = messageCount >= (interview.type === 'technical' ? 8 : 6);

    // Get AI response
    const { response, feedback } = await generateInterviewResponse(
      interview.type,
      interview.messages,
      resumeText || 'No resume provided',
      false
    );

    // Add AI response to conversation
    const aiMessage: IInterviewMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    interview.messages.push(aiMessage);

    // If feedback is present or should end, mark interview as complete
    if (feedback) {
      interview.feedback = feedback || 'Interview completed successfully';
      interview.completedAt = new Date();
      interview.status = 'completed';
    }

    await interview.save();

    return {
      interview,
      isComplete: !!(feedback),
    };
  }

  export const getInterviewHistoryService = async(userId: string): Promise<IInterview[]> => {
    try {
      const interviews = await Interview.find({ userId })
        .sort({ createdAt: -1 })
        .populate('resumeId', 'filename uploadDate')
        .lean();
      
      return interviews.map(interview => ({
        ...interview,
        messageCount: interview.messages?.length || 0,
        duration: interview.completedAt && interview.createdAt 
          ? Math.round((new Date(interview.completedAt).getTime() - new Date(interview.createdAt).getTime()) / 1000 / 60)
          : null
      }));
    } catch (error) {
      console.error('Error fetching interview history:', error);
      throw new Error('Failed to fetch interview history');
    }
  }

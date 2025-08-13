import { IInterview, Interview, IInterviewMessage } from '../models/interview.model';
import { Resume } from '../models/resume.model';
import { extractTextFromPdf } from '../utils/file.utils';
import {  generateInterviewResponse } from './gemini.service';


 

  export const startInterviewService = async(userId: string , type: 'personal' | 'technical'): Promise<IInterview> =>{
    console.log(userId ,"iytiuyt");
    console.log(type);

    const latestResume = await Resume.findOne({ userId }).sort({ uploadDate: -1 });
    console.log(latestResume);
    if (!latestResume) {
      throw new Error('No resume found for the user');
    }

    const initialMessage: IInterviewMessage = {
      role: 'assistant',
      content: type === 'personal' 
        ? 'Welcome to your personal interview. Let\'s begin with some questions about your background and experience.'
        : 'Welcome to your technical interview. I\'ll be asking you questions about your skills and experience.',
      timestamp: new Date(),
    };

    const interview = new Interview({
      userId,
      type,
      resumeId: latestResume._id,
      messages: [initialMessage],
    });

    return await interview.save();
  }

  export const continueInterviewService = async(
    interviewId: string,
    userId: string,
    userMessage: string
  ): Promise<{ interview: IInterview; isComplete: boolean }> =>{
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview) {
      throw new Error('Interview not found');
    }

    if (interview.completedAt) {
      throw new Error('This interview has already been completed');
    }

    // Add user message to conversation
    const userMessageObj: IInterviewMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    interview.messages.push(userMessageObj);

    // Get resume text (in a real app, you'd extract text from the resume)
    const resume = await Resume.findById({_id:interview?.resumeId});
     const text = await extractTextFromPdf(resume?.url!);
    // const resumeText = text ? `Resume for user ${userId}` : 'No resume available';

    // Get AI response
    const { response, feedback } = await generateInterviewResponse(
      interview.type,
      interview.messages,
      text
    );

    // Add AI response to conversation
    const aiMessage: IInterviewMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    interview.messages.push(aiMessage);

    // If feedback is present, mark interview as complete
    if (feedback) {
      interview.feedback = feedback;
      interview.completedAt = new Date();
    }

    await interview.save();

    return {
      interview,
      isComplete: !!feedback,
    };
  }

  export const getInterviewHistoryService = async(userId: string): Promise<any> =>{
    console.log(userId)
    try {
      const interviews = await Interview.find({ userId:userId }).sort({ createdAt: -1 });
      console.log(interviews)
      return interviews
    } catch (error) {
      console.log(error)
      return error
    }
    
  }

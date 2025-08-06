import { IInterview, Interview, IInterviewMessage } from '../models/interview.model';
import { Resume } from '../models/resume.model';
import { GeminiService } from './gemini.service';

export class InterviewService {
  private geminiService = new GeminiService();

  async startInterview(userId: string, type: 'personal' | 'technical'): Promise<IInterview> {
    const latestResume = await Resume.findOne({ userId }).sort({ uploadDate: -1 });
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

  async continueInterview(
    interviewId: string,
    userId: string,
    userMessage: string
  ): Promise<{ interview: IInterview; isComplete: boolean }> {
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
    const resume = await Resume.findById(interview.resumeId);
    const resumeText = resume ? `Resume for user ${userId}` : 'No resume available';

    // Get AI response
    const { response, feedback } = await this.geminiService.generateInterviewResponse(
      interview.type,
      interview.messages,
      resumeText
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

  async getInterviewHistory(userId: string): Promise<IInterview[]> {
    return await Interview.find({ userId }).sort({ createdAt: -1 });
  }
}
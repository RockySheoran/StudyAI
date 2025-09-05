import { Request, Response } from 'express';
import { continueInterviewService, getInterviewHistoryService, startInterviewService } from '../services/interview.service';
import { AuthenticatedRequest } from '../types/custom-types';
import { IInterview, Interview } from '../models/interview.model';
import { IResume, Resume } from '../models/resume.model';
import { extractTextFromPdf } from '../utils/file.utils';
import { generateInterviewFeedback } from '../services/gemini.service';
import { redisClient } from '../config/redis';


export const startInterview = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { type, resumeId } = req.body;
    const userId = req.user?.id;
    console.log(type,resumeId)

    if (!type || (type !== 'personal' && type !== 'technical')) {
      return res.status(400).json({ error: 'Invalid interview type' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const interview = await startInterviewService(userId, type, resumeId);
    res.status(201).json(interview);
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to start interview' 
    });
  }
}

export const fetchInterview = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const findInterview = await Interview.findById(id);

    if (!findInterview) {
      return res.status(404).json({ error: 'Interview not found' })
    }

    res.status(200).json(findInterview)

  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
}
export const continueInterview = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { interviewId, message } = req.body;
    const userId = req.user?.id;

    if (!interviewId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { interview, isComplete } = await continueInterviewService(
      interviewId,
      userId || '',
      message
    );

    res.status(200).json({ interview, isComplete });
  } catch (error) {
    console.error('Error continuing interview:', error);
    res.status(500).json({ error: 'Failed to continue interview' });
  }
}

export const getInterviewHistory = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const interviews = await getInterviewHistoryService(userId!);
    res.status(200).json(interviews);
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
}


export const feedbackController = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const interview: any = await Interview.findById(id);
    console.log(interview.feedback.rating)
    if(interview.feedback.rating > 0){
      return res.status(200).json({feedback:interview.feedback})
    }

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    let resumeText = '';
    
    // Check if interview has a valid resumeId
    if (interview.resumeId) {
      resumeText = await redisClient.get(`resume/${interview.resumeId}`) || "";
      
      if (!resumeText) {
        // Get resume text (in a real app, you'd extract text from the resume)
        const resume = await Resume.findById(interview.resumeId);
        
        if (resume && resume.url) {
          resumeText = await extractTextFromPdf(resume.url);
          await redisClient.set(`resume/${interview.resumeId}`, resumeText, { EX: 172800 });
        } else {
          console.warn('Resume not found or has no URL for interview:', id);
          resumeText = 'No resume available';
        }
      }
    } else {
      console.warn('No resumeId found for interview:', id);
      resumeText = 'No resume available';
    }
    const { response, feedback } = await generateInterviewFeedback(
      interview.type,
      interview.messages,
      resumeText,
      id
    )



    return res.status(200).json({
      res: response,
      feedback
    })
  } catch (error) {
    console.error('Error fetching feedback', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}
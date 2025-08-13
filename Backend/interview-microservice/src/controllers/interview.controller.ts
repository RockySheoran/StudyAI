import { Request, Response } from 'express';
import { continueInterviewService, getInterviewHistoryService, startInterviewService } from '../services/interview.service';
import { AuthenticatedRequest } from '../types/custom-types';
import { IInterview, Interview } from '../models/interview.model';
import { IResume, Resume } from '../models/resume.model';
import { extractTextFromPdf } from '../utils/file.utils';
import { generateInterviewFeedback } from '../services/gemini.service';
import { redisClient } from '../config/redis';


export const startInterview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.body;

    const userId = req.user?.id || 'user'; // Assuming you have authentication middleware

    if (!type || (type !== 'personal' && type !== 'technical')) {
      return res.status(400).json({ error: 'Invalid interview type' });

    }


    const interview = await startInterviewService(userId, type);
    console.log(interview);
    res.status(201).json(interview);
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
}

export const fetchInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(id)
    const findInterview = await Interview.findOne({ _id: id });
    console.log(findInterview)

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
    console.log(interviewId)



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
    console.log("first")
    const userId = req.user?.id;
    console.log(userId, "sdcvsdcvefdfvfvef")
    const interviews = await getInterviewHistoryService(userId!);
    console.log(interviews)
    res.status(200).json(interviews);
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
}


export const feedbackController = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    console.log(id)
    const interview: any = await Interview.findById({ _id: id });

<<<<<<< HEAD
    let resumeText = await redisClient.get(`resume/${interview?.resumeId}`);
    if (!resumeText) {

      // Get resume text (in a real app, you'd extract text from the resume)
      const resume = await Resume.findById({ _id: interview?.resumeId });
      resumeText = await extractTextFromPdf(resume?.url!);
      await redisClient.set(`resume/${interview?.resumeId}`, resumeText, { EX: 172800 });
    }

    //  console.log(text)
=======
    const text = await extractTextFromPdf(resume?.url);
     console.log(text)
>>>>>>> 38ae4c27e7b5ac81c15d35ac0df5d6cd1e3a51a9
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
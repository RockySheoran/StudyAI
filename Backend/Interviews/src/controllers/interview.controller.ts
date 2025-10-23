import { Request, Response } from 'express';
import { continueInterviewService, getInterviewHistoryService, startInterviewService } from '../services/interview.service';
import { AuthenticatedRequest } from '../types/custom-types';
import { Interview } from '../models/interview.model';
import { Resume } from '../models/resume.model';
import { extractTextFromPdf } from '../utils/file.utils';
import { generateInterviewFeedback } from '../services/gemini.service';
import { RedisCache } from '../utils/redis.utils';
import { ResponseHandler } from '../utils/response.utils';
import { Logger } from '../utils/logger.utils';



export const startInterview = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    Logger.request(req, 'Starting new interview');
    const { type, resumeId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      Logger.warn('Unauthorized interview start attempt');
      return ResponseHandler.unauthorized(res, 'User authentication required');
    }

    // Check for active interviews
    // const activeInterview = await Interview.findOne({ 
    //   userId, 
    //   status: 'active' 
    // });

    // if (activeInterview) {
    //   Logger.info('User has active interview', { userId, interviewId: activeInterview._id });
    //   return ResponseHandler.conflict(res, 'You already have an active interview. Please complete it first.');
    // }

    const interview = await startInterviewService(userId, type, resumeId);
    
    Logger.info('Interview started successfully', { 
      userId, 
      interviewId: interview._id, 
      type 
    });

    return ResponseHandler.created(res, interview, 'Interview started successfully');
  } catch (error) {
    Logger.error('Error starting interview', error, { 
      userId: req.user?.id, 
      type: req.body.type 
    });
    
    return ResponseHandler.error(res, 
      error instanceof Error ? error.message : 'Failed to start interview'
    );
  }
}

export const fetchInterview = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHandler.unauthorized(res);
    }

    const interview = await Interview.findOne({ _id: id, userId });

    if (!interview) {
      Logger.warn('Interview not found or access denied', { interviewId: id, userId });
      return ResponseHandler.notFound(res, 'Interview not found or access denied');
    }

    Logger.info('Interview fetched successfully', { interviewId: id, userId });
    return ResponseHandler.success(res, interview);

  } catch (error) {
    Logger.error('Error fetching interview', error, { interviewId: req.params.id });
    return ResponseHandler.error(res, 'Failed to fetch interview');
  }
}
export const continueInterview = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    Logger.request(req, 'Continuing interview');
    const { interviewId, message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHandler.unauthorized(res);
    }

    const { interview, isComplete } = await continueInterviewService(
      interviewId,
      userId,
      message
    );

    Logger.info('Interview continued successfully', { 
      interviewId, 
      userId, 
      isComplete,
      messageLength: message.length 
    });

    return ResponseHandler.success(res, { interview, isComplete });
  } catch (error) {
    Logger.error('Error continuing interview', error, { 
      interviewId: req.body.interviewId, 
      userId: req.user?.id 
    });
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return ResponseHandler.notFound(res, error.message);
      }
      if (error.message.includes('completed')) {
        return ResponseHandler.badRequest(res, error.message);
      }
    }
    
    return ResponseHandler.error(res, 'Failed to continue interview');
  }
}

export const getInterviewHistory = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return ResponseHandler.unauthorized(res);
    }

    const { interviews, pagination } = await getInterviewHistoryService(userId, page, limit);
    
    Logger.info('Interview history fetched', { 
      userId, 
      page, 
      limit, 
      totalInterviews: interviews.length 
    });

    return ResponseHandler.success(res, { interviews, pagination });
  } catch (error) {
    Logger.error('Error fetching interview history', error, { userId: req.user?.id });
    return ResponseHandler.error(res, 'Failed to fetch interview history');
  }
}


export const getCacheStatus = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { resumeId } = req.params;
    
    if (!resumeId) {
      return ResponseHandler.badRequest(res, 'Resume ID is required');
    }

    const exists = await RedisCache.exists(`resume/${resumeId}`);
    const ttl = exists ? await RedisCache.getTTL(`resume/${resumeId}`) : -1;
    
    return ResponseHandler.success(res, {
      cached: exists,
      timeRemaining: ttl > 0 ? `${Math.floor(ttl / 60)} minutes` : 'Not cached',
      expiresIn: ttl
    });
  } catch (error) {
    Logger.error('Error checking cache status', error);
    return ResponseHandler.error(res, 'Failed to check cache status');
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
      resumeText = await RedisCache.get(`resume/${interview.resumeId}`) || "";
      
      if (!resumeText) {
        // Get resume text from database
        const resume = await Resume.findById(interview.resumeId);
        
        if (resume && resume.url) {
          resumeText = await extractTextFromPdf(resume.url);
          // Cache for 1 hour
          await RedisCache.set(`resume/${interview.resumeId}`, resumeText);
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
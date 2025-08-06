import {   Response } from 'express';
import { InterviewService } from '../services/interview.service';
import { AuthenticatedRequest } from '../types/custom-types';

export class InterviewController {
  private interviewService = new InterviewService();

  async startInterview(req: AuthenticatedRequest, res: Response) {
    try {
      const { type } = req.body;
      const userId = req.user?.id; // Assuming you have authentication middleware

      if (!type || (type !== 'personal' && type !== 'technical')) {
        return res.status(400).json({ error: 'Invalid interview type' });
      }

      const interview = await this.interviewService.startInterview(userId || '', type);
      res.status(201).json(interview);
    } catch (error) {
      console.error('Error starting interview:', error);
      res.status(500).json({ error: 'Failed to start interview' });
    }
  }

  async continueInterview(req: AuthenticatedRequest, res: Response) {
    try {
      const { interviewId, message } = req.body;
      const userId = req.user?.id;

      if (!interviewId || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { interview, isComplete } = await this.interviewService.continueInterview(
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

  async getInterviewHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const interviews = await this.interviewService.getInterviewHistory(userId || '');
      res.status(200).json(interviews);
    } catch (error) {
      console.error('Error fetching interview history:', error);
      res.status(500).json({ error: 'Failed to fetch interview history' });
    }
  }
}
import {   Request,Response } from 'express';
import { continueInterviewService, getInterviewHistoryService, startInterviewService } from '../services/interview.service';
import { AuthenticatedRequest } from '../types/custom-types';
import { Interview } from '../models/interview.model';


  export const  startInterview =async (req: AuthenticatedRequest, res: Response) =>{
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

    export const fetchInterview = async (req:Request,res:Response) => {
      try {
         const {id} = req.params;
         console.log(id)
         const findInterview  = await Interview.findOne({_id:id});
         console.log(findInterview)

         if(!findInterview){
           return res.status(404).json({error:'Interview not found'})
         }

         res.status(200).json(findInterview)

      } catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({ error: 'Failed to fetch interview' });
      }
    }
  export const continueInterview = async(req: AuthenticatedRequest, res: Response) :Promise<any> => {
    try {
      const { interviewId, message } = req.body;
      const userId = req.user?.id || 'user' ;
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

  export const getInterviewHistory = async (req: AuthenticatedRequest, res: Response) :Promise<any> =>{
    try {
      const userId = req.user?.id || "user";
      console.log(userId)
      const interviews = await  getInterviewHistoryService(userId || '');
      console.log(interviews)
      res.status(200).json(interviews);
    } catch (error) {
      console.error('Error fetching interview history:', error);
      res.status(500).json({ error: 'Failed to fetch interview history' });
    }
  }

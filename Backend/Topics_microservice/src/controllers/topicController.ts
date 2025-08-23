import { Request, Response } from 'express';
import { GeminiService } from '../services/geminiService';
import { HistoryService } from '../services/historyService';
import { TopicRequest, TopicResponse } from '../types';

const geminiService = new GeminiService();
const historyService = new HistoryService();

export const getTopicDefinition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, detailLevel, userId } = req.body as TopicRequest & { userId?: string };
    
    const definition = await geminiService.getTopicDefinition({ topic, detailLevel });
    
    // Save to history
    await historyService.saveHistory({
      topic,
      definition,
      detailLevel,
      userId
    });

    const response: TopicResponse = {
      topic,
      definition,
      detailLevel,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getTopicDefinition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSearchHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, userId } = req.query;
    const historyLimit = limit ? parseInt(limit as string, 10) : 10;
    
    const history = await historyService.getHistory(historyLimit, userId as string);
    res.json(history);
  } catch (error) {
    console.error('Error in getSearchHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
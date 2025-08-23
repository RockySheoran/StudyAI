import { Request, Response, NextFunction } from 'express';
import { TopicRequest } from '../types';

export const validateTopicRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { topic, detailLevel } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    res.status(400).json({ error: 'Valid topic is required' });
    return;
  }

  if (!detailLevel || !['less', 'more', 'most'].includes(detailLevel)) {
    res.status(400).json({ error: 'Detail level must be one of: less, more, most' });
    return;
  }

  next();
};
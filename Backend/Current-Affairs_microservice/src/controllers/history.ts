import { Request, Response } from 'express';
import CurrentAffair from '../models/CurrentAffair';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const affairs = await CurrentAffair.find().sort({ createdAt: -1 });
    res.json(affairs);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
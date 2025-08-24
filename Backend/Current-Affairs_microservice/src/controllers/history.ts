import { Request, Response } from 'express';
import CurrentAffair from '../models/CurrentAffair';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const affairs = await CurrentAffair.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await CurrentAffair.countDocuments();
    
    res.json({
      affairs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
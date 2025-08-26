import { Request, Response } from 'express';
import CurrentAffair from '../models/CurrentAffair';
import { AuthenticatedRequest } from '../types/custom-types';

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
     const id = req?.user?.id ;
    console.log("userId in getTopicDefinition:", id);
    
    const affairs = await CurrentAffair.find({userId:id}).sort({ createdAt: -1 }).skip(skip).limit(limit);
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

// Make sure to export the function properly
export default { getHistory };
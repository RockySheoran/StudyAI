import { Request, Response } from 'express';
import { generateCurrentAffairs } from '../services/geminiService';
import CurrentAffair from '../models/CurrentAffair';
import { AuthenticatedRequest } from '../types/custom-types';

export const getCurrentAffairs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, category } = req.query;
    
    if (!type || (type === 'custom' && !category)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const generatedContent = await generateCurrentAffairs(
      type === 'custom' ? category as string : 'random'
    );
    const id = req?.user?.id ;
    console.log("userId in getTopicDefinition:", id);
    // Save to database
    const newAffair = new CurrentAffair({
      title: generatedContent.title,
      summary: generatedContent.summary,
      fullContent: generatedContent.fullContent,
      category: type === 'custom' ? category : 'random',
      userId: id,
    });
    
    await newAffair.save();
    
    res.json({
      title: generatedContent.title,
      summary: generatedContent.summary,
      fullContent: generatedContent.fullContent,
      id: newAffair._id,
    });
  } catch (error) {
    console.error('Error fetching current affairs:', error);
    res.status(500).json({ error: 'Failed to fetch current affairs' });
  }
};
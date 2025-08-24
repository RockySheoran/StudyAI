import { Request, Response } from 'express';
import { generateCurrentAffairs } from '../services/geminiService';
import CurrentAffair from '../models/CurrentAffair';

export const getCurrentAffairs = async (req: Request, res: Response) => {
  try {
    const { type, category, page = '1' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;
    
    if (!type || (type === 'custom' && !category)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Check if we have enough articles in the database
    const existingCount = await CurrentAffair.countDocuments({
      category: type === 'custom' ? category : 'random'
    });
    
    // If we don't have enough articles, generate new ones
    if (existingCount < pageNum * limit) {
      const articlesToGenerate = Math.max(limit, pageNum * limit - existingCount);
      const generatedArticles = await generateCurrentAffairs(
        type === 'custom' ? category as string : 'random',
        articlesToGenerate
      );
      
      // Save new articles to database
      const articlesToSave = generatedArticles.map((article: any) => ({
        title: article.title,
        summary: article.summary,
        fullContent: article.fullContent,
        category: type === 'custom' ? category : 'random',
        userId:"123",
      }));
      
      await CurrentAffair.insertMany(articlesToSave);
    }
    
    // Fetch articles with pagination
    const affairs = await CurrentAffair.find({
      category: type === 'custom' ? category : 'random'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Get total count for pagination
    const total = await CurrentAffair.countDocuments({
      category: type === 'custom' ? category : 'random'
    });
    
    res.json({
      affairs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limit),
        hasNext: pageNum < Math.ceil(total / limit),
        hasPrev: pageNum > 1,
      }
    });
  } catch (error) {
    console.error('Error fetching current affairs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch current affairs',
      fallback: {
        title: "Current Affairs Article",
        summary: "An error occurred while generating the content. Please try again.",
        fullContent: "We encountered an issue while generating the current affairs content. Please try your request again. If the problem persists, check your API key and network connection."
      }
    });
  }
};
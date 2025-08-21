import { TopicHistoryModel } from '../models/TopicHistory';
import { TopicHistory } from '../types';

export class HistoryService {
  async saveHistory(historyData: Omit<TopicHistory, 'timestamp'>): Promise<void> {
    try {
      const historyRecord = new TopicHistoryModel(historyData);
      await historyRecord.save();
    } catch (error) {
      console.error('Error saving history to database:', error);
      throw new Error('Failed to save search history');
    }
  }

  async getHistory(limit: number = 10, userId?: string): Promise<TopicHistory[]> {
    try {
      const query = userId ? { userId } : {};
      const history = await TopicHistoryModel.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
      
      return history.map(doc => ({
        topic: doc.topic,
        definition: doc.definition,
        detailLevel: doc.detailLevel,
        timestamp: doc.timestamp,
        userId: doc.userId
      }));
    } catch (error) {
      console.error('Error fetching history from database:', error);
      throw new Error('Failed to fetch search history');
    }
  }
}
import { Schema, model, Document } from 'mongoose';
import { TopicHistory as ITopicHistory } from '../types';

interface TopicHistoryDocument extends ITopicHistory, Document {}

const topicHistorySchema = new Schema<TopicHistoryDocument>({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  definition: {
    type: String,
    required: true
  },
  detailLevel: {
    type: String,
    enum: ['less', 'more', 'most'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    required: false
  }
});

export const TopicHistoryModel = model<TopicHistoryDocument>('TopicHistory', topicHistorySchema);
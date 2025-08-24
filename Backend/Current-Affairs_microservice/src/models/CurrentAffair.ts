import mongoose, { Document, Schema } from 'mongoose';

export interface ICurrentAffair extends Document {
  title: string;
  summary: string;
  fullContent: string;
  category: string;
  createdAt: Date;
  userId: string;
}

const CurrentAffairSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  fullContent: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId:{
    type: String,
    required: true,
  }
});

export default mongoose.model<ICurrentAffair>('CurrentAffair', CurrentAffairSchema);
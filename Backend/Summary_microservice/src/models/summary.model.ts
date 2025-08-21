import { Schema, model, Document } from 'mongoose';

interface ISummary extends Document {
  _id:string;
  fileId: Schema.Types.ObjectId;
  content: string;
  generatedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  userId?: string;
}

const SummarySchema = new Schema<ISummary>({
  fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
  content: { type: String },
  generatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  userId: { type: String },
});

export const Summary = model<ISummary>('Summary', SummarySchema);
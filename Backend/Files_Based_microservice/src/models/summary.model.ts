import mongoose, { Document } from 'mongoose';

export interface ISummary extends Document {
  fileId: mongoose.Schema.Types.ObjectId;
  summary: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  modelUsed: string;
  summaryLength: number;
}

const SummarySchema = new mongoose.Schema<ISummary>(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
    summary: { type: String, required: true },
    keywords: { type: [String], default: [] },
    modelUsed: { type: String, default: 'gemini-pro' },
    summaryLength: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISummary>('Summary', SummarySchema);
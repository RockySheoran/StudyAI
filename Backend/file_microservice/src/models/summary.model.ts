import mongoose, { Document, Schema } from 'mongoose';

export interface ISummary extends Document {
  fileId: mongoose.Types.ObjectId;
  summary: string;
  createdAt: Date;
  userId?: string;
  query?: string;
  modelUsed: string;
}

const SummarySchema: Schema = new Schema({
  fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: String },
  query: { type: String },
  modelUsed: { type: String, default: 'llama2' },
});

export default mongoose.model<ISummary>('Summary11', SummarySchema);
import mongoose, { Document, Schema } from 'mongoose';
import { IFile } from './file.model';

export interface ISummary extends Document {
  file: IFile['_id'];
  content: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const SummarySchema: Schema = new Schema({
  file: { type: Schema.Types.ObjectId, ref: 'File', required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SummarySchema.pre<ISummary>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ISummary>('Summary', SummarySchema);``
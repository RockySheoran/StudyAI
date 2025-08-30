import mongoose, { Document } from 'mongoose';

export interface IResume extends Document {
  userId: string;
  url: string;
  publicId: string;
  uploadDate: Date;
}

const resumeSchema = new mongoose.Schema<IResume>({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
import { Schema, model, Document } from 'mongoose';

export interface IFile extends Document {
  _id: string;
  originalName: string;
  cloudinaryId: string;
  cloudinaryUrl: string;
  size: number;
  mimetype: string;
  uploadDate: Date;
  deleteAt: Date;
  userId?: string;
}

const FileSchema = new Schema<IFile>({
  originalName: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  deleteAt: { type: Date, required: true },
  userId: { type: String },
});

export const File = model<IFile>('File', FileSchema);
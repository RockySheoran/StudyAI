import mongoose, { Document } from 'mongoose';

export interface IFile extends Document {
  originalName: string;
  cloudinaryId: string;
  cloudinaryUrl: string;
  uploadDate: Date;
  deleteDate: Date;
  size: number;
  pages?: number;
}

const FileSchema = new mongoose.Schema<IFile>({
  originalName: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  deleteDate: { type: Date, required: true },
  size: { type: Number, required: true },
  pages: { type: Number },
});

export default mongoose.model<IFile>('File', FileSchema);
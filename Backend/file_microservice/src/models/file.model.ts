import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  _id: string;
  originalName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  uploadDate: Date;
  deleteDate: Date;
  pages: number;
  size: number;
  userId?: string;
}

const FileSchema: Schema = new Schema({
  originalName: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  deleteDate: { type: Date, required: true },
  pages: { type: Number, required: true },
  size: { type: Number, required: true },
  userId: { type: String },
});

export default mongoose.model<IFile>('File11', FileSchema);
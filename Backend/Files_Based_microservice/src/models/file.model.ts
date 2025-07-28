import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  uploadDate: Date;
}

const FileSchema: Schema = new Schema({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

export default mongoose.model<IFile>('File', FileSchema);
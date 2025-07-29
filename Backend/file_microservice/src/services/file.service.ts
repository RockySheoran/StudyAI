import FileModel, { IFile } from '../models/file.model';
import { deleteFromCloudinary } from './storage.service';

export const saveFileMetadata = async (
  fileData: Omit<IFile, '_id' | 'uploadDate'>
): Promise<IFile> => {
  const file = new FileModel(fileData);
  return await file.save();
};

export const getFileById = async (fileId: string): Promise<IFile | null> => {
  return await FileModel.findById(fileId);
};

export const deleteFile = async (fileId: string): Promise<void> => {
  const file = await FileModel.findById(fileId);
  if (!file) return;

  // Delete from Cloudinary
  await deleteFromCloudinary(file.cloudinaryPublicId);

  // Delete from database
  await FileModel.findByIdAndDelete(fileId);
};

export const getFilesToDelete = async (): Promise<IFile[]> => {
  const now = new Date();
  return await FileModel.find({ deleteDate: { $lte: now } });
};

export const getUserFiles = async (userId: string): Promise<IFile[]> => {
  return await FileModel.find({ userId }).sort({ uploadDate: -1 });
};
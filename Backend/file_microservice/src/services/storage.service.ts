import cloudinary from '../config/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  options: { folder: string }
): Promise<UploadApiResponse | UploadApiErrorResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'auto',
          folder: options.folder,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result);
        }
      )
      .end(fileBuffer);
  });
};

export const deleteFromCloudinary = (publicId: string): Promise<any> => {
  return cloudinary.uploader.destroy(publicId);
};
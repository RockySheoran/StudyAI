import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Define Cloudinary upload result interface
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

// Initialize cloudinary on module load
configureCloudinary();

export const uploadToCloudinary = async (file: Buffer | string, folder = 'pdf_summaries'): Promise<CloudinaryUploadResult> => {
  try {
    let uploadOptions: any = {
      folder,
      resource_type: 'auto',
      timeout: 120000, // 2 minutes timeout
      chunk_size: 6000000, // 6MB chunks for large files
    };

    let result;
    if (Buffer.isBuffer(file)) {
      // Upload from buffer (memory storage)
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        });
        
        uploadStream.end(file);
        
        // Add timeout handling
        setTimeout(() => {
          reject(new Error('Upload timeout after 2 minutes'));
        }, 120000);
      });
    } else {
      // Upload from file path (fallback)
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }
    
    return result as CloudinaryUploadResult;
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    
    // Provide more specific error messages
    if ((error as any).message?.includes('timeout') || (error as any).message?.includes('Timeout')) {
      throw new Error('File upload timed out. Please try with a smaller file or check your internet connection.');
    } else if ((error as any).http_code === 499) {
      throw new Error('Upload request timed out. Please try again or use a smaller file.');
    }
    
    throw new Error('Failed to upload file to Cloudinary');
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};
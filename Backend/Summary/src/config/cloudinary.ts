import { v2 as cloudinary } from 'cloudinary';

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
  return cloudinary;
};

export const uploadToCloudinary = async (file: Buffer | string, folder = 'pdf_summaries'): Promise<CloudinaryUploadResult> => {
  try {
    let uploadOptions: any = {
      folder,
      resource_type: 'auto',
    };

    let result: CloudinaryUploadResult;
    if (Buffer.isBuffer(file)) {
      // Upload from buffer (memory storage)
      result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }).end(file);
      });
    } else {
      // Upload from file path (fallback)
      result = await cloudinary.uploader.upload(file, uploadOptions) as CloudinaryUploadResult;
    }
    
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};
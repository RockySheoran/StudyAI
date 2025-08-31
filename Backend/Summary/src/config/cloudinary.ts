import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
};

export const uploadToCloudinary = async (file: Buffer | string, folder = 'pdf_summaries') => {
  try {
    let uploadOptions: any = {
      folder,
      resource_type: 'auto',
    };

    let result;
    if (Buffer.isBuffer(file)) {
      // Upload from buffer (memory storage)
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(file);
      });
    } else {
      // Upload from file path (fallback)
      result = await cloudinary.uploader.upload(file, uploadOptions);
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
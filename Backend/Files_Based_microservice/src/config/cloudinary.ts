import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for Cloudinary
export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'pdf-summaries',
      format: 'pdf',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      resource_type: 'raw',
      // Set expiration for 4 days (in milliseconds)
      expiration: Date.now() + 4 * 24 * 60 * 60 * 1000,
    };
  },
});

export default cloudinary;
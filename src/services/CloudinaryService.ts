import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Define allowed formats for different file types
const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
const documentFormats = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

// Create storage configurations for different file types
const createCloudinaryStorage = (folder: string, allowedFormats: string[]) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: Request, file: Express.Multer.File) => {
      const fileExt = path.extname(file.originalname).substring(1).toLowerCase();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      
      return {
        folder: `masterclass-lms/${folder}`,
        public_id: fileName,
        resource_type: 'auto',
        allowed_formats: allowedFormats,
        transformation: folder === 'course-thumbnails' ? [
          { width: 800, height: 450, crop: 'fill', quality: 'auto:good' }
        ] : undefined
      };
    }
  });
};

// Multer configurations for different upload types
export const uploadToCloudinary = {
  // Course thumbnail upload
  courseThumbnail: multer({
    storage: createCloudinaryStorage('course-thumbnails', imageFormats),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).substring(1).toLowerCase();
      if (imageFormats.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file format. Only images are allowed.'));
      }
    }
  }).single('thumbnail'),

  // Course video upload
  courseVideo: multer({
    storage: createCloudinaryStorage('course-videos', videoFormats),
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).substring(1).toLowerCase();
      if (videoFormats.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file format. Only videos are allowed.'));
      }
    }
  }).single('video'),

  // Course materials upload
  courseMaterials: multer({
    storage: createCloudinaryStorage('course-materials', [...documentFormats, ...imageFormats]),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).substring(1).toLowerCase();
      if ([...documentFormats, ...imageFormats].includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file format.'));
      }
    }
  }).array('materials', 10),

  // User avatar upload
  userAvatar: multer({
    storage: createCloudinaryStorage('user-avatars', imageFormats),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).substring(1).toLowerCase();
      if (imageFormats.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file format. Only images are allowed.'));
      }
    }
  }).single('avatar'),

  // Generic file upload
  generic: multer({
    storage: createCloudinaryStorage('uploads', [...imageFormats, ...videoFormats, ...documentFormats]),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).substring(1).toLowerCase();
      if ([...imageFormats, ...videoFormats, ...documentFormats].includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file format.'));
      }
    }
  }).single('file')
};

// Service class for additional Cloudinary operations
export class CloudinaryService {
  // Delete file from Cloudinary
  static async deleteFile(publicId: string, resourceType: string = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }

  // Get file URL with transformations
  static getOptimizedUrl(publicId: string, options: any = {}): string {
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    });
  }

  // Upload file from URL
  static async uploadFromUrl(url: string, folder: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: `masterclass-lms/${folder}`,
        resource_type: 'auto'
      });
      return result;
    } catch (error) {
      console.error('Error uploading from URL:', error);
      throw error;
    }
  }

  // Generate signed URL for private resources
  static getSignedUrl(publicId: string, expiresIn: number = 3600): string {
    const timestamp = Math.round(Date.now() / 1000) + expiresIn;
    return cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      auth_token: {
        duration: expiresIn
      }
    });
  }

  // Get video thumbnail
  static getVideoThumbnail(publicId: string): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        { width: 800, height: 450, crop: 'fill' },
        { quality: 'auto', fetch_format: 'jpg' }
      ]
    });
  }

  // Bulk delete files
  static async bulkDelete(publicIds: string[], resourceType: string = 'image'): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType
      });
    } catch (error) {
      console.error('Error bulk deleting files:', error);
      throw error;
    }
  }

  // Check if Cloudinary is configured
  static isConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  // Get upload preset for direct browser uploads
  static getUploadPreset(): string {
    return process.env.CLOUDINARY_UPLOAD_PRESET || 'masterclass-lms';
  }
}
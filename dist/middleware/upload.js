import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { config } from '@/config/index.js';
import { logger } from '@/utils/logger.js';
import { FileUploadError } from '@/utils/errors.js';
/**
 * File Upload Middleware using Multer
 * Handles file uploads with validation, processing, and storage
 */
// Ensure upload directories exist
const ensureUploadDirectories = async () => {
    const directories = [
        config.upload.path,
        path.join(config.upload.path, 'images'),
        path.join(config.upload.path, 'videos'),
        path.join(config.upload.path, 'documents'),
        path.join(config.upload.path, 'audio'),
        path.join(config.upload.path, 'temp'),
        path.join(config.upload.path, 'processed'),
    ];
    for (const dir of directories) {
        await fs.ensureDir(dir);
    }
};
// Initialize upload directories
ensureUploadDirectories().catch(console.error);
// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = config.upload.path;
        // Determine subdirectory based on file type
        if (file.mimetype.startsWith('image/')) {
            uploadPath = path.join(config.upload.path, 'images');
        }
        else if (file.mimetype.startsWith('video/')) {
            uploadPath = path.join(config.upload.path, 'videos');
        }
        else if (file.mimetype.startsWith('audio/')) {
            uploadPath = path.join(config.upload.path, 'audio');
        }
        else if (file.mimetype === 'application/pdf' ||
            file.mimetype.includes('document') ||
            file.mimetype.includes('text')) {
            uploadPath = path.join(config.upload.path, 'documents');
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueId = uuidv4();
        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .substring(0, 50);
        const filename = `${uniqueId}-${baseName}${extension}`;
        cb(null, filename);
    }
});
// File filter function
const fileFilter = (req, file, cb) => {
    try {
        // Check file size
        if (file.size && file.size > config.upload.max_size) {
            return cb(new FileUploadError('File size exceeds maximum limit'));
        }
        // Get file extension
        const extension = path.extname(file.originalname).toLowerCase().substring(1);
        const mimeType = file.mimetype.toLowerCase();
        // Check allowed file types
        const allAllowedTypes = [
            ...config.upload.allowed_types.images,
            ...config.upload.allowed_types.videos,
            ...config.upload.allowed_types.documents,
        ];
        const isExtensionAllowed = allAllowedTypes.includes(extension);
        const isMimeTypeAllowed = mimeType.startsWith('image/') ||
            mimeType.startsWith('video/') ||
            mimeType.startsWith('audio/') ||
            mimeType === 'application/pdf' ||
            mimeType.includes('document') ||
            mimeType.includes('text');
        if (!isExtensionAllowed && !isMimeTypeAllowed) {
            return cb(new FileUploadError(`File type not allowed: ${extension || mimeType}`));
        }
        // Additional security checks
        if (file.originalname.includes('..') || file.originalname.includes('/')) {
            return cb(new FileUploadError('Invalid filename'));
        }
        cb(null, true);
    }
    catch (error) {
        cb(new FileUploadError('File validation failed'));
    }
};
// Multer configuration
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.max_size,
        files: 10, // Maximum 10 files per request
        fields: 20, // Maximum 20 form fields
    },
});
// Image processing utilities
export class ImageProcessor {
    /**
     * Process uploaded image (resize, optimize, generate thumbnails)
     */
    static async processImage(filePath, options = {}) {
        try {
            const { maxWidth = 1920, maxHeight = 1080, quality = 85, generateThumbnail = true, thumbnailSize = 300, } = options;
            const image = sharp(filePath);
            const metadata = await image.metadata();
            const result = {
                originalPath: filePath,
                processedPath: undefined,
                thumbnailPath: undefined,
                metadata,
            };
            // Generate processed version if image is too large
            if (metadata.width && metadata.height &&
                (metadata.width > maxWidth || metadata.height > maxHeight)) {
                const processedPath = filePath.replace(path.extname(filePath), '_processed' + path.extname(filePath));
                await image
                    .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                    .jpeg({ quality })
                    .toFile(processedPath);
                result.processedPath = processedPath;
            }
            // Generate thumbnail
            if (generateThumbnail) {
                const thumbnailPath = filePath.replace(path.extname(filePath), '_thumb' + path.extname(filePath));
                await image
                    .resize(thumbnailSize, thumbnailSize, {
                    fit: 'cover',
                    position: 'center',
                })
                    .jpeg({ quality: 80 })
                    .toFile(thumbnailPath);
                result.thumbnailPath = thumbnailPath;
            }
            logger.upload(path.basename(filePath), metadata.size || 0);
            return result;
        }
        catch (error) {
            logger.error('Image processing failed:', error);
            throw new FileUploadError('Image processing failed');
        }
    }
    /**
     * Validate image file
     */
    static async validateImage(filePath) {
        try {
            const image = sharp(filePath);
            const metadata = await image.metadata();
            // Check if it's a valid image
            if (!metadata.format || !metadata.width || !metadata.height) {
                return false;
            }
            // Check dimensions
            const maxDimension = 10000; // 10k pixels max
            if (metadata.width > maxDimension || metadata.height > maxDimension) {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
// Video processing utilities
export class VideoProcessor {
    /**
     * Generate video thumbnail
     */
    static async generateThumbnail(videoPath, thumbnailPath, timeOffset = 10) {
        // This would use ffmpeg to generate video thumbnails
        // For now, return a placeholder implementation
        return thumbnailPath;
    }
    /**
     * Get video metadata
     */
    static async getVideoMetadata(videoPath) {
        // This would use ffmpeg to get video metadata
        // For now, return basic file stats
        const stats = await fs.stat(videoPath);
        return {
            size: stats.size,
            duration: 0, // Would be extracted using ffmpeg
            resolution: { width: 0, height: 0 },
            format: path.extname(videoPath),
        };
    }
    /**
     * Process video (convert, compress, generate multiple qualities)
     */
    static async processVideo(videoPath, options = {}) {
        // This would use ffmpeg for video processing
        // For now, return placeholder data
        const metadata = await this.getVideoMetadata(videoPath);
        return {
            originalPath: videoPath,
            processedVideos: [],
            thumbnailPath: options.generateThumbnail ? videoPath + '_thumb.jpg' : undefined,
            metadata,
        };
    }
}
// File utilities
export class FileUtils {
    /**
     * Get file type category
     */
    static getFileTypeCategory(mimeType) {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('video/'))
            return 'video';
        if (mimeType.startsWith('audio/'))
            return 'audio';
        if (mimeType === 'application/pdf' || mimeType.includes('document'))
            return 'document';
        return 'other';
    }
    /**
     * Generate file URL for serving
     */
    static generateFileUrl(filePath) {
        const relativePath = path.relative(config.upload.path, filePath);
        return `/uploads/${relativePath.replace(/\\/g, '/')}`;
    }
    /**
     * Clean up old uploaded files
     */
    static async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const tempDir = path.join(config.upload.path, 'temp');
            const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
            const files = await fs.readdir(tempDir);
            let deletedCount = 0;
            for (const file of files) {
                const filePath = path.join(tempDir, file);
                const stats = await fs.stat(filePath);
                if (stats.mtime.getTime() < cutoffTime) {
                    await fs.remove(filePath);
                    deletedCount++;
                }
            }
            logger.info(`Cleaned up ${deletedCount} old files`);
            return deletedCount;
        }
        catch (error) {
            logger.error('File cleanup failed:', error);
            return 0;
        }
    }
    /**
     * Calculate directory size
     */
    static async getDirectorySize(dirPath) {
        try {
            let totalSize = 0;
            const items = await fs.readdir(dirPath);
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);
                if (stats.isDirectory()) {
                    totalSize += await this.getDirectorySize(itemPath);
                }
                else {
                    totalSize += stats.size;
                }
            }
            return totalSize;
        }
        catch (error) {
            return 0;
        }
    }
}
// Chunked upload manager
export class ChunkedUploadManager {
    static uploads = new Map();
    /**
     * Initialize chunked upload
     */
    static initUpload(fileName, totalChunks) {
        const uploadId = uuidv4();
        const tempDir = path.join(config.upload.path, 'temp', uploadId);
        this.uploads.set(uploadId, {
            id: uploadId,
            fileName,
            totalChunks,
            uploadedChunks: new Set(),
            tempDir,
            createdAt: new Date(),
        });
        fs.ensureDirSync(tempDir);
        return uploadId;
    }
    /**
     * Upload chunk
     */
    static async uploadChunk(uploadId, chunkNumber, chunkData) {
        const upload = this.uploads.get(uploadId);
        if (!upload) {
            throw new Error('Upload not found');
        }
        const chunkPath = path.join(upload.tempDir, `chunk_${chunkNumber}`);
        await fs.writeFile(chunkPath, chunkData);
        upload.uploadedChunks.add(chunkNumber);
    }
    /**
     * Complete chunked upload
     */
    static async completeUpload(uploadId) {
        const upload = this.uploads.get(uploadId);
        if (!upload) {
            throw new Error('Upload not found');
        }
        if (upload.uploadedChunks.size !== upload.totalChunks) {
            throw new Error('Not all chunks uploaded');
        }
        // Combine chunks
        const finalPath = path.join(config.upload.path, upload.fileName);
        const writeStream = fs.createWriteStream(finalPath);
        for (let i = 0; i < upload.totalChunks; i++) {
            const chunkPath = path.join(upload.tempDir, `chunk_${i}`);
            const chunkData = await fs.readFile(chunkPath);
            writeStream.write(chunkData);
        }
        writeStream.end();
        // Cleanup
        await fs.remove(upload.tempDir);
        this.uploads.delete(uploadId);
        return finalPath;
    }
    /**
     * Cancel chunked upload
     */
    static async cancelUpload(uploadId) {
        const upload = this.uploads.get(uploadId);
        if (upload) {
            await fs.remove(upload.tempDir);
            this.uploads.delete(uploadId);
        }
    }
    /**
     * Clean up old uploads
     */
    static async cleanupOldUploads() {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        for (const [uploadId, upload] of this.uploads) {
            if (upload.createdAt.getTime() < cutoffTime) {
                await this.cancelUpload(uploadId);
            }
        }
    }
}
// Setup periodic cleanup
setInterval(() => {
    FileUtils.cleanupOldFiles().catch(console.error);
    ChunkedUploadManager.cleanupOldUploads().catch(console.error);
}, 60 * 60 * 1000); // Run every hour
export default upload;
//# sourceMappingURL=upload.js.map
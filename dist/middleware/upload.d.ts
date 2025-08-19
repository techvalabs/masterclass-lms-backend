import multer from 'multer';
export declare const upload: multer.Multer;
export declare class ImageProcessor {
    /**
     * Process uploaded image (resize, optimize, generate thumbnails)
     */
    static processImage(filePath: string, options?: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
        generateThumbnail?: boolean;
        thumbnailSize?: number;
    }): Promise<{
        originalPath: string;
        processedPath?: string;
        thumbnailPath?: string;
        metadata: any;
    }>;
    /**
     * Validate image file
     */
    static validateImage(filePath: string): Promise<boolean>;
}
export declare class VideoProcessor {
    /**
     * Generate video thumbnail
     */
    static generateThumbnail(videoPath: string, thumbnailPath: string, timeOffset?: number): Promise<string>;
    /**
     * Get video metadata
     */
    static getVideoMetadata(videoPath: string): Promise<any>;
    /**
     * Process video (convert, compress, generate multiple qualities)
     */
    static processVideo(videoPath: string, options?: {
        qualities?: number[];
        generateThumbnail?: boolean;
    }): Promise<{
        originalPath: string;
        processedVideos: Array<{
            quality: number;
            path: string;
        }>;
        thumbnailPath?: string;
        metadata: any;
    }>;
}
export declare class FileUtils {
    /**
     * Get file type category
     */
    static getFileTypeCategory(mimeType: string): string;
    /**
     * Generate file URL for serving
     */
    static generateFileUrl(filePath: string): string;
    /**
     * Clean up old uploaded files
     */
    static cleanupOldFiles(maxAgeHours?: number): Promise<number>;
    /**
     * Calculate directory size
     */
    static getDirectorySize(dirPath: string): Promise<number>;
}
export declare class ChunkedUploadManager {
    private static uploads;
    /**
     * Initialize chunked upload
     */
    static initUpload(fileName: string, totalChunks: number): string;
    /**
     * Upload chunk
     */
    static uploadChunk(uploadId: string, chunkNumber: number, chunkData: Buffer): Promise<void>;
    /**
     * Complete chunked upload
     */
    static completeUpload(uploadId: string): Promise<string>;
    /**
     * Cancel chunked upload
     */
    static cancelUpload(uploadId: string): Promise<void>;
    /**
     * Clean up old uploads
     */
    static cleanupOldUploads(): Promise<void>;
}
export default upload;
//# sourceMappingURL=upload.d.ts.map
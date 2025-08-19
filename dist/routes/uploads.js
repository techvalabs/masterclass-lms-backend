import { Router } from 'express';
import { UploadController } from '@/controllers/UploadController.js';
import { validateFileUpload, requireInstructorOrAdmin } from '@/middleware/validation.js';
import { upload } from '@/middleware/upload.js';
/**
 * File Upload Routes
 * Handles file uploads for images, videos, documents, and other content
 */
const router = Router();
const uploadController = new UploadController();
// Image uploads (avatars, thumbnails, etc.)
router.post('/images', upload.single('image'), validateFileUpload(['jpg', 'jpeg', 'png', 'gif', 'webp'], 5 * 1024 * 1024), // 5MB limit
uploadController.uploadImage);
// Multiple image uploads
router.post('/images/multiple', upload.array('images', 10), // Max 10 images
validateFileUpload(['jpg', 'jpeg', 'png', 'gif', 'webp'], 5 * 1024 * 1024), uploadController.uploadMultipleImages);
// Video uploads (course content)
router.post('/videos', requireInstructorOrAdmin, upload.single('video'), validateFileUpload(['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'], 500 * 1024 * 1024), // 500MB limit
uploadController.uploadVideo);
// Document uploads (resources, materials)
router.post('/documents', upload.single('document'), validateFileUpload(['pdf', 'doc', 'docx', 'txt', 'rtf'], 50 * 1024 * 1024), // 50MB limit
uploadController.uploadDocument);
// Multiple document uploads
router.post('/documents/multiple', upload.array('documents', 5), // Max 5 documents
validateFileUpload(['pdf', 'doc', 'docx', 'txt', 'rtf'], 50 * 1024 * 1024), uploadController.uploadMultipleDocuments);
// Audio uploads (if needed)
router.post('/audio', upload.single('audio'), validateFileUpload(['mp3', 'wav', 'ogg', 'm4a'], 100 * 1024 * 1024), // 100MB limit
uploadController.uploadAudio);
// Generic file upload with type detection
router.post('/files', upload.single('file'), uploadController.uploadFile);
// Get file information
router.get('/files/:fileId', uploadController.getFileInfo);
// Delete uploaded file
router.delete('/files/:fileId', uploadController.deleteFile);
// Process video (generate thumbnails, multiple qualities)
router.post('/videos/:fileId/process', requireInstructorOrAdmin, uploadController.processVideo);
// Get video processing status
router.get('/videos/:fileId/status', uploadController.getVideoProcessingStatus);
// Generate thumbnail from video
router.post('/videos/:fileId/thumbnail', requireInstructorOrAdmin, uploadController.generateVideoThumbnail);
// Chunked upload for large files
router.post('/chunked/init', uploadController.initChunkedUpload);
router.post('/chunked/:uploadId/chunk/:chunkNumber', upload.single('chunk'), uploadController.uploadChunk);
router.post('/chunked/:uploadId/complete', uploadController.completeChunkedUpload);
router.delete('/chunked/:uploadId', uploadController.cancelChunkedUpload);
export default router;
//# sourceMappingURL=uploads.js.map
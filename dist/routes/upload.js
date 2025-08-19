import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '@/middleware/auth.js';
const router = Router();
// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max
    },
    fileFilter: (req, file, cb) => {
        // Accept video files only
        const allowedMimes = [
            'video/mp4',
            'video/mpeg',
            'video/ogg',
            'video/webm',
            'video/quicktime',
            'video/x-msvideo',
            'video/x-ms-wmv'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only video files are allowed.'));
        }
    }
});
// Test endpoint for upload service
router.get('/test', authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Upload service is working',
        data: {
            maxFileSize: '500MB',
            supportedFormats: ['mp4', 'mpeg', 'ogg', 'webm', 'quicktime', 'avi', 'wmv'],
            uploadPath: '/api/upload/video'
        }
    });
});
// Upload video endpoint
router.post('/video', authenticate, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file uploaded'
            });
        }
        // Generate URL for the uploaded video
        const videoUrl = `/uploads/videos/${req.file.filename}`;
        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: videoUrl,
                path: req.file.path
            },
            message: 'Video uploaded successfully'
        });
    }
    catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload video',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Serve uploaded videos
router.use('/videos', (req, res, next) => {
    const videoPath = path.join(process.cwd(), 'uploads', 'videos', req.path);
    if (fs.existsSync(videoPath)) {
        res.sendFile(videoPath);
    }
    else {
        res.status(404).json({
            success: false,
            message: 'Video not found'
        });
    }
});
export default router;
//# sourceMappingURL=upload.js.map
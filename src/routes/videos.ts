import { Router } from 'express';
import { VideoUploadController } from '../controllers/VideoUploadController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();
const videoController = new VideoUploadController();

// All video routes require authentication
router.use(authenticate);

// Only instructors and admins can upload videos
router.post(
  '/upload',
  authorize(['admin', 'instructor']),
  videoController.uploadLessonVideo.bind(videoController)
);

// Get video status
router.get('/:videoId/status', videoController.getVideoStatus.bind(videoController));

// Delete video (admin/instructor only)
router.delete(
  '/:videoId',
  authorize(['admin', 'instructor']),
  videoController.deleteVideo.bind(videoController)
);

export default router;
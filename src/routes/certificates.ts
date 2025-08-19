import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { certificateController } from '../controllers/CertificateController.js';

const router = Router();

// Protected routes - require authentication
router.use(authenticate);

/**
 * @route POST /api/certificates/generate/:courseId
 * @desc Generate certificate for completed course
 * @access Private
 */
router.post('/generate/:courseId', certificateController.generateCertificate.bind(certificateController));

/**
 * @route GET /api/certificates/course/:courseId
 * @desc Get certificate by course ID
 * @access Private
 */
router.get('/course/:courseId', certificateController.getCertificateByCourse.bind(certificateController));

/**
 * @route GET /api/certificates/user
 * @desc Get all certificates for logged-in user
 * @access Private
 */
router.get('/user', certificateController.getUserCertificates.bind(certificateController));

/**
 * @route GET /api/certificates/verify/:certificateNumber
 * @desc Verify certificate by number (public endpoint)
 * @access Public
 */
router.get('/verify/:certificateNumber', certificateController.verifyCertificate.bind(certificateController));

export default router;
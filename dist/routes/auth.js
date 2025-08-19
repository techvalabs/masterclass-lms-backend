import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController.js';
import { validate, AuthValidation } from '@/middleware/validation.js';
import { authenticate, optionalAuth } from '@/middleware/auth.js';
import upload from '@/middleware/upload.js';
/**
 * Authentication Routes
 * Handles user registration, login, logout, password reset, and email verification
 */
const router = Router();
const authController = new AuthController();
// User Registration
router.post('/register', validate(AuthValidation.register), authController.register);
// Email Verification
router.get('/verify-email/:token', authController.verifyEmail);
// Resend Email Verification
router.post('/resend-verification', validate(AuthValidation.forgotPassword), // Reuse email validation
authController.resendVerification);
// User Login
router.post('/login', validate(AuthValidation.login), authController.login);
// Refresh Token
router.post('/refresh-token', validate(AuthValidation.refreshToken), authController.refreshToken);
// Refresh Token (alternative endpoint for frontend compatibility)
router.post('/refresh', validate(AuthValidation.refreshToken), authController.refreshToken);
// User Logout
router.post('/logout', authenticate, authController.logout);
// Logout from all devices
router.post('/logout-all', authenticate, authController.logoutAll);
// Forgot Password
router.post('/forgot-password', authController.forgotPassword);
// Reset Password
router.post('/reset-password', authController.resetPassword);
// Admin Password Reset (Development/Debug only)
router.post('/admin-reset-password', validate(AuthValidation.resetUserPassword), authController.adminResetPassword);
// Change Password (authenticated user)
router.post('/change-password', authenticate, authController.changePassword);
// Verify token (check if user is authenticated)
router.get('/verify', authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: req.user
        }
    });
});
// Get current user profile
router.get('/me', authenticate, authController.getCurrentUser);
// Update current user profile
router.put('/me', authenticate, authController.updateProfile);
// Delete account
router.delete('/me', authenticate, authController.deleteAccount);
// Check email availability
router.post('/check-email', authController.checkEmailAvailability);
// Social Authentication (Google, Facebook, etc.)
router.post('/social/google', authController.googleAuth);
router.post('/social/facebook', authController.facebookAuth);
// Two-Factor Authentication routes
router.post('/2fa/enable', authenticate, authController.enableTwoFactor);
router.post('/2fa/disable', authenticate, authController.disableTwoFactor);
router.post('/2fa/verify', authenticate, authController.verifyTwoFactor);
// Account recovery
router.post('/recover-account', authController.recoverAccount);
// Get authentication status (public route with optional auth)
router.get('/status', optionalAuth, authController.getAuthStatus);
// Temporary route for promoting user to admin (development only)
router.post('/promote-to-admin', validate(AuthValidation.promoteToAdmin), authController.promoteToAdmin);
// Temporary route for resetting user password (development only)
router.post('/reset-user-password', validate(AuthValidation.resetUserPassword), authController.resetUserPassword);
// Profile Management Routes
// Get detailed profile with role-specific data and stats
router.get('/profile', authenticate, authController.getProfile);
// Update profile information
router.put('/profile', authenticate, authController.updateProfile);
// Upload profile avatar
router.post('/profile/avatar', authenticate, upload.single('image'), authController.uploadAvatar);
// Get profile statistics
router.get('/profile/stats', authenticate, authController.getProfileStats);
// Debug endpoint to check permissions data
router.get('/debug-permissions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { db } = await import('@/config/database.js');
        const userRows = await db.query(`
      SELECT u.id, u.email, u.name, u.role_id, r.name as role, r.permissions,
             LENGTH(r.permissions) as permissions_length
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);
        if (userRows.length === 0) {
            return res.json({ error: 'User not found' });
        }
        const user = userRows[0];
        const permissionsStr = user.permissions?.toString() || '';
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            permissions: {
                raw: user.permissions,
                type: typeof user.permissions,
                asString: permissionsStr,
                length: user.permissions_length,
                first100: permissionsStr.substring(0, 100),
                last100: permissionsStr.substring(permissionsStr.length - 100)
            }
        });
    }
    catch (error) {
        res.json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=auth.js.map
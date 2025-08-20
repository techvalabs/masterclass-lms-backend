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
router.post('/register', validate(AuthValidation.register), (req, res) => authController.register(req, res));
// Email Verification
router.get('/verify-email/:token', (req, res) => authController.verifyEmail(req, res));
// Resend Email Verification
router.post('/resend-verification', validate(AuthValidation.forgotPassword), // Reuse email validation
(req, res) => authController.resendVerification(req, res));
// User Login
router.post('/login', validate(AuthValidation.login), (req, res) => authController.login(req, res));
// Refresh Token
router.post('/refresh-token', validate(AuthValidation.refreshToken), (req, res) => authController.refreshToken(req, res));
// Refresh Token (alternative endpoint for frontend compatibility)
router.post('/refresh', validate(AuthValidation.refreshToken), (req, res) => authController.refreshToken(req, res));
// User Logout
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));
// Logout from all devices
router.post('/logout-all', authenticate, (req, res) => authController.logoutAll(req, res));
// Forgot Password
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
// Reset Password
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
// Admin Password Reset (Development/Debug only)
router.post('/admin-reset-password', validate(AuthValidation.resetUserPassword), (req, res) => authController.adminResetPassword(req, res));
// Change Password (authenticated user)
router.post('/change-password', authenticate, (req, res) => authController.changePassword(req, res));
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
router.get('/me', authenticate, (req, res) => authController.getCurrentUser(req, res));
// Update current user profile
router.put('/me', authenticate, (req, res) => authController.updateProfile(req, res));
// Delete account
router.delete('/me', authenticate, (req, res) => authController.deleteAccount(req, res));
// Check email availability
router.post('/check-email', (req, res) => authController.checkEmailAvailability(req, res));
// Social Authentication (Google, Facebook, etc.)
router.post('/social/google', (req, res) => authController.googleAuth(req, res));
router.post('/social/facebook', (req, res) => authController.facebookAuth(req, res));
// Two-Factor Authentication routes
router.post('/2fa/enable', authenticate, (req, res) => authController.enableTwoFactor(req, res));
router.post('/2fa/disable', authenticate, (req, res) => authController.disableTwoFactor(req, res));
router.post('/2fa/verify', authenticate, (req, res) => authController.verifyTwoFactor(req, res));
// Account recovery
router.post('/recover-account', (req, res) => authController.recoverAccount(req, res));
// Get authentication status (public route with optional auth)
router.get('/status', optionalAuth, (req, res) => authController.getAuthStatus(req, res));
// Temporary route for promoting user to admin (development only)
router.post('/promote-to-admin', validate(AuthValidation.promoteToAdmin), (req, res) => authController.promoteToAdmin(req, res));
// Temporary route for resetting user password (development only)
router.post('/reset-user-password', validate(AuthValidation.resetUserPassword), (req, res) => authController.resetUserPassword(req, res));
// Profile Management Routes
// Get detailed profile with role-specific data and stats
router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res));
// Update profile information
router.put('/profile', authenticate, (req, res) => authController.updateProfile(req, res));
// Upload profile avatar
router.post('/profile/avatar', authenticate, upload.single('image'), (req, res) => authController.uploadAvatar(req, res));
// Get profile statistics
router.get('/profile/stats', authenticate, (req, res) => authController.getProfileStats(req, res));
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
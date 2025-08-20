import { Request, Response } from 'express';
import { AuthRequest } from '@/types/index.js';
/**
 * Authentication Controller
 * Handles all authentication-related operations with database fallback
 */
export declare class AuthController {
    private fallbackUsersPath;
    /**
     * Check if database is available
     */
    private isDatabaseAvailable;
    /**
     * Get fallback users from file system
     */
    private getFallbackUsers;
    /**
     * Save fallback users to file system
     */
    private saveFallbackUsers;
    /**
     * Safely parse JSON with fallback
     */
    private safeJsonParse;
    /**
     * Find user by email (database or fallback)
     */
    private findUserByEmail;
    /**
     * Register a new user
     */
    register: (req: Request, res: Response) => Promise<void>;
    /**
     * Verify email address
     */
    verifyEmail(req: Request, res: Response): Promise<void>;
    /**
     * Resend verification email
     */
    resendVerification(req: Request, res: Response): Promise<void>;
    /**
     * User login
     */
    login: (req: Request, res: Response) => Promise<void>;
    /**
     * Refresh access token
     */
    refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * User logout
     */
    logout(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Logout from all devices
     */
    logoutAll(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Forgot password
     */
    forgotPassword(req: Request, res: Response): Promise<void>;
    /**
     * Reset password
     */
    resetPassword(req: Request, res: Response): Promise<void>;
    /**
     * Change password for authenticated user
     */
    changePassword(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get current user profile
     */
    getCurrentUser(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update user profile (deprecated - kept for backward compatibility)
     */
    updateProfileDeprecated(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete user account
     */
    deleteAccount(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Check email availability
     */
    checkEmailAvailability(req: Request, res: Response): Promise<void>;
    /**
     * Social authentication - Google
     */
    googleAuth(req: Request, res: Response): Promise<void>;
    /**
     * Social authentication - Facebook
     */
    facebookAuth(req: Request, res: Response): Promise<void>;
    /**
     * Enable two-factor authentication
     */
    enableTwoFactor(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Disable two-factor authentication
     */
    disableTwoFactor(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Verify two-factor authentication code
     */
    verifyTwoFactor(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Account recovery
     */
    recoverAccount(req: Request, res: Response): Promise<void>;
    /**
     * Get authentication status
     */
    getAuthStatus(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Helper method to get user by email
     */
    private getUserByEmail;
    /**
     * Helper method to get user by ID
     */
    private getUserById;
    /**
     * Temporary method to promote user to admin (for development only)
     */
    promoteToAdmin(req: Request, res: Response): Promise<void>;
    /**
     * Temporary method to reset user password (for development only)
     */
    resetUserPassword(req: Request, res: Response): Promise<void>;
    /**
     * Admin password reset - allows resetting any user's password (dev/debug tool)
     */
    adminResetPassword(req: Request, res: Response): Promise<void>;
    /**
     * Get current user profile with role-specific data
     */
    getProfile(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update user profile
     */
    updateProfile(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Upload profile avatar
     */
    uploadAvatar(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get user statistics
     */
    getProfileStats(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map
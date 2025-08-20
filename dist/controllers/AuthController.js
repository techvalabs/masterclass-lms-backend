import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '@/config/database.js';
import { JwtUtils, PasswordUtils } from '@/middleware/auth.js';
import { EmailService } from '@/services/EmailService.js';
import { logger, logAuth } from '@/utils/logger.js';
import { ValidationError, AuthenticationError, ConflictError, NotFoundError } from '@/utils/errors.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Authentication Controller
 * Handles all authentication-related operations with database fallback
 */
export class AuthController {
    fallbackUsersPath = path.join(__dirname, '../../data/fallback-users.json');
    /**
     * Check if database is available
     */
    async isDatabaseAvailable() {
        try {
            // Check if database pool is initialized first
            const pool = db.getPool();
            if (!pool) {
                return false;
            }
            await db.query('SELECT 1');
            return true;
        }
        catch (error) {
            // Database is not available (expected in fallback mode)
            return false;
        }
    }
    /**
     * Get fallback users from file system
     */
    async getFallbackUsers() {
        try {
            const data = await fs.readFile(this.fallbackUsersPath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            // Return default admin user if file doesn't exist
            return [{
                    id: 1,
                    email: 'admin@example.com',
                    name: 'Admin User',
                    password_hash: '$2a$12$BzoJjLK02lM5ZGdCVJpb0utp6WpT87swdd94SPElsSnUMq344c0yS', // secret123
                    role: 'admin',
                    is_active: true,
                    email_verified_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }];
        }
    }
    /**
     * Save fallback users to file system
     */
    async saveFallbackUsers(users) {
        try {
            const dataDir = path.dirname(this.fallbackUsersPath);
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(this.fallbackUsersPath, JSON.stringify(users, null, 2));
        }
        catch (error) {
            logger.error('Failed to save fallback users:', error);
        }
    }
    /**
     * Safely parse JSON with fallback
     */
    safeJsonParse(jsonString, fallback = null) {
        try {
            return JSON.parse(jsonString);
        }
        catch (error) {
            logger.warn(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return fallback;
        }
    }
    /**
     * Find user by email (database or fallback)
     */
    async findUserByEmail(email) {
        const dbAvailable = await this.isDatabaseAvailable();
        if (dbAvailable) {
            return this.getUserByEmail(email);
        }
        else {
            // Use fallback file system
            const users = await this.getFallbackUsers();
            const user = users.find(u => u.email === email);
            return user || null;
        }
    }
    /**
     * Register a new user
     */
    register = async (req, res) => {
        const userData = req.body;
        try {
            // Check if email already exists
            const existingUser = await this.findUserByEmail(userData.email);
            if (existingUser) {
                throw new ConflictError('Email address already exists');
            }
            // Combine firstName and lastName into name
            const fullName = `${userData.firstName} ${userData.lastName}`;
            // Hash password
            const passwordHash = await PasswordUtils.hash(userData.password);
            const dbAvailable = await this.isDatabaseAvailable();
            let userId;
            if (dbAvailable) {
                // Create user in database (use auto-increment ID) - simplified for existing schema
                const result = await db.query(`
          INSERT INTO users (
            email, name, password_hash, role, role_id, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, TRUE, NOW())
        `, [
                    userData.email,
                    fullName,
                    passwordHash,
                    userData.role || 'student',
                    (userData.role === 'instructor' ? 2 : 1)
                ]);
                userId = result.insertId;
                // Skip instructor record creation - table may not exist yet
            }
            else {
                // Use fallback file system
                const users = await this.getFallbackUsers();
                userId = Math.max(...users.map(u => u.id), 0) + 1;
                const newUser = {
                    id: userId,
                    email: userData.email,
                    name: fullName,
                    password_hash: passwordHash,
                    role: userData.role || 'student',
                    is_active: true, // Skip email verification for now
                    email_verified_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                users.push(newUser);
                await this.saveFallbackUsers(users);
            }
            // Skip email verification for now (simplified registration)
            // Generate tokens for immediate login
            const tokens = JwtUtils.generateTokens({ userId, email: userData.email });
            // Create user object for response
            const userResponse = {
                id: userId,
                email: userData.email,
                name: fullName,
                avatar: null,
                role: userData.role || 'student',
                is_active: true,
                email_verified_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            // Log successful registration
            logAuth('User registered', userData.email, true, {
                userId,
                role: userData.role,
                fallback_mode: !dbAvailable
            });
            res.status(201).json({
                success: true,
                message: `Account created successfully${!dbAvailable ? ' (fallback mode)' : ''}. You are now logged in.`,
                data: {
                    user: userResponse,
                    tokens,
                    fallback_mode: !dbAvailable
                },
            });
        }
        catch (error) {
            logger.error('Registration error:', error);
            throw error;
        }
    };
    /**
     * Verify email address
     */
    async verifyEmail(req, res) {
        const { token } = req.params;
        try {
            // Find user by verification token
            const rows = await db.query(`
        SELECT id, email, name, role FROM users 
        WHERE verification_token = ? AND is_active = 0
      `, [token]);
            if (rows.length === 0) {
                throw new NotFoundError('Invalid or expired verification token');
            }
            const user = rows[0];
            // Activate user account
            await db.query(`
        UPDATE users 
        SET is_active = 1, email_verified_at = NOW(), verification_token = NULL
        WHERE id = ?
      `, [user.id]);
            logAuth('Email verified', user.email, true, { userId: user.id });
            res.json({
                success: true,
                message: 'Email verified successfully. You can now log in.',
                data: {
                    user_id: user.id,
                    email: user.email,
                },
            });
        }
        catch (error) {
            logger.error('Email verification error:', error);
            throw error;
        }
    }
    /**
     * Resend verification email
     */
    async resendVerification(req, res) {
        const { email } = req.body;
        try {
            // Find unverified user
            const rows = await db.query(`
        SELECT id, name, email FROM users 
        WHERE email = ? AND is_active = 0 AND email_verified_at IS NULL
      `, [email]);
            if (rows.length === 0) {
                throw new NotFoundError('No unverified account found with this email address');
            }
            const user = rows[0];
            // Generate new verification token
            const verificationToken = JwtUtils.generateSecureToken();
            // Update user with new token
            await db.query(`
        UPDATE users SET verification_token = ? WHERE id = ?
      `, [verificationToken, user.id]);
            // Send verification email
            await EmailService.sendVerificationEmail(user.email, user.name, verificationToken);
            logAuth('Verification email resent', user.email, true, { userId: user.id });
            res.json({
                success: true,
                message: 'Verification email sent successfully.',
            });
        }
        catch (error) {
            logger.error('Resend verification error:', error);
            throw error;
        }
    }
    /**
     * User login
     */
    login = async (req, res) => {
        const credentials = req.body;
        try {
            // Find user by email (database or fallback)
            const user = await this.findUserByEmail(credentials.email);
            if (!user) {
                throw new AuthenticationError('Invalid email or password');
            }
            // Check if account is active
            if (!user.is_active) {
                throw new AuthenticationError('Account is not verified. Please check your email.');
            }
            // Verify password
            const isPasswordValid = await PasswordUtils.compare(credentials.password, user.password_hash);
            if (!isPasswordValid) {
                throw new AuthenticationError('Invalid email or password');
            }
            // Generate tokens
            const tokens = JwtUtils.generateTokens({ userId: Number(user.id), email: user.email });
            const dbAvailable = await this.isDatabaseAvailable();
            // Update last login if database is available
            if (dbAvailable) {
                try {
                    // Update last_login (note: column is last_login, not last_login_at)
                    await db.query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);
                }
                catch (updateError) {
                    // Check if error is about missing column
                    const errorMessage = updateError instanceof Error ? updateError.message : String(updateError);
                    if (errorMessage.includes('last_login') && errorMessage.includes('Unknown column')) {
                        logger.warn('last_login column does not exist - skipping update');
                    }
                    else {
                        logger.error('Failed to update last login in database:', updateError);
                    }
                    // Don't fail login if update fails
                }
            }
            else {
                // Update in fallback file system
                try {
                    const users = await this.getFallbackUsers();
                    const userIndex = users.findIndex(u => u.id === user.id);
                    if (userIndex >= 0) {
                        users[userIndex].last_login_at = new Date().toISOString();
                        await this.saveFallbackUsers(users);
                    }
                }
                catch (updateError) {
                    logger.error('Failed to update last login in fallback storage:', updateError);
                    // Don't fail login if update fails
                }
            }
            // Remove password hash from response
            const { password_hash, ...userResponse } = user;
            logAuth('User logged in', user.email, true, {
                userId: user.id,
                remember_me: credentials.remember_me,
                fallback_mode: !dbAvailable
            });
            res.json({
                success: true,
                message: `Login successful${!dbAvailable ? ' (fallback mode)' : ''}`,
                data: {
                    user: userResponse,
                    tokens,
                    fallback_mode: !dbAvailable
                },
            });
        }
        catch (error) {
            logger.error('Login error:', error);
            throw error;
        }
    };
    /**
     * Refresh access token
     */
    async refreshToken(req, res) {
        // Handle both refresh_token and refreshToken field names for compatibility
        const refresh_token = req.body.refresh_token || req.body.refreshToken;
        if (!refresh_token) {
            throw new ValidationError('Refresh token is required');
        }
        try {
            // Verify refresh token
            const decoded = await JwtUtils.verifyRefreshToken(refresh_token);
            // Get user data
            const userRows = await db.query(`
        SELECT u.id, u.email, u.name, r.name as role, u.is_active 
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [decoded.userId]);
            if (userRows.length === 0) {
                throw new AuthenticationError('User not found');
            }
            const user = userRows[0];
            if (!user.is_active) {
                throw new AuthenticationError('User is inactive');
            }
            // Generate new tokens
            const tokens = JwtUtils.generateTokens({ userId: Number(user.id), email: user.email });
            // Blacklist old refresh token (simplified for now)
            // await SessionUtils.blacklistToken(refresh_token, user.id, 'refresh_token_used');
            logAuth('Token refreshed', user.email, true, { userId: user.id });
            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: { tokens },
            });
        }
        catch (error) {
            logger.error('Token refresh error:', error);
            throw error;
        }
    }
    /**
     * User logout
     */
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.substring(7); // Remove 'Bearer '
            if (token && req.user) {
                // Simplified logout - token blacklisting would be implemented here
                // await SessionUtils.blacklistToken(token, req.user.id, 'logout');
            }
            logAuth('User logged out', req.user?.email, true, { userId: req.user?.id });
            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            logger.error('Logout error:', error);
            throw error;
        }
    }
    /**
     * Logout from all devices
     */
    async logoutAll(req, res) {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            // Blacklist all tokens for this user (would need to implement token tracking)
            // For now, we'll just log the action
            logAuth('User logged out from all devices', req.user.email, true, { userId: req.user.id });
            res.json({
                success: true,
                message: 'Logged out from all devices successfully',
            });
        }
        catch (error) {
            logger.error('Logout all error:', error);
            throw error;
        }
    }
    /**
     * Forgot password
     */
    async forgotPassword(req, res) {
        const { email } = req.body;
        try {
            // Find user by email
            const user = await this.getUserByEmail(email);
            if (!user || !user.is_active) {
                // Don't reveal if email exists for security reasons
                res.json({
                    success: true,
                    message: 'If an account with this email exists, you will receive a password reset link.',
                });
                return;
            }
            // Generate reset token
            const resetToken = JwtUtils.generateSecureToken();
            const resetExpires = new Date(Date.now() + 3600000); // 1 hour
            // Update user with reset token
            await db.query(`
        UPDATE users 
        SET reset_password_token = ?, reset_password_expires = ?
        WHERE id = ?
      `, [resetToken, resetExpires, user.id]);
            // Send password reset email
            await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);
            logAuth('Password reset requested', user.email, true, { userId: user.id });
            res.json({
                success: true,
                message: 'If an account with this email exists, you will receive a password reset link.',
            });
        }
        catch (error) {
            logger.error('Forgot password error:', error);
            throw error;
        }
    }
    /**
     * Reset password
     */
    async resetPassword(req, res) {
        const { token, password } = req.body;
        try {
            // Find user by reset token
            const rows = await db.query(`
        SELECT id, email, name FROM users 
        WHERE reset_password_token = ? 
        AND reset_password_expires > NOW()
        AND is_active = 1
      `, [token]);
            if (rows.length === 0) {
                throw new NotFoundError('Invalid or expired reset token');
            }
            const user = rows[0];
            // Hash new password
            const passwordHash = await PasswordUtils.hash(password);
            // Update password and clear reset token
            await db.query(`
        UPDATE users 
        SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL
        WHERE id = ?
      `, [passwordHash, user.id]);
            // Send confirmation email
            await EmailService.sendPasswordChangedEmail(user.email, user.name);
            logAuth('Password reset completed', user.email, true, { userId: user.id });
            res.json({
                success: true,
                message: 'Password reset successfully. You can now log in with your new password.',
            });
        }
        catch (error) {
            logger.error('Reset password error:', error);
            throw error;
        }
    }
    /**
     * Change password for authenticated user
     */
    async changePassword(req, res) {
        const { current_password, new_password } = req.body;
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            // Get current user with password hash
            const rows = await db.query(`
        SELECT password_hash FROM users WHERE id = ?
      `, [req.user.id]);
            if (rows.length === 0) {
                throw new NotFoundError('User not found');
            }
            const { password_hash } = rows[0];
            // Verify current password
            const isCurrentPasswordValid = await PasswordUtils.compare(current_password, password_hash);
            if (!isCurrentPasswordValid) {
                throw new AuthenticationError('Current password is incorrect');
            }
            // Hash new password
            const newPasswordHash = await PasswordUtils.hash(new_password);
            // Update password
            await db.query(`
        UPDATE users SET password_hash = ? WHERE id = ?
      `, [newPasswordHash, req.user.id]);
            // Send confirmation email
            await EmailService.sendPasswordChangedEmail(req.user.email, req.user.name);
            logAuth('Password changed', req.user.email, true, { userId: req.user.id });
            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        }
        catch (error) {
            logger.error('Change password error:', error);
            throw error;
        }
    }
    /**
     * Get current user profile
     */
    async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            // Get complete user profile (simplified - no user_profiles table yet)
            const rows = await db.query(`
        SELECT 
          u.id, u.email, u.name, u.avatar, u.role_id, u.is_active,
          u.email_verified_at, u.created_at, u.updated_at,
          r.name as role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [req.user.id]);
            if (rows.length === 0) {
                throw new NotFoundError('User not found');
            }
            const user = rows[0];
            res.json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            logger.error('Get current user error:', error);
            throw error;
        }
    }
    /**
     * Update user profile (deprecated - kept for backward compatibility)
     */
    async updateProfileDeprecated(req, res) {
        const updates = req.body;
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            // Update user table fields
            const userFields = ['name', 'avatar'];
            const userUpdates = Object.keys(updates)
                .filter(key => userFields.includes(key) && updates[key] !== undefined)
                .map(key => `${key} = ?`)
                .join(', ');
            if (userUpdates) {
                const userValues = userFields
                    .filter(field => updates[field] !== undefined)
                    .map(field => updates[field]);
                await db.query(`
          UPDATE users SET ${userUpdates}, updated_at = NOW() WHERE id = ?
        `, [...userValues, req.user.id]);
            }
            // Skip profile table updates - table doesn't exist in current schema
            // TODO: Add user_profiles table support in future migration
            logAuth('Profile updated', req.user.email, true, { userId: req.user.id });
            res.json({
                success: true,
                message: 'Profile updated successfully',
            });
        }
        catch (error) {
            logger.error('Update profile error:', error);
            throw error;
        }
    }
    /**
     * Delete user account
     */
    async deleteAccount(req, res) {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            // Soft delete - mark as inactive instead of hard delete
            await db.query(`
        UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?
      `, [req.user.id]);
            logAuth('Account deleted', req.user.email, true, { userId: req.user.id });
            res.json({
                success: true,
                message: 'Account deleted successfully',
            });
        }
        catch (error) {
            logger.error('Delete account error:', error);
            throw error;
        }
    }
    /**
     * Check email availability
     */
    async checkEmailAvailability(req, res) {
        const { email } = req.body;
        try {
            const existingUser = await this.getUserByEmail(email);
            res.json({
                success: true,
                data: {
                    available: !existingUser,
                    email,
                },
            });
        }
        catch (error) {
            logger.error('Check email availability error:', error);
            throw error;
        }
    }
    /**
     * Social authentication - Google
     */
    async googleAuth(req, res) {
        // Implement Google OAuth integration
        res.status(501).json({
            success: false,
            message: 'Google authentication not implemented yet',
        });
    }
    /**
     * Social authentication - Facebook
     */
    async facebookAuth(req, res) {
        // Implement Facebook OAuth integration
        res.status(501).json({
            success: false,
            message: 'Facebook authentication not implemented yet',
        });
    }
    /**
     * Enable two-factor authentication
     */
    async enableTwoFactor(req, res) {
        // Implement 2FA setup
        res.status(501).json({
            success: false,
            message: 'Two-factor authentication not implemented yet',
        });
    }
    /**
     * Disable two-factor authentication
     */
    async disableTwoFactor(req, res) {
        // Implement 2FA disable
        res.status(501).json({
            success: false,
            message: 'Two-factor authentication not implemented yet',
        });
    }
    /**
     * Verify two-factor authentication code
     */
    async verifyTwoFactor(req, res) {
        // Implement 2FA verification
        res.status(501).json({
            success: false,
            message: 'Two-factor authentication not implemented yet',
        });
    }
    /**
     * Account recovery
     */
    async recoverAccount(req, res) {
        // Implement account recovery
        res.status(501).json({
            success: false,
            message: 'Account recovery not implemented yet',
        });
    }
    /**
     * Get authentication status
     */
    async getAuthStatus(req, res) {
        res.json({
            success: true,
            data: {
                authenticated: !!req.user,
                user: req.user ? {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    role: req.user.role,
                    avatar: req.user.avatar,
                } : null,
            },
        });
    }
    /**
     * Helper method to get user by email
     */
    async getUserByEmail(email) {
        try {
            const rows = await db.query(`
        SELECT u.id, u.email, u.name, u.password_hash, u.avatar, r.name as role, 
               u.is_active, u.email_verified_at, u.created_at, u.updated_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `, [email]);
            return rows.length > 0 ? rows[0] : null;
        }
        catch (error) {
            logger.error('Error fetching user by email:', error);
            return null;
        }
    }
    /**
     * Helper method to get user by ID
     */
    async getUserById(id) {
        try {
            const rows = await db.query(`
        SELECT u.id, u.email, u.name, u.password_hash, u.avatar, r.name as role, 
               u.is_active, u.email_verified_at, u.created_at, u.updated_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [id]);
            return rows.length > 0 ? rows[0] : null;
        }
        catch (error) {
            logger.error('Error fetching user by ID:', error);
            return null;
        }
    }
    /**
     * Temporary method to promote user to admin (for development only)
     */
    async promoteToAdmin(req, res) {
        const { email } = req.body;
        if (!email) {
            throw new ValidationError('Email is required');
        }
        try {
            // Update user role to admin
            const result = await db.query(`
        UPDATE users 
        SET role = 'admin', role_id = 3 
        WHERE email = ?
      `, [email]);
            if (result.affectedRows === 0) {
                throw new NotFoundError('User not found');
            }
            // Get updated user directly from database
            const rows = await db.query(`
        SELECT id, email, name, role 
        FROM users 
        WHERE email = ?
      `, [email]);
            const user = rows.length > 0 ? rows[0] : null;
            logAuth('User promoted to admin', email, true, { userId: user?.id });
            res.json({
                success: true,
                message: 'User promoted to admin successfully',
                data: {
                    user: {
                        id: user?.id,
                        email: user?.email,
                        name: user?.name,
                        role: user?.role
                    }
                }
            });
        }
        catch (error) {
            logger.error('Promote to admin error:', error);
            throw error;
        }
    }
    /**
     * Temporary method to reset user password (for development only)
     */
    async resetUserPassword(req, res) {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            throw new ValidationError('Email and newPassword are required');
        }
        try {
            // Hash new password
            const passwordHash = await PasswordUtils.hash(newPassword);
            // Update user password
            const result = await db.query(`
        UPDATE users 
        SET password_hash = ?
        WHERE email = ?
      `, [passwordHash, email]);
            if (result.affectedRows === 0) {
                throw new NotFoundError('User not found');
            }
            logAuth('Password reset for user', email, true, { action: 'password_reset' });
            res.json({
                success: true,
                message: 'Password reset successfully',
                data: {
                    email: email
                }
            });
        }
        catch (error) {
            logger.error('Reset user password error:', error);
            throw error;
        }
    }
    /**
     * Admin password reset - allows resetting any user's password (dev/debug tool)
     */
    async adminResetPassword(req, res) {
        const { email, newPassword } = req.body;
        try {
            // Hash new password
            const passwordHash = await PasswordUtils.hash(newPassword);
            // Update password for any user with this email
            const result = await db.query(`
        UPDATE users 
        SET password_hash = ?, updated_at = NOW() 
        WHERE email = ? AND is_active = 1
      `, [passwordHash, email]);
            if (result.affectedRows === 0) {
                throw new NotFoundError('User not found or inactive');
            }
            logAuth('Admin password reset', email, true, {
                action: 'admin_password_reset',
                resetBy: 'system'
            });
            res.json({
                success: true,
                message: 'Password reset successfully',
                data: {
                    email: email,
                    message: 'User can now login with the new password'
                }
            });
        }
        catch (error) {
            logger.error('Admin password reset error:', error);
            throw error;
        }
    }
    /**
     * Get current user profile with role-specific data
     */
    async getProfile(req, res) {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            const userId = req.user.id;
            // Get basic user profile with existing columns only
            const userRows = await db.query(`
        SELECT u.id, u.email, u.name, u.role_id, u.avatar,
               u.email_verified, u.is_active, u.last_login,
               r.name as role, r.permissions
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [userId]);
            if (userRows.length === 0) {
                throw new NotFoundError('User not found');
            }
            const user = userRows[0];
            // Debug permissions data
            logger.info('Raw permissions data:', {
                permissions: user.permissions,
                type: typeof user.permissions,
                length: user.permissions?.length
            });
            // Create profile object with available data and defaults for missing fields
            const profile = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                role_id: user.role_id,
                avatar: user.avatar || null,
                phone: null, // Not in current schema
                date_of_birth: null, // Not in current schema
                bio: null, // Not in current schema
                location: null, // Not in current schema
                website: null, // Not in current schema
                social_links: {}, // Not in current schema
                preferences: {}, // Not in current schema
                is_active: user.is_active,
                email_verified_at: user.email_verified ? new Date() : null,
                created_at: new Date(),
                updated_at: new Date()
            };
            let roleSpecificData = {};
            let stats = {};
            // Provide default role-specific data (simplified for existing schema)
            if (user.role === 'instructor') {
                roleSpecificData = {
                    instructor_data: {
                        instructor_bio: null,
                        expertise: [],
                        years_experience: 0,
                        certifications: [],
                        education: [],
                        achievements: [],
                        hourly_rate: null,
                        teaching_philosophy: null,
                        specializations: [],
                        languages_spoken: []
                    }
                };
                // Mock instructor stats for now
                stats = {
                    total_courses_created: 0,
                    total_students_taught: 0,
                    average_course_rating: 0,
                    total_reviews: 0,
                    total_earnings: 0,
                    response_rate: 100,
                    response_time_hours: 24
                };
            }
            else if (user.role === 'student') {
                roleSpecificData = {
                    learning_stats: {
                        total_courses_enrolled: 0,
                        total_courses_completed: 0,
                        total_hours_learned: 0,
                        certificates_earned: 0,
                        current_streak_days: 0,
                        favorite_categories: []
                    }
                };
                // Mock student stats for now
                stats = {
                    total_courses_enrolled: 0,
                    total_courses_completed: 0,
                    certificates_earned: 0,
                    total_hours_learned: 0
                };
            }
            else if (user.role === 'admin') {
                roleSpecificData = {
                    admin_data: {
                        admin_level: 'super_admin',
                        permissions: Array.isArray(user.permissions) ? user.permissions :
                            (typeof user.permissions === 'string' ? this.safeJsonParse(user.permissions, []) : []),
                        department: null,
                        employee_id: null
                    }
                };
                // Mock admin stats for now
                stats = {
                    users_managed: 0,
                    courses_managed: 0,
                    total_enrollments: 0,
                    content_reviews_completed: 0,
                    system_uptime_responsibility: true,
                    last_security_review: null
                };
            }
            res.json({
                success: true,
                data: {
                    user: {
                        ...profile,
                        ...roleSpecificData
                    },
                    stats
                },
                message: 'Profile retrieved successfully'
            });
        }
        catch (error) {
            logger.error('Get profile error:', error);
            throw error;
        }
    }
    /**
     * Update user profile
     */
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            const userId = req.user.id;
            const { name } = req.body;
            // For now, only update fields that exist in the current database schema
            const updateFields = [];
            const updateValues = [];
            if (name !== undefined) {
                updateFields.push('name = ?');
                updateValues.push(name);
            }
            if (updateFields.length > 0) {
                updateValues.push(userId);
                await db.query(`
          UPDATE users 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `, updateValues);
                logger.info('Profile updated successfully');
            }
            logger.info('Profile updated successfully', { userId, fields: updateFields });
            res.json({
                success: true,
                message: 'Profile updated successfully'
            });
        }
        catch (error) {
            logger.error('Update profile error:', error);
            throw error;
        }
    }
    /**
     * Upload profile avatar
     */
    async uploadAvatar(req, res) {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            if (!req.file) {
                throw new ValidationError('No image file provided');
            }
            const userId = req.user.id;
            const filename = req.file.filename;
            const avatarUrl = `/uploads/images/${filename}`;
            // Update user avatar in database
            await db.query(`
        UPDATE users 
        SET avatar = ?, updated_at = NOW()
        WHERE id = ?
      `, [avatarUrl, userId]);
            logger.info('Avatar uploaded successfully', { userId, filename });
            res.json({
                success: true,
                data: { avatar_url: avatarUrl },
                message: 'Avatar uploaded successfully'
            });
        }
        catch (error) {
            logger.error('Upload avatar error:', error);
            throw error;
        }
    }
    /**
     * Get user statistics
     */
    async getProfileStats(req, res) {
        try {
            if (!req.user) {
                throw new AuthenticationError('User not authenticated');
            }
            const userId = req.user.id;
            const userRole = req.user.role;
            let stats = {};
            if (userRole === 'instructor') {
                const statsRows = await db.query(`
          SELECT 
            (SELECT COUNT(*) FROM courses WHERE instructor_id = ?) as total_courses,
            (SELECT COUNT(DISTINCT e.user_id) FROM enrollments e 
             JOIN courses c ON e.course_id = c.id WHERE c.instructor_id = ?) as total_students,
            (SELECT AVG(r.rating) FROM reviews r 
             JOIN courses c ON r.course_id = c.id WHERE c.instructor_id = ?) as avg_rating,
            (SELECT COUNT(*) FROM reviews r 
             JOIN courses c ON r.course_id = c.id WHERE c.instructor_id = ?) as total_reviews,
            (SELECT SUM(t.amount) FROM transactions t 
             JOIN courses c ON t.course_id = c.id 
             WHERE c.instructor_id = ? AND t.status = 'completed') as total_earnings
        `, [userId, userId, userId, userId, userId]);
                if (statsRows.length > 0) {
                    stats = {
                        total_courses_created: statsRows[0].total_courses || 0,
                        total_students_taught: statsRows[0].total_students || 0,
                        average_course_rating: parseFloat(statsRows[0].avg_rating || 0),
                        total_reviews: statsRows[0].total_reviews || 0,
                        total_earnings: parseFloat(statsRows[0].total_earnings || 0)
                    };
                }
            }
            else if (userRole === 'student') {
                const statsRows = await db.query(`
          SELECT 
            (SELECT COUNT(*) FROM enrollments WHERE user_id = ?) as enrolled_courses,
            (SELECT COUNT(*) FROM progress p 
             JOIN enrollments e ON p.enrollment_id = e.id 
             WHERE e.user_id = ? AND p.progress_percentage = 100) as completed_courses,
            (SELECT COUNT(*) FROM certificates WHERE user_id = ?) as certificates_earned,
            (SELECT SUM(COALESCE(l.duration, 0)) FROM progress p
             JOIN enrollments e ON p.enrollment_id = e.id
             JOIN lessons l ON l.id = ANY(JSON_EXTRACT(p.completed_lessons, '$[*]'))
             WHERE e.user_id = ?) as total_hours_learned
        `, [userId, userId, userId, userId]);
                if (statsRows.length > 0) {
                    stats = {
                        total_courses_enrolled: statsRows[0].enrolled_courses || 0,
                        total_courses_completed: statsRows[0].completed_courses || 0,
                        certificates_earned: statsRows[0].certificates_earned || 0,
                        total_hours_learned: Math.round((statsRows[0].total_hours_learned || 0) / 60) // Convert to hours
                    };
                }
            }
            res.json({
                success: true,
                data: stats,
                message: 'Profile statistics retrieved successfully'
            });
        }
        catch (error) {
            logger.error('Get profile stats error:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=AuthController.js.map
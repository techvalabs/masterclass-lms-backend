import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Get user settings
router.get('/settings', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const pool = db.getPool();
    
    if (!pool) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    // Get user profile data
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.bio, u.location, u.website, u.avatar,
        u.notification_preferences, u.privacy_settings, u.appearance_settings
      FROM users u
      WHERE u.id = ?
    `, [userId]);

    if (!users || (users as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = (users as any[])[0];

    // Parse JSON settings
    let notifications = {};
    let privacy = {};
    let appearance = {};

    try {
      notifications = user.notification_preferences ? JSON.parse(user.notification_preferences) : {};
      privacy = user.privacy_settings ? JSON.parse(user.privacy_settings) : {};
      appearance = user.appearance_settings ? JSON.parse(user.appearance_settings) : {};
    } catch (e) {
      // Use defaults if parsing fails
    }

    res.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || '',
          avatar: user.avatar || ''
        },
        settings: {
          notifications: {
            email: notifications.email !== false,
            push: notifications.push !== false,
            sms: notifications.sms || false,
            courseUpdates: notifications.courseUpdates !== false,
            promotionalEmails: notifications.promotionalEmails !== false,
            forumNotifications: notifications.forumNotifications !== false,
            assignmentReminders: notifications.assignmentReminders !== false,
            ...notifications
          },
          privacy: {
            profileVisibility: privacy.profileVisibility || 'public',
            showEmail: privacy.showEmail || false,
            showPhone: privacy.showPhone || false,
            allowMessages: privacy.allowMessages !== false,
            ...privacy
          },
          appearance: {
            theme: appearance.theme || 'light',
            language: appearance.language || 'en',
            timezone: appearance.timezone || 'UTC',
            dateFormat: appearance.dateFormat || 'MM/DD/YYYY',
            ...appearance
          },
          security: {
            twoFactorAuth: false,
            loginAlerts: true,
            sessionTimeout: 30
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Update user settings
router.put('/settings', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { notifications, privacy, appearance, security } = req.body;
    const pool = db.getPool();
    
    if (!pool) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    // Update settings in database
    await pool.execute(`
      UPDATE users 
      SET 
        notification_preferences = ?,
        privacy_settings = ?,
        appearance_settings = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      notifications ? JSON.stringify(notifications) : null,
      privacy ? JSON.stringify(privacy) : null,
      appearance ? JSON.stringify(appearance) : null,
      userId
    ]);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, bio, location, website } = req.body;
    const pool = db.getPool();
    
    if (!pool) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if ((existingUsers as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    // Update profile
    await pool.execute(`
      UPDATE users 
      SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        bio = ?,
        location = ?,
        website = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [name, email, phone, bio || null, location || null, website || null, userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const filename = `avatar_${userId}_${Date.now()}.jpg`;
    const filepath = path.join(uploadDir, filename);

    // Process and save image from disk file
    // The file is already saved by multer diskStorage at file.path
    await sharp(file.path)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);
    
    // Delete the original uploaded file after processing
    await fs.unlink(file.path);

    // Update user avatar in database
    const avatarUrl = `/uploads/avatars/${filename}`;
    const pool = db.getPool();
    
    if (!pool) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    await pool.execute(
      'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?',
      [avatarUrl, userId]
    );

    res.json({
      success: true,
      data: {
        avatarUrl
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
});

// Change password
router.post('/change-password', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const pool = db.getPool();
    
    if (!pool) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user's current password hash
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = (users as any[])[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

export default router;
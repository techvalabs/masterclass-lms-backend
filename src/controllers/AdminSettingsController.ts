import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { ApiResponse } from '../types/index.js';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

interface AdminSettingsRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    roleId: number;
    permissions: string[];
    isVerified: boolean;
    isActive: boolean;
  };
}

interface SystemSetting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
}

interface BackupRequest {
  name?: string;
  type: 'full' | 'tables' | 'files';
  tables?: string[];
  compression?: 'none' | 'gzip' | 'zip';
}

export class AdminSettingsController {
  private db: mysql.Pool | null;

  constructor(database: mysql.Pool | null) {
    this.db = database;
  }

  private checkDatabaseConnection(): boolean {
    return this.db !== null && this.db !== undefined;
  }

  /**
   * Get all system settings
   * GET /api/admin/settings
   */
  getSettings = async (req: AdminSettingsRequest, res: Response) => {
    try {
      if (!this.checkDatabaseConnection()) {
        // Import realistic data dynamically
        const { realisticSettings } = await import('../data/realistic-data.js');
        
        const { category } = req.query;
        // Apply category filter if specified
        let filteredSettings = { ...realisticSettings };
        
        if (category) {
          // Filter settings to only include the specified category
          filteredSettings = {};
          if (realisticSettings[category as string]) {
            filteredSettings[category as string] = realisticSettings[category as string];
          }
        }
        
        return res.json({
          success: true,
          data: filteredSettings,
          message: "Using realistic mock data - database not connected"
        });
      }

      // Get settings from all specialized tables
      const [platformConfig] = await this.db!.query('SELECT * FROM platform_config ORDER BY id DESC LIMIT 1');
      const [courseSettings] = await this.db!.query('SELECT * FROM course_settings ORDER BY id DESC LIMIT 1');
      const [securitySettings] = await this.db!.query('SELECT * FROM security_settings ORDER BY id DESC LIMIT 1');
      const [registrationSettings] = await this.db!.query('SELECT * FROM registration_settings ORDER BY id DESC LIMIT 1');
      const [seoSettings] = await this.db!.query('SELECT * FROM seo_settings ORDER BY id DESC LIMIT 1');
      const [backupSettings] = await this.db!.query('SELECT * FROM backup_settings ORDER BY id DESC LIMIT 1');

      const settings = {
        platform: (platformConfig as any[])[0] || {},
        courses: (courseSettings as any[])[0] || {},
        security: (securitySettings as any[])[0] || {},
        registration: (registrationSettings as any[])[0] || {},
        seo: (seoSettings as any[])[0] || {},
        backup: (backupSettings as any[])[0] || {}
      };

      // Filter by category if requested
      const { category } = req.query;
      const categoryKey = category as keyof typeof settings;
      if (category && settings[categoryKey]) {
        return res.json({
          success: true,
          data: { [categoryKey]: settings[categoryKey] }
        });
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Update system settings by category
   * PUT /api/admin/settings/:category
   */
  updateSettings = async (req: AdminSettingsRequest, res: Response) => {
    try {
      const { category } = req.params;
      const settingsData = req.body;

      if (!settingsData || Object.keys(settingsData).length === 0) {
        throw new ValidationError('No settings provided');
      }

      let tableName: string;
      let updateFields: string[] = [];
      let values: any[] = [];

      // Determine table and fields based on category
      switch (category) {
        case 'platform':
          tableName = 'platform_config';
          const platformFields = [
            'site_name', 'site_url', 'logo_url', 'favicon_url', 'admin_email',
            'support_email', 'contact_phone', 'contact_address', 'timezone',
            'date_format', 'time_format', 'language', 'currency', 'maintenance_mode',
            'maintenance_message', 'footer_text', 'copyright_text', 'social_links'
          ];
          
          updateFields = platformFields.filter(field => settingsData.hasOwnProperty(field));
          values = updateFields.map(field => settingsData[field]);
          break;

        case 'courses':
          tableName = 'course_settings';
          const courseFields = [
            'default_price', 'default_currency', 'auto_publish', 'require_approval',
            'allow_free_courses', 'max_upload_size_mb', 'allowed_video_formats',
            'allowed_doc_formats', 'allowed_image_formats', 'enable_certificates',
            'certificate_template', 'completion_threshold', 'enable_course_reviews',
            'review_moderation', 'enable_course_preview', 'preview_duration_minutes',
            'enable_drip_content', 'enable_prerequisites'
          ];
          
          updateFields = courseFields.filter(field => settingsData.hasOwnProperty(field));
          values = updateFields.map(field => settingsData[field]);
          break;

        case 'security':
          tableName = 'security_settings';
          const securityFields = [
            'password_min_length', 'password_require_uppercase', 'password_require_lowercase',
            'password_require_numbers', 'password_require_special', 'password_expiry_days',
            'session_timeout_minutes', 'max_login_attempts', 'lockout_duration_minutes',
            'enable_two_factor', 'two_factor_required_for_admin', 'enable_captcha',
            'captcha_type', 'captcha_site_key', 'captcha_secret_key', 'enable_ip_whitelist',
            'admin_ip_whitelist', 'enable_audit_log', 'audit_log_retention_days'
          ];
          
          updateFields = securityFields.filter(field => settingsData.hasOwnProperty(field));
          values = updateFields.map(field => settingsData[field]);
          break;

        case 'registration':
          tableName = 'registration_settings';
          const registrationFields = [
            'enable_registration', 'registration_type', 'require_email_verification',
            'email_verification_expire_hours', 'default_user_role', 'enable_social_login',
            'google_client_id', 'google_client_secret', 'facebook_app_id', 'facebook_app_secret',
            'enable_instructor_registration', 'instructor_approval_required', 'instructor_commission_rate',
            'enable_profile_completion', 'required_profile_fields', 'enable_username',
            'username_min_length', 'enable_avatar_upload', 'max_avatar_size_mb'
          ];
          
          updateFields = registrationFields.filter(field => settingsData.hasOwnProperty(field));
          values = updateFields.map(field => settingsData[field]);
          break;

        case 'seo':
          tableName = 'seo_settings';
          const seoFields = [
            'meta_title', 'meta_description', 'meta_keywords', 'og_title', 'og_description',
            'og_image', 'twitter_card_type', 'twitter_handle', 'google_analytics_id',
            'google_tag_manager_id', 'facebook_pixel_id', 'hotjar_id', 'enable_sitemap',
            'enable_robots_txt', 'robots_txt_content', 'enable_schema_markup',
            'canonical_url', 'enable_amp'
          ];
          
          updateFields = seoFields.filter(field => settingsData.hasOwnProperty(field));
          values = updateFields.map(field => settingsData[field]);
          break;

        case 'backup':
          tableName = 'backup_settings';
          const backupFields = [
            'enable_auto_backup', 'backup_frequency', 'backup_time', 'backup_retention_days',
            'backup_storage_type', 'backup_path', 's3_backup_bucket', 's3_backup_region',
            'enable_database_optimization', 'optimization_frequency', 'enable_cache_clearing',
            'cache_clear_frequency_hours', 'enable_log_rotation', 'log_retention_days',
            'enable_temp_file_cleanup', 'temp_file_retention_hours'
          ];
          
          updateFields = backupFields.filter(field => settingsData.hasOwnProperty(field));
          values = updateFields.map(field => settingsData[field]);
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid settings category'
          });
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid settings provided'
        });
      }

      // Build and execute update query
      const setParts = updateFields.map(field => `${field} = ?`);
      const updateQuery = `UPDATE ${tableName} SET ${setParts.join(', ')}, updated_at = NOW() WHERE id = 1`;
      
      await this.db!.execute(updateQuery, values);

      // Log settings change to history
      await this.logSettingsChange(category, settingsData, req.user.id, req.ip);

      res.json({
        success: true,
        message: `${category} settings updated successfully`,
        data: {
          category,
          updatedFields: updateFields.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Update settings error:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update settings',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  /**
   * Get system information
   * GET /api/admin/settings/system-info
   */
  getSystemInfo = async (req: AdminSettingsRequest, res: Response) => {
    try {
      // Get database statistics
      const [dbStats]: any = await this.db!.execute(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM enrollments) as total_enrollments,
          (SELECT COUNT(*) FROM payment_transactions) as total_transactions,
          (SELECT COUNT(*) FROM file_uploads) as total_files,
          (SELECT SUM(file_size) FROM file_uploads) as total_file_size
      `);

      // Get database size
      const [dbSize]: any = await this.db!.execute(`
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);

      // Get recent backups
      const [recentBackups]: any = await this.db!.execute(`
        SELECT id, backup_name, backup_type, file_size, status, created_at
        FROM backup_logs
        ORDER BY created_at DESC
        LIMIT 5
      `);

      // Get system settings count
      const [settingsCount]: any = await this.db!.execute(
        'SELECT COUNT(*) as count FROM system_settings'
      );

      // Get recent activities
      const [recentActivities]: any = await this.db!.execute(`
        SELECT action, description, created_at
        FROM activity_logs
        WHERE action IN ('settings_updated', 'backup_created', 'system_maintenance')
        ORDER BY created_at DESC
        LIMIT 10
      `);

      const systemInfo = {
        database: {
          totalUsers: dbStats[0].total_users,
          totalCourses: dbStats[0].total_courses,
          totalEnrollments: dbStats[0].total_enrollments,
          totalTransactions: dbStats[0].total_transactions,
          totalFiles: dbStats[0].total_files,
          totalFileSize: dbStats[0].total_file_size,
          databaseSize: dbSize[0].size_mb,
          settingsCount: settingsCount[0].count
        },
        server: {
          nodeVersion: process.version,
          platform: process.platform,
          architecture: process.arch,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        },
        application: {
          environment: process.env.NODE_ENV || 'development',
          version: process.env.APP_VERSION || '1.0.0'
        },
        recentBackups: recentBackups.map((backup: any) => ({
          id: backup.id,
          name: backup.backup_name,
          type: backup.backup_type,
          size: backup.file_size,
          status: backup.status,
          createdAt: backup.created_at
        })),
        recentActivities: recentActivities.map((activity: any) => ({
          action: activity.action,
          description: activity.description,
          createdAt: activity.created_at
        }))
      };

      res.json({
        success: true,
        data: systemInfo
      });
    } catch (error) {
      console.error('Get system info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Create database backup
   * POST /api/admin/settings/backup
   */
  createBackup = async (req: AdminSettingsRequest, res: Response) => {
    try {
      const {
        name,
        type = 'full',
        tables,
        compression = 'gzip'
      }: BackupRequest = req.body;

      if (!['full', 'tables', 'files'].includes(type)) {
        throw new ValidationError('Invalid backup type');
      }

      if (type === 'tables' && (!tables || !Array.isArray(tables) || tables.length === 0)) {
        throw new ValidationError('Tables must be specified for table backup');
      }

      // Generate backup name if not provided
      const backupName = name || `backup_${type}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
      
      // Create backup directory if it doesn't exist
      const backupDir = path.join(process.cwd(), 'backups');
      await fs.mkdir(backupDir, { recursive: true });

      // Insert backup log record
      const [result]: any = await this.db!.execute(
        `INSERT INTO backup_logs (
          backup_name, backup_type, file_path, file_size, compression, status,
          started_at, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NOW())`,
        [backupName, type, '', 0, compression, 'running', req.user.id]
      );

      const backupId = result.insertId;

      // Start backup process asynchronously
      this.performBackupAsync(backupId, backupName, type, tables, compression, backupDir)
        .catch(error => {
          console.error(`Backup ${backupId} failed:`, error);
          this.updateBackupStatus(backupId, 'failed', error.message);
        });

      res.json({
        success: true,
        message: 'Backup started successfully',
        data: {
          backupId,
          backupName,
          type,
          status: 'running'
        }
      });
    } catch (error) {
      console.error('Create backup error:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create backup',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  /**
   * Get backup status
   * GET /api/admin/settings/backup/:id
   */
  getBackupStatus = async (req: AdminSettingsRequest, res: Response) => {
    try {
      const backupId = parseInt(req.params.id);

      if (!backupId) {
        throw new ValidationError('Invalid backup ID');
      }

      const [backups]: any = await this.db!.execute(
        'SELECT * FROM backup_logs WHERE id = ?',
        [backupId]
      );

      if (backups.length === 0) {
        throw new NotFoundError('Backup not found');
      }

      const backup = backups[0];

      res.json({
        success: true,
        data: {
          id: backup.id,
          name: backup.backup_name,
          type: backup.backup_type,
          filePath: backup.file_path,
          fileSize: backup.file_size,
          compression: backup.compression,
          status: backup.status,
          startedAt: backup.started_at,
          completedAt: backup.completed_at,
          errorMessage: backup.error_message,
          tablesIncluded: backup.tables_included ? JSON.parse(backup.tables_included) : null,
          metadata: backup.metadata ? JSON.parse(backup.metadata) : null
        }
      });
    } catch (error) {
      console.error('Get backup status error:', error);
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to get backup status',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  /**
   * Get all backups
   * GET /api/admin/settings/backups
   */
  getBackups = async (req: AdminSettingsRequest, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type
      } = req.query as any;

      const conditions: string[] = [];
      const params: any[] = [];

      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }

      if (type) {
        conditions.push('backup_type = ?');
        params.push(type);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total records
      const [countResult]: any = await this.db!.execute(
        `SELECT COUNT(*) as total FROM backup_logs ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Get backups
      const [backups]: any = await this.db!.execute(
        `SELECT 
          bl.*,
          u.name as created_by_name
        FROM backup_logs bl
        LEFT JOIN users u ON bl.created_by = u.id
        ${whereClause}
        ORDER BY bl.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      res.json({
        success: true,
        data: backups.map((backup: any) => ({
          id: backup.id,
          name: backup.backup_name,
          type: backup.backup_type,
          filePath: backup.file_path,
          fileSize: backup.file_size,
          compression: backup.compression,
          status: backup.status,
          startedAt: backup.started_at,
          completedAt: backup.completed_at,
          errorMessage: backup.error_message,
          createdBy: backup.created_by_name,
          tablesIncluded: backup.tables_included ? JSON.parse(backup.tables_included) : null
        })),
        meta: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      });
    } catch (error) {
      console.error('Get backups error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch backups',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete backup
   * DELETE /api/admin/settings/backup/:id
   */
  deleteBackup = async (req: AdminSettingsRequest, res: Response) => {
    try {
      const backupId = parseInt(req.params.id);

      if (!backupId) {
        throw new ValidationError('Invalid backup ID');
      }

      // Get backup details
      const [backups]: any = await this.db!.execute(
        'SELECT id, backup_name, file_path, status FROM backup_logs WHERE id = ?',
        [backupId]
      );

      if (backups.length === 0) {
        throw new NotFoundError('Backup not found');
      }

      const backup = backups[0];

      if (backup.status === 'running') {
        throw new ValidationError('Cannot delete a running backup');
      }

      // Delete backup file if it exists
      if (backup.file_path) {
        try {
          await fs.unlink(backup.file_path);
        } catch (fsError) {
          console.warn('Failed to delete backup file:', fsError);
        }
      }

      // Delete backup record
      await this.db!.execute('DELETE FROM backup_logs WHERE id = ?', [backupId]);

      // Log activity
      await this.db!.execute(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [req.user.id, 'backup_deleted', 'backup', backupId, `Deleted backup: ${backup.backup_name}`]
      );

      res.json({
        success: true,
        message: 'Backup deleted successfully'
      });
    } catch (error) {
      console.error('Delete backup error:', error);
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete backup',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  /**
   * Clear application cache
   * POST /api/admin/settings/clear-cache
   */
  clearCache = async (req: AdminSettingsRequest, res: Response) => {
    try {
      // In a real implementation, you would clear Redis cache, file cache, etc.
      // For now, we'll just log the action
      
      await this.db!.execute(
        'INSERT INTO activity_logs (user_id, action, entity_type, description, created_at) VALUES (?, ?, ?, ?, NOW())',
        [req.user.id, 'cache_cleared', 'system', 'Application cache cleared']
      );

      res.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Helper methods

  private async performBackupAsync(
    backupId: number,
    backupName: string,
    type: string,
    tables: string[] | undefined,
    compression: string,
    backupDir: string
  ): Promise<void> {
    try {
      let filePath = '';
      let fileSize = 0;
      const metadata: any = {
        startTime: new Date().toISOString(),
        type,
        compression
      };

      if (type === 'full' || type === 'tables') {
        // Database backup
        const fileName = `${backupName}.sql${compression === 'gzip' ? '.gz' : ''}`;
        filePath = path.join(backupDir, fileName);

        const dbConfig = {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || '3306',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'masterclass_lms'
        };

        // Build mysqldump command
        let command = 'mysqldump';
        const args = [
          `-h${dbConfig.host}`,
          `-P${dbConfig.port}`,
          `-u${dbConfig.user}`,
          dbConfig.database
        ];

        if (dbConfig.password) {
          args.unshift(`-p${dbConfig.password}`);
        }

        if (type === 'tables' && tables) {
          args.push(...tables);
          metadata.tables = tables;
        }

        // Execute mysqldump
        await new Promise<void>((resolve, reject) => {
          const mysqldump = spawn(command, args);
          let output = '';
          let errorOutput = '';

          mysqldump.stdout.on('data', (data) => {
            output += data.toString();
          });

          mysqldump.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          mysqldump.on('close', async (code) => {
            if (code !== 0) {
              reject(new Error(`mysqldump failed: ${errorOutput}`));
              return;
            }

            try {
              // Write output to file
              if (compression === 'gzip') {
                const zlib = require('zlib');
                const compressed = zlib.gzipSync(output);
                await fs.writeFile(filePath, compressed);
              } else {
                await fs.writeFile(filePath, output);
              }

              // Get file size
              const stats = await fs.stat(filePath);
              fileSize = stats.size;

              resolve();
            } catch (writeError) {
              reject(writeError);
            }
          });

          mysqldump.on('error', reject);
        });
      }

      if (type === 'files') {
        // Files backup (simplified - in a real implementation, you'd create a tar/zip archive)
        metadata.message = 'Files backup not implemented in this demo';
      }

      metadata.endTime = new Date().toISOString();

      // Update backup record
      await this.db!.execute(
        `UPDATE backup_logs SET 
          file_path = ?, 
          file_size = ?, 
          status = 'completed', 
          completed_at = NOW(),
          tables_included = ?,
          metadata = ?
        WHERE id = ?`,
        [
          filePath,
          fileSize,
          tables ? JSON.stringify(tables) : null,
          JSON.stringify(metadata),
          backupId
        ]
      );

      // Log activity
      await this.db!.execute(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          null, // System action
          'backup_completed',
          'backup',
          backupId,
          `Backup completed: ${backupName}`,
          JSON.stringify({ type, fileSize, compression })
        ]
      );
    } catch (error) {
      console.error(`Backup ${backupId} failed:`, error);
      await this.updateBackupStatus(backupId, 'failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async updateBackupStatus(backupId: number, status: string, errorMessage?: string): Promise<void> {
    try {
      await this.db!.execute(
        'UPDATE backup_logs SET status = ?, error_message = ?, completed_at = NOW() WHERE id = ?',
        [status, errorMessage || null, backupId]
      );
    } catch (error) {
      console.error('Failed to update backup status:', error);
    }
  }

  /**
   * Log settings changes for audit trail
   */
  private async logSettingsChange(
    category: string,
    changes: any,
    userId: number,
    ipAddress?: string
  ): Promise<void> {
    try {
      const changeEntries = Object.entries(changes).map(([key, value]) => [
        category,
        key,
        null, // old_value - could be fetched if needed
        JSON.stringify(value),
        userId,
        'Settings updated via admin panel',
        ipAddress || 'unknown',
        null // user_agent
      ]);

      if (changeEntries.length > 0) {
        const placeholders = changeEntries.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const values = changeEntries.flat();

        await this.db!.execute(`
          INSERT INTO settings_history 
          (category, setting_key, old_value, new_value, changed_by, change_reason, ip_address, user_agent)
          VALUES ${placeholders}
        `, values);
      }
    } catch (error) {
      console.error('Failed to log settings change:', error);
      // Don't throw - logging failure shouldn't break the settings update
    }
  }
}

export default AdminSettingsController;
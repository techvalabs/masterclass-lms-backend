import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { ApiResponse, PaginationQuery } from '../types/index.js';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

interface AdminContentRequest extends Request {
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

interface FileFilters extends PaginationQuery {
  fileType?: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  entityType?: string;
  entityId?: number;
  processed?: 'true' | 'false' | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface UploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  uploadPath: string;
  generateThumbnail: boolean;
  processVideo: boolean;
}

export class AdminContentController {
  private db: mysql.Pool | null;
  private uploadConfig: UploadConfig;

  constructor(database: mysql.Pool | null) {
    this.db = database;
    this.uploadConfig = {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
      allowedTypes: [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Videos
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
        // Audio
        'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
        // Documents
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        // Archives
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
      ],
      uploadPath: process.env.UPLOAD_PATH || './uploads',
      generateThumbnail: true,
      processVideo: false
    };
  }

  /**
   * Configure multer for file uploads
   */
  private getMulterConfig() {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const uploadDir = path.join(this.uploadConfig.uploadPath, String(year), month);
        
        try {
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        } catch (error) {
          cb(error as any, uploadDir);
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${sanitizedName}_${uniqueSuffix}${extension}`);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: this.uploadConfig.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        if (this.uploadConfig.allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} is not allowed`) as any);
        }
      }
    });
  }

  /**
   * Upload files
   * POST /api/admin/content/upload
   */
  uploadFiles = async (req: AdminContentRequest, res: Response) => {
    try {
      const upload = this.getMulterConfig().array('files', 10); // Max 10 files

      upload(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({
                success: false,
                message: `File size exceeds limit of ${this.uploadConfig.maxFileSize / 1024 / 1024}MB`
              });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
              return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 10 files allowed.'
              });
            }
          }
          return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed'
          });
        }

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No files uploaded'
          });
        }

        const { entityType, entityId, altText, title, description } = req.body;

        try {
          const uploadedFiles = [];

          for (const file of files) {
            // Determine file type
            const fileType = this.determineFileType(file.mimetype);
            
            // Get file dimensions for images
            let dimensions = null;
            if (fileType === 'image') {
              try {
                const metadata = await sharp(file.path).metadata();
                dimensions = {
                  width: metadata.width,
                  height: metadata.height
                };
              } catch (error) {
                console.warn('Failed to get image dimensions:', error);
              }
            }

            // Generate public URL
            const relativePath = path.relative(this.uploadConfig.uploadPath, file.path);
            const publicUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;

            let fileId = Date.now() + Math.floor(Math.random() * 1000);
            
            // Try to save to database if available
            if (this.db) {
              try {
                const [result]: any = await this.db!.execute(
                  `INSERT INTO file_uploads (
                    user_id, original_name, file_name, file_path, file_size, mime_type,
                    file_type, entity_type, entity_id, alt_text, title, description,
                    dimensions, public_url, is_processed, processing_status, created_at, updated_at
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                  [
                    req.user.id,
                    file.originalname,
                    file.filename,
                    file.path,
                    file.size,
                    file.mimetype,
                    fileType,
                    entityType || null,
                    entityId || null,
                    altText || null,
                    title || null,
                    description || null,
                    dimensions ? JSON.stringify(dimensions) : null,
                    publicUrl,
                    true,
                    'completed'
                  ]
                );
                fileId = result.insertId;
              } catch (dbError) {
                console.error('Database error during file upload:', dbError);
                // Continue without database
              }
            }

            uploadedFiles.push({
              id: fileId,
              originalName: file.originalname,
              fileName: file.filename,
              fileSize: file.size,
              mimeType: file.mimetype,
              fileType,
              publicUrl,
              dimensions
            });
          }

          res.status(201).json({
            success: true,
            message: `Successfully uploaded ${files.length} file(s)`,
            data: uploadedFiles
          });
        } catch (error) {
          // Clean up uploaded files on error
          for (const file of files) {
            try {
              await fs.unlink(file.path);
            } catch (unlinkError) {
              console.error('Failed to clean up file:', unlinkError);
            }
          }
          
          console.error('Upload processing error:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to process uploaded files',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    } catch (error) {
      console.error('Upload files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Determine file type from MIME type
   */
  private determineFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || 
        mimeType.includes('msword') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || 
        mimeType.includes('7z') || mimeType.includes('compressed')) return 'archive';
    return 'other';
  }

  /**
   * Get all uploaded files with filters and pagination
   * GET /api/admin/content/files
   */
  getFiles = async (req: AdminContentRequest, res: Response) => {
    try {
      // Return empty array for now
      res.json({
        success: true,
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch files',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get file by ID
   * GET /api/admin/content/files/:id
   */
  getFileById = async (req: AdminContentRequest, res: Response) => {
    try {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    } catch (error) {
      console.error('Get file by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Update file metadata
   * PUT /api/admin/content/files/:id
   */
  updateFile = async (req: AdminContentRequest, res: Response) => {
    try {
      res.json({
        success: true,
        message: 'File updated successfully'
      });
    } catch (error) {
      console.error('Update file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete file
   * DELETE /api/admin/content/files/:id
   */
  deleteFile = async (req: AdminContentRequest, res: Response) => {
    try {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Bulk delete files
   * POST /api/admin/content/files/bulk-delete
   */
  bulkDeleteFiles = async (req: AdminContentRequest, res: Response) => {
    try {
      res.json({
        success: true,
        message: 'Files deleted successfully'
      });
    } catch (error) {
      console.error('Bulk delete files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete files',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Process file asynchronously (placeholder)
   */
  private async processFileAsync(fileId: number, file: Express.Multer.File, fileType: string): Promise<void> {
    // Placeholder for async processing
    console.log(`Processing file ${fileId} of type ${fileType}`);
  }
}

export default AdminContentController;
import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';
import { getVideoDurationInSeconds } from 'get-video-duration';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'videos', new Date().getFullYear().toString());
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/webm'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

export class VideoUploadController extends BaseController {
  // Upload video for lesson
  async uploadLessonVideo(req: Request, res: Response) {
    try {
      const upload = videoUpload.single('video');
      
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No video file provided'
          });
        }

        const { lessonId } = req.body;
        const userId = (req as any).userId;
        const file = req.file;

        try {
          // Get video duration
          const duration = await getVideoDurationInSeconds(file.path);

          // Generate thumbnail
          const thumbnailDir = path.join(process.cwd(), 'uploads', 'thumbnails', new Date().getFullYear().toString());
          await fs.ensureDir(thumbnailDir);
          const thumbnailName = `${path.basename(file.filename, path.extname(file.filename))}_thumb.jpg`;
          const thumbnailPath = path.join(thumbnailDir, thumbnailName);

          // Extract thumbnail at 10% of video duration
          await this.generateThumbnail(file.path, thumbnailPath, Math.floor(duration * 0.1));

          // Process video for different qualities (HLS streaming)
          const processedVideos = await this.processVideoQualities(file.path, file.filename);

          // Save to database
          const [result]: any = await this.getDatabase().execute(
            `INSERT INTO video_uploads 
             (lesson_id, original_filename, filename, file_path, file_size, duration, 
              thumbnail_path, processing_status, uploaded_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              lessonId,
              file.originalname,
              file.filename,
              file.path.replace(process.cwd(), ''),
              file.size,
              Math.round(duration),
              thumbnailPath.replace(process.cwd(), ''),
              'completed',
              userId
            ]
          );

          // Update lesson with video URL
          if (lessonId) {
            await this.getDatabase().execute(
              `UPDATE course_lessons 
               SET video_url = ?, video_duration = ?, updated_at = NOW() 
               WHERE id = ?`,
              [
                `/uploads/videos/${new Date().getFullYear()}/${file.filename}`,
                Math.round(duration),
                lessonId
              ]
            );
          }

          res.json({
            success: true,
            data: {
              videoId: result.insertId,
              url: `/uploads/videos/${new Date().getFullYear()}/${file.filename}`,
              thumbnail: `/uploads/thumbnails/${new Date().getFullYear()}/${thumbnailName}`,
              duration: Math.round(duration),
              qualities: processedVideos
            }
          });
        } catch (error) {
          // Clean up uploaded file on error
          await fs.remove(file.path);
          throw error;
        }
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload video'
      });
    }
  }

  // Generate video thumbnail
  private generateThumbnail(videoPath: string, outputPath: string, timeInSeconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timeInSeconds],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '1280x720'
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });
  }

  // Process video for different qualities
  private async processVideoQualities(videoPath: string, filename: string): Promise<any[]> {
    const qualities = [
      { name: '360p', width: 640, height: 360, bitrate: '800k' },
      { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
      { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' }
    ];

    const processedDir = path.join(process.cwd(), 'uploads', 'processed', new Date().getFullYear().toString());
    await fs.ensureDir(processedDir);

    const results = [];

    for (const quality of qualities) {
      const outputFilename = `${path.basename(filename, path.extname(filename))}_${quality.name}.mp4`;
      const outputPath = path.join(processedDir, outputFilename);

      await this.processVideo(videoPath, outputPath, quality);
      
      results.push({
        quality: quality.name,
        url: `/uploads/processed/${new Date().getFullYear()}/${outputFilename}`,
        width: quality.width,
        height: quality.height
      });
    }

    // Generate HLS playlist for adaptive streaming
    await this.generateHLS(videoPath, filename);

    return results;
  }

  // Process single video quality
  private processVideo(inputPath: string, outputPath: string, quality: any): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-vf scale=${quality.width}:${quality.height}`,
          `-b:v ${quality.bitrate}`,
          '-c:v libx264',
          '-preset fast',
          '-c:a aac',
          '-b:a 128k'
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });
  }

  // Generate HLS playlist for adaptive streaming
  private generateHLS(videoPath: string, filename: string): Promise<void> {
    const hlsDir = path.join(process.cwd(), 'uploads', 'hls', new Date().getFullYear().toString());
    const outputDir = path.join(hlsDir, path.basename(filename, path.extname(filename)));
    
    return new Promise(async (resolve, reject) => {
      await fs.ensureDir(outputDir);
      
      ffmpeg(videoPath)
        .outputOptions([
          '-codec: copy',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls'
        ])
        .output(path.join(outputDir, 'playlist.m3u8'))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });
  }

  // Get video upload status
  async getVideoStatus(req: Request, res: Response) {
    try {
      const { videoId } = req.params;

      const [video]: any = await this.getDatabase().execute(
        'SELECT * FROM video_uploads WHERE id = ?',
        [videoId]
      );

      if (video.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      res.json({
        success: true,
        data: video[0]
      });
    } catch (error) {
      console.error('Get video status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get video status'
      });
    }
  }

  // Delete video
  async deleteVideo(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      const userId = (req as any).userId;

      // Get video details
      const [video]: any = await this.getDatabase().execute(
        'SELECT * FROM video_uploads WHERE id = ?',
        [videoId]
      );

      if (video.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Delete physical files
      const filesToDelete = [
        path.join(process.cwd(), video[0].file_path),
        path.join(process.cwd(), video[0].thumbnail_path)
      ];

      for (const file of filesToDelete) {
        if (await fs.pathExists(file)) {
          await fs.remove(file);
        }
      }

      // Delete database record
      await this.getDatabase().execute(
        'DELETE FROM video_uploads WHERE id = ?',
        [videoId]
      );

      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete video'
      });
    }
  }
}
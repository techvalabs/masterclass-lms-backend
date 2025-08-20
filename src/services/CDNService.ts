import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';

interface CDNConfig {
  provider: 'cloudflare' | 'cloudfront' | 'bunny' | 'local';
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  distributionId?: string;
  cdnBaseUrl?: string;
}

export class CDNService {
  private static instance: CDNService;
  private s3Client: S3Client | null = null;
  private cloudFrontClient: CloudFrontClient | null = null;
  private config: CDNConfig;

  private constructor() {
    this.config = {
      provider: (process.env.CDN_PROVIDER as CDNConfig['provider']) || 'local',
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      cdnBaseUrl: process.env.CDN_BASE_URL || 'http://localhost:3002'
    };

    this.initializeClients();
  }

  public static getInstance(): CDNService {
    if (!CDNService.instance) {
      CDNService.instance = new CDNService();
    }
    return CDNService.instance;
  }

  private initializeClients(): void {
    if (this.config.provider === 'cloudfront' && this.config.accessKeyId) {
      this.s3Client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId!,
          secretAccessKey: this.config.secretAccessKey!
        }
      });

      this.cloudFrontClient = new CloudFrontClient({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId!,
          secretAccessKey: this.config.secretAccessKey!
        }
      });
    }
  }

  // Upload file to CDN
  async uploadFile(filePath: string, key: string, contentType: string): Promise<string> {
    switch (this.config.provider) {
      case 'cloudfront':
        return this.uploadToS3(filePath, key, contentType);
      case 'cloudflare':
        return this.uploadToCloudflare(filePath, key, contentType);
      case 'bunny':
        return this.uploadToBunny(filePath, key, contentType);
      default:
        return this.handleLocalStorage(filePath, key);
    }
  }

  // Upload to S3 (for CloudFront)
  private async uploadToS3(filePath: string, key: string, contentType: string): Promise<string> {
    if (!this.s3Client || !this.config.bucket) {
      throw new Error('S3 client not configured');
    }

    try {
      const fileStream = fs.createReadStream(filePath);
      const uploadParams = {
        Bucket: this.config.bucket,
        Key: key,
        Body: fileStream,
        ContentType: contentType,
        CacheControl: 'max-age=31536000', // 1 year cache
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));
      
      // Invalidate CloudFront cache if needed
      if (this.cloudFrontClient && this.config.distributionId) {
        await this.invalidateCache([`/${key}`]);
      }

      return `${this.config.cdnBaseUrl}/${key}`;
    } catch (error) {
      logger.error('S3 upload error:', error);
      throw error;
    }
  }

  // Upload to Cloudflare (R2 or Stream)
  private async uploadToCloudflare(filePath: string, key: string, contentType: string): Promise<string> {
    // Cloudflare R2 is S3-compatible, so we can use the same S3 client
    // For Cloudflare Stream (video), we'd use their specific API
    
    if (contentType.startsWith('video/')) {
      // Use Cloudflare Stream for videos
      return this.uploadToCloudflareStream(filePath, key);
    } else {
      // Use R2 for other files
      return this.uploadToS3(filePath, key, contentType);
    }
  }

  // Upload video to Cloudflare Stream
  private async uploadToCloudflareStream(filePath: string, key: string): Promise<string> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const authToken = process.env.CLOUDFLARE_AUTH_TOKEN;
    
    if (!accountId || !authToken) {
      throw new Error('Cloudflare Stream not configured');
    }

    try {
      const formData = new FormData();
      const fileBuffer = await fs.readFile(filePath);
      formData.append('file', new Blob([fileBuffer]));
      
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        }
      );

      const data: any = await response.json();
      if (data.success) {
        return data.result.playback.hls; // Return HLS URL
      } else {
        throw new Error('Cloudflare Stream upload failed');
      }
    } catch (error) {
      logger.error('Cloudflare Stream upload error:', error);
      throw error;
    }
  }

  // Upload to Bunny CDN
  private async uploadToBunny(filePath: string, key: string, contentType: string): Promise<string> {
    const storageZone = process.env.BUNNY_STORAGE_ZONE;
    const apiKey = process.env.BUNNY_API_KEY;
    const cdnUrl = process.env.BUNNY_CDN_URL;
    
    if (!storageZone || !apiKey || !cdnUrl) {
      throw new Error('Bunny CDN not configured');
    }

    try {
      const fileBuffer = await fs.readFile(filePath);
      
      const response = await fetch(
        `https://storage.bunnycdn.com/${storageZone}/${key}`,
        {
          method: 'PUT',
          headers: {
            'AccessKey': apiKey,
            'Content-Type': contentType
          },
          body: fileBuffer
        }
      );

      if (response.ok) {
        return `${cdnUrl}/${key}`;
      } else {
        throw new Error('Bunny CDN upload failed');
      }
    } catch (error) {
      logger.error('Bunny CDN upload error:', error);
      throw error;
    }
  }

  // Handle local storage (development)
  private async handleLocalStorage(filePath: string, key: string): Promise<string> {
    const destinationDir = path.join(process.cwd(), 'uploads', 'cdn');
    const destinationPath = path.join(destinationDir, key);
    
    await fs.ensureDir(path.dirname(destinationPath));
    await fs.copy(filePath, destinationPath);
    
    return `/uploads/cdn/${key}`;
  }

  // Generate signed URL for private content
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.provider === 'local') {
      return `${this.config.cdnBaseUrl}/uploads/cdn/${key}`;
    }

    if (!this.s3Client || !this.config.bucket) {
      throw new Error('S3 client not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  // Delete file from CDN
  async deleteFile(key: string): Promise<void> {
    switch (this.config.provider) {
      case 'cloudfront':
        await this.deleteFromS3(key);
        break;
      case 'cloudflare':
        await this.deleteFromCloudflare(key);
        break;
      case 'bunny':
        await this.deleteFromBunny(key);
        break;
      default:
        await this.deleteFromLocal(key);
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client || !this.config.bucket) return;

    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      }));
      
      // Invalidate CloudFront cache
      if (this.cloudFrontClient && this.config.distributionId) {
        await this.invalidateCache([`/${key}`]);
      }
    } catch (error) {
      logger.error('S3 delete error:', error);
    }
  }

  private async deleteFromCloudflare(key: string): Promise<void> {
    // Implementation for Cloudflare deletion
  }

  private async deleteFromBunny(key: string): Promise<void> {
    const storageZone = process.env.BUNNY_STORAGE_ZONE;
    const apiKey = process.env.BUNNY_API_KEY;
    
    if (!storageZone || !apiKey) return;

    try {
      await fetch(
        `https://storage.bunnycdn.com/${storageZone}/${key}`,
        {
          method: 'DELETE',
          headers: {
            'AccessKey': apiKey
          }
        }
      );
    } catch (error) {
      logger.error('Bunny CDN delete error:', error);
    }
  }

  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'uploads', 'cdn', key);
    await fs.remove(filePath);
  }

  // Invalidate CDN cache
  async invalidateCache(paths: string[]): Promise<void> {
    if (this.config.provider === 'cloudfront' && this.cloudFrontClient && this.config.distributionId) {
      try {
        await this.cloudFrontClient.send(new CreateInvalidationCommand({
          DistributionId: this.config.distributionId,
          InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
              Quantity: paths.length,
              Items: paths
            }
          }
        }));
      } catch (error) {
        logger.error('CloudFront invalidation error:', error);
      }
    }
  }

  // Get CDN URL for a file
  getCDNUrl(key: string): string {
    if (this.config.provider === 'local') {
      return `${this.config.cdnBaseUrl}/uploads/cdn/${key}`;
    }
    return `${this.config.cdnBaseUrl}/${key}`;
  }

  // Optimize image for CDN
  async optimizeImage(imagePath: string, sizes: number[] = [480, 720, 1080, 1920]): Promise<string[]> {
    const sharp = (await import('sharp')).default;
    const urls: string[] = [];
    const ext = path.extname(imagePath);
    const baseName = path.basename(imagePath, ext);
    
    for (const size of sizes) {
      const outputPath = imagePath.replace(baseName, `${baseName}-${size}w`);
      
      await sharp(imagePath)
        .resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(outputPath);
      
      const key = `images/${baseName}-${size}w.jpg`;
      const url = await this.uploadFile(outputPath, key, 'image/jpeg');
      urls.push(url);
      
      // Clean up temp file
      await fs.remove(outputPath);
    }
    
    return urls;
  }

  // Generate HLS manifest for adaptive streaming
  async generateHLSManifest(videoKey: string, qualities: any[]): Promise<string> {
    const manifest = `#EXTM3U
#EXT-X-VERSION:3
${qualities.map(q => 
      `#EXT-X-STREAM-INF:BANDWIDTH=${q.bitrate},RESOLUTION=${q.width}x${q.height}
${this.getCDNUrl(q.key)}`
    ).join('\n')}`;
    
    const manifestKey = `${videoKey}/playlist.m3u8`;
    const manifestPath = path.join(process.cwd(), 'temp', manifestKey);
    
    await fs.ensureDir(path.dirname(manifestPath));
    await fs.writeFile(manifestPath, manifest);
    
    const url = await this.uploadFile(manifestPath, manifestKey, 'application/x-mpegURL');
    
    // Clean up temp file
    await fs.remove(manifestPath);
    
    return url;
  }
}

export const cdnService = CDNService.getInstance();
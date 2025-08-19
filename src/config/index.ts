import dotenv from 'dotenv';
import { AppConfig } from '@/types/index.js';

// Load environment variables
dotenv.config();

/**
 * Application Configuration
 * Centralized configuration management with validation and defaults
 */

const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_NAME',
  'DB_USER'
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

export const config: AppConfig = {
  app: {
    name: process.env.APP_NAME || 'Real Estate Masterclass LMS',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG_MODE === 'true',
  },

  database: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME!,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    timeout: parseInt(process.env.DB_TIMEOUT || '60000', 10),
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    refresh_secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
    expires_in: process.env.JWT_EXPIRES_IN || '1h',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    from_name: process.env.EMAIL_FROM_NAME || 'Real Estate Masterclass',
  },

  upload: {
    path: process.env.UPLOAD_PATH || 'uploads',
    max_size: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB default
    allowed_types: {
      images: (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(','),
      videos: (process.env.ALLOWED_VIDEO_TYPES || 'mp4,avi,mov,wmv,flv,webm').split(','),
      documents: (process.env.ALLOWED_DOCUMENT_TYPES || 'pdf,doc,docx,txt,rtf').split(','),
    },
  },

  security: {
    bcrypt_rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rate_limit: {
      window_ms: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      max_requests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    cors_origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

// Additional configuration objects for specific features

export const paymentConfig = {
  stripe: {
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || '',
    secret_key: process.env.STRIPE_SECRET_KEY || '',
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: process.env.DEFAULT_CURRENCY || 'USD',
  },
  
  paypal: {
    client_id: process.env.PAYPAL_CLIENT_ID || '',
    client_secret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
  },
};

export const storageConfig = {
  driver: process.env.STORAGE_DRIVER || 'local',
  
  local: {
    upload_path: process.env.UPLOAD_PATH || 'uploads',
    public_url: process.env.PUBLIC_URL || 'http://localhost:3001',
  },
  
  s3: {
    access_key_id: process.env.AWS_ACCESS_KEY_ID || '',
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    public_url: process.env.AWS_S3_PUBLIC_URL || '',
  },
};

export const videoConfig = {
  processing_enabled: process.env.VIDEO_PROCESSING_ENABLED === 'true',
  ffmpeg_path: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
  quality_levels: (process.env.VIDEO_QUALITY_LEVELS || '360,480,720,1080')
    .split(',')
    .map(q => parseInt(q, 10)),
  output_formats: ['mp4', 'webm'],
  thumbnail: {
    enabled: true,
    format: 'jpg',
    quality: 80,
    width: 1280,
    height: 720,
    time_offset: 10, // seconds
  },
};

export const cacheConfig = {
  ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour default
  prefix: process.env.CACHE_PREFIX || 'lms:',
  
  keys: {
    user_session: (userId: string) => `${cacheConfig.prefix}user:session:${userId}`,
    course_data: (courseId: string) => `${cacheConfig.prefix}course:${courseId}`,
    enrollment_data: (userId: string, courseId: string) => 
      `${cacheConfig.prefix}enrollment:${userId}:${courseId}`,
    progress_data: (userId: string, courseId: string) => 
      `${cacheConfig.prefix}progress:${userId}:${courseId}`,
    quiz_results: (userId: string, quizId: string) => 
      `${cacheConfig.prefix}quiz:results:${userId}:${quizId}`,
    analytics: (type: string, timeframe: string) => 
      `${cacheConfig.prefix}analytics:${type}:${timeframe}`,
  },
};

export const certificateConfig = {
  enabled: process.env.CERTIFICATE_ENABLED === 'true',
  template_path: process.env.CERTIFICATE_TEMPLATE_PATH || 'templates/certificate.html',
  storage_path: process.env.CERTIFICATE_STORAGE_PATH || 'certificates',
  
  generation: {
    format: 'pdf',
    width: 1200,
    height: 800,
    quality: 100,
  },
  
  signature: {
    enabled: true,
    image_path: 'assets/signature.png',
    position: { x: 800, y: 600 },
  },
  
  verification: {
    base_url: process.env.CERTIFICATE_VERIFICATION_URL || 'https://your-domain.com/verify',
    qr_code: {
      enabled: true,
      size: 100,
      position: { x: 1050, y: 650 },
    },
  },
};

export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  file_path: process.env.LOG_FILE_PATH || 'logs',
  max_size: process.env.LOG_MAX_SIZE || '20m',
  max_files: process.env.LOG_MAX_FILES || '14d',
  
  // Database query logging (debug mode only)
  query_logging: process.env.NODE_ENV === 'development',
  
  // Performance monitoring
  performance_monitoring: process.env.METRICS_ENABLED === 'true',
  
  // Request logging exclusions
  exclude_paths: ['/health', '/metrics', '/favicon.ico'],
};

export const backupConfig = {
  enabled: process.env.BACKUP_ENABLED === 'true',
  schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
  retention_days: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
  storage_path: process.env.BACKUP_PATH || 'backups',
  
  mysql_dump_options: [
    '--single-transaction',
    '--routines',
    '--triggers',
    '--add-drop-table',
    '--extended-insert',
    '--quick',
    '--lock-tables=false',
  ],
  
  compression: {
    enabled: true,
    algorithm: 'gzip',
    level: 6,
  },
};

export const healthCheckConfig = {
  enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
  
  checks: {
    database: {
      timeout: 5000,
      critical: true,
    },
    redis: {
      timeout: 3000,
      critical: false,
    },
    storage: {
      timeout: 3000,
      critical: true,
    },
    external_services: {
      timeout: 10000,
      critical: false,
    },
  },
  
  thresholds: {
    response_time: 1000, // ms
    memory_usage: 80, // percentage
    cpu_usage: 80, // percentage
    disk_usage: 90, // percentage
  },
};

// Validate configuration
export function validateConfig(): boolean {
  const errors: string[] = [];

  // Validate JWT secret length
  if (config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate database configuration
  if (!config.database.host || !config.database.database) {
    errors.push('Database configuration is incomplete');
  }

  // Validate email configuration if required
  if (process.env.NODE_ENV === 'production') {
    if (!config.email.host || !config.email.user) {
      errors.push('Email configuration is required in production');
    }
  }

  // Validate upload configuration
  if (config.upload.max_size > 1073741824) { // 1GB
    errors.push('Maximum file upload size cannot exceed 1GB');
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:');
    errors.forEach(error => console.error(`- ${error}`));
    return false;
  }

  return true;
}

// Export environment helpers
export const isDevelopment = config.app.env === 'development';
export const isProduction = config.app.env === 'production';
export const isTest = config.app.env === 'test';

// Validate configuration on import
if (!validateConfig()) {
  console.error('Configuration validation failed. Please fix the errors above.');
  process.exit(1);
}

export default config;
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to use based on the environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different formats
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define which format to use based on the environment
const format = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;

// Define the transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: format,
  }),
];

// File transport for production
if (process.env.NODE_ENV === 'production' || process.env.LOG_FILE) {
  const logDir = path.join(__dirname, '../../logs');
  const logFile = process.env.LOG_FILE || path.join(logDir, 'app.log');
  
  transports.push(
    new winston.transports.File({
      filename: logFile,
      level: 'info',
      format: prodFormat,
      maxsize: parseInt(process.env.LOG_MAX_SIZE?.replace('m', '')) * 1024 * 1024 || 10 * 1024 * 1024, // Default 10MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
      tailable: true,
    })
  );

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: logFile.replace('.log', '.error.log'),
      level: 'error',
      format: prodFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Helper functions for structured logging
export const logError = (message: string, error?: Error | any, metadata?: any) => {
  const logData: any = {
    message,
    ...metadata
  };
  
  if (error) {
    if (error instanceof Error) {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else {
      logData.error = error;
    }
  }
  
  logger.error(logData);
};

export const logInfo = (message: string, metadata?: any) => {
  logger.info(message, metadata);
};

export const logWarn = (message: string, metadata?: any) => {
  logger.warn(message, metadata);
};

export const logDebug = (message: string, metadata?: any) => {
  logger.debug(message, metadata);
};

// Database query logger
export const logQuery = (sql: string, params?: any[], duration?: number) => {
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEBUG === 'true') {
    logger.debug('Database Query', {
      sql: sql.replace(/\s+/g, ' ').trim(),
      params,
      duration: duration ? `${duration}ms` : undefined
    });
  }
};

// API request logger
export const logApiRequest = (method: string, url: string, userId?: number, metadata?: any) => {
  logger.info('API Request', {
    method,
    url,
    userId,
    ...metadata
  });
};

// API response logger
export const logApiResponse = (method: string, url: string, status: number, duration: number, userId?: number) => {
  const level = status >= 400 ? 'warn' : 'info';
  logger[level]('API Response', {
    method,
    url,
    status,
    duration: `${duration}ms`,
    userId
  });
};

// Authentication logger
export const logAuth = (action: string, email?: string, success: boolean = true, metadata?: any) => {
  const level = success ? 'info' : 'warn';
  logger[level]('Authentication', {
    action,
    email,
    success,
    ...metadata
  });
};

// File operation logger
export const logFileOperation = (action: string, filename: string, success: boolean = true, metadata?: any) => {
  const level = success ? 'info' : 'error';
  logger[level]('File Operation', {
    action,
    filename,
    success,
    ...metadata
  });
};

// Email logger
export const logEmail = (to: string, subject: string, success: boolean = true, metadata?: any) => {
  const level = success ? 'info' : 'error';
  logger[level]('Email', {
    to,
    subject,
    success,
    ...metadata
  });
};

// Security logger for suspicious activities
export const logSecurity = (event: string, ip?: string, userAgent?: string, metadata?: any) => {
  logger.warn('Security Event', {
    event,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// Performance logger
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger[level]('Performance', {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

// Add additional methods to logger
logger.upload = (filename: string, size: number) => {
  logger.info('File Upload', { filename, size });
};

logger.request = (req: any, res: any, duration: number) => {
  logApiResponse(req.method, req.url, res.statusCode, duration, req.user?.id);
};

logger.security = (message: string, metadata?: any) => {
  logger.warn(message, metadata);
};

// Export format for Morgan
export const morganFormat = process.env.NODE_ENV === 'development' 
  ? 'dev' 
  : 'combined';

export default logger;
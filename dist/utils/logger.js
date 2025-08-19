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
const devFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.colorize({ all: true }), winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`));
const prodFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.json());
// Define which format to use based on the environment
const format = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;
// Define the transports
const transports = [
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
    transports.push(new winston.transports.File({
        filename: logFile,
        level: 'info',
        format: prodFormat,
        maxsize: parseInt(process.env.LOG_MAX_SIZE?.replace('m', '')) * 1024 * 1024 || 10 * 1024 * 1024, // Default 10MB
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
        tailable: true,
    }));
    // Error log file
    transports.push(new winston.transports.File({
        filename: logFile.replace('.log', '.error.log'),
        level: 'error',
        format: prodFormat,
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
        tailable: true,
    }));
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
    write: (message) => {
        logger.http(message.substring(0, message.lastIndexOf('\n')));
    },
};
// Helper functions for structured logging
export const logError = (message, error, metadata) => {
    const logData = {
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
        }
        else {
            logData.error = error;
        }
    }
    logger.error(logData);
};
export const logInfo = (message, metadata) => {
    logger.info(message, metadata);
};
export const logWarn = (message, metadata) => {
    logger.warn(message, metadata);
};
export const logDebug = (message, metadata) => {
    logger.debug(message, metadata);
};
// Database query logger
export const logQuery = (sql, params, duration) => {
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEBUG === 'true') {
        logger.debug('Database Query', {
            sql: sql.replace(/\s+/g, ' ').trim(),
            params,
            duration: duration ? `${duration}ms` : undefined
        });
    }
};
// API request logger
export const logApiRequest = (method, url, userId, metadata) => {
    logger.info('API Request', {
        method,
        url,
        userId,
        ...metadata
    });
};
// API response logger
export const logApiResponse = (method, url, status, duration, userId) => {
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
export const logAuth = (action, email, success = true, metadata) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Authentication', {
        action,
        email,
        success,
        ...metadata
    });
};
// File operation logger
export const logFileOperation = (action, filename, success = true, metadata) => {
    const level = success ? 'info' : 'error';
    logger[level]('File Operation', {
        action,
        filename,
        success,
        ...metadata
    });
};
// Email logger
export const logEmail = (to, subject, success = true, metadata) => {
    const level = success ? 'info' : 'error';
    logger[level]('Email', {
        to,
        subject,
        success,
        ...metadata
    });
};
// Security logger for suspicious activities
export const logSecurity = (event, ip, userAgent, metadata) => {
    logger.warn('Security Event', {
        event,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        ...metadata
    });
};
// Performance logger
export const logPerformance = (operation, duration, metadata) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger[level]('Performance', {
        operation,
        duration: `${duration}ms`,
        ...metadata
    });
};
// Add additional methods to logger
logger.upload = (filename, size) => {
    logger.info('File Upload', { filename, size });
};
logger.request = (req, res, duration) => {
    logApiResponse(req.method, req.url, res.statusCode, duration, req.user?.id);
};
logger.security = (message, metadata) => {
    logger.warn(message, metadata);
};
// Export format for Morgan
export const morganFormat = process.env.NODE_ENV === 'development'
    ? 'dev'
    : 'combined';
export default logger;
//# sourceMappingURL=logger.js.map
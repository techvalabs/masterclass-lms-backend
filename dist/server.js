import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { createServer } from 'http';
import { config } from '@/config/index.js';
import { db } from '@/config/database.js';
import { logger } from '@/utils/logger.js';
import { errorHandler } from '@/middleware/errorHandler.js';
import { authenticate as authMiddleware } from '@/middleware/auth.js';
import { checkDatabaseConnection } from '@/middleware/databaseCheck.js';
import { notificationService } from '@/services/NotificationService.js';
// Import routes
import authRoutes from '@/routes/auth.js';
import courseRoutes from '@/routes/courses.js';
import { createAdminRoutes } from '@/routes/admin.js';
import uploadRoutes from '@/routes/uploads.js';
import uploadVideoRoutes from '@/routes/upload.js';
import healthRoutes from '@/routes/health.js';
import paymentRoutes from '@/routes/payments.js';
import enrollmentRoutes from '@/routes/enrollments.js';
import videoRoutes from '@/routes/videos.js';
import studentRoutes from '@/routes/student.js';
import instructorRoutes from '@/routes/instructor.js';
import userRoutes from '@/routes/user.js';
import publicRoutes from '@/routes/public.js';
/**
 * Real Estate Masterclass LMS Backend Server
 * Express.js application with comprehensive middleware stack
 */
class Server {
    app;
    httpServer;
    port;
    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.port = config.app.port;
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    /**
     * Initialize middleware stack
     */
    initializeMiddleware() {
        // Trust proxy (important for rate limiting and IP detection)
        this.app.set('trust proxy', 1);
        // Security middleware
        this.app.use(helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' },
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
        }));
        // CORS configuration
        this.app.use(cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or Postman)
                if (!origin)
                    return callback(null, true);
                // Allow file:// protocol for local testing
                if (origin.startsWith('file://'))
                    return callback(null, true);
                // Parse CORS origins from config (could be comma-separated)
                const corsOrigins = config.security.cors_origin.split(',').map(o => o.trim());
                const allowedOrigins = [
                    ...corsOrigins,
                    'http://localhost:3000',
                    'http://localhost:5173',
                    'http://localhost:5174',
                    'http://localhost:5175',
                    'http://localhost:5176',
                    'http://localhost:5177',
                    'http://localhost:8080',
                    'http://localhost:8081',
                    'http://127.0.0.1:8080',
                    'http://127.0.0.1:8081'
                ];
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'Accept',
                'Origin',
                'X-API-Key'
            ],
            exposedHeaders: ['X-Total-Count', 'X-Page-Count']
        }));
        // Rate limiting
        const limiter = rateLimit({
            windowMs: config.security.rate_limit.window_ms,
            max: config.security.rate_limit.max_requests,
            message: {
                error: 'Too many requests from this IP, please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(config.security.rate_limit.window_ms / 60000)
            },
            standardHeaders: true,
            legacyHeaders: false,
            skip: (req) => {
                // Skip rate limiting for health checks
                return req.path === '/api/health' || req.path === '/health';
            },
        });
        this.app.use('/api/', limiter);
        // Compression middleware
        this.app.use(compression());
        // Body parsing middleware
        this.app.use(express.json({
            limit: '10mb',
            verify: (req, res, buf, encoding) => {
                // Store raw body for webhook verification
                if (req.url?.includes('/webhook')) {
                    req.rawBody = buf;
                }
            }
        }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        // Static file serving with CORS headers for videos
        this.app.use('/uploads', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Range');
            res.header('Accept-Ranges', 'bytes');
            next();
        }, express.static('uploads'));
        this.app.use('/public', express.static('public'));
        // Request logging
        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('combined'));
        }
        // Request ID middleware
        this.app.use((req, res, next) => {
            req.id = req.get('X-Request-ID') || Math.random().toString(36).substring(7);
            res.setHeader('X-Request-ID', req.id);
            next();
        });
        // Request timing middleware
        this.app.use((req, res, next) => {
            req.startTime = Date.now();
            // Log response when finished
            res.on('finish', () => {
                const duration = Date.now() - req.startTime;
                if (process.env.NODE_ENV === 'development') {
                    console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
                }
            });
            next();
        });
    }
    /**
     * Initialize API routes
     */
    initializeRoutes() {
        const apiRouter = express.Router();
        // Health check route (no auth required)
        apiRouter.use('/health', healthRoutes);
        // Public routes (no auth required)
        apiRouter.use('/public', checkDatabaseConnection, publicRoutes);
        // Authentication routes (with DB check)
        apiRouter.use('/auth', checkDatabaseConnection, authRoutes);
        // Upload routes (auth required)
        apiRouter.use('/uploads', authMiddleware, uploadRoutes);
        // Public course routes (with DB check)
        apiRouter.use('/courses', checkDatabaseConnection, courseRoutes);
        // Protected routes (auth required)
        apiRouter.use('/enrollments', checkDatabaseConnection, enrollmentRoutes);
        apiRouter.use('/payments', checkDatabaseConnection, paymentRoutes);
        // User settings routes (auth required)
        apiRouter.use('/user', checkDatabaseConnection, authMiddleware, userRoutes);
        // Student routes (auth required)
        apiRouter.use('/student', checkDatabaseConnection, studentRoutes);
        apiRouter.use('/videos', checkDatabaseConnection, videoRoutes);
        // Instructor routes (auth + instructor role required)
        apiRouter.use('/instructor', checkDatabaseConnection, instructorRoutes);
        // Video upload routes (auth required)
        apiRouter.use('/upload', authMiddleware, uploadVideoRoutes);
        // Admin routes (admin auth handled internally)
        // Pass the database pool to admin routes (may be null initially)
        apiRouter.use('/admin', checkDatabaseConnection, createAdminRoutes(db.getPool()));
        // Mount API routes
        this.app.use('/api/v1', apiRouter);
        this.app.use('/api', apiRouter); // Alias for convenience
        // Catch-all route for API
        this.app.all('/api/*', (req, res) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.method} ${req.originalUrl} not found`,
                code: 'ROUTE_NOT_FOUND'
            });
        });
        // Root route
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'Real Estate Masterclass LMS API',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        });
        // Catch-all route for non-API requests
        this.app.all('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint not found',
                code: 'ENDPOINT_NOT_FOUND'
            });
        });
    }
    /**
     * Initialize error handling
     */
    initializeErrorHandling() {
        // Global error handler
        this.app.use(errorHandler);
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Promise Rejection:', reason);
            // Close server gracefully
            this.gracefulShutdown('UNHANDLED_REJECTION');
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            // Close server gracefully
            this.gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
        // Handle process termination
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Starting graceful shutdown...');
            this.gracefulShutdown('SIGTERM');
        });
        process.on('SIGINT', () => {
            logger.info('SIGINT received. Starting graceful shutdown...');
            this.gracefulShutdown('SIGINT');
        });
    }
    /**
     * Initialize database and external services
     */
    async initializeServices() {
        try {
            // Initialize database
            console.log('Initializing database connection...');
            await db.initialize();
            // Initialize WebSocket notification service
            console.log('Initializing notification service...');
            notificationService.initialize(this.httpServer);
            console.log('✅ All services initialized successfully');
        }
        catch (error) {
            console.error('⚠️  Service initialization failed:', error);
            if (process.env.NODE_ENV === 'development') {
                console.log('\n🔧 Development Mode: Server will continue without database');
                console.log('📋 To fix database connection:');
                console.log('   1. Start MySQL in Laragon');
                console.log('   2. Create database: masterclass_lms');
                console.log('   3. Check .env file DB settings');
                console.log('   4. Restart the server\n');
                return; // Continue without database in dev mode
            }
            throw error;
        }
    }
    /**
     * Start the server
     */
    async start() {
        try {
            // Initialize external services
            await this.initializeServices();
            // Start HTTP server
            this.httpServer.listen(this.port, () => {
                console.log(`🚀 Server started successfully on port ${this.port}`);
                console.log(`📈 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
                console.log(`🔒 CORS Origin: ${config.security.cors_origin}`);
                console.log(`🔔 WebSocket notifications enabled`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    /**
     * Graceful shutdown
     */
    async gracefulShutdown(signal) {
        console.log(`Graceful shutdown initiated by ${signal}`);
        try {
            // Close database connections
            await db.close();
            console.log('Graceful shutdown completed');
            process.exit(0);
        }
        catch (error) {
            console.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    }
    /**
     * Get Express app instance
     */
    getApp() {
        return this.app;
    }
}
// Create and start server
const server = new Server();
// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    server.start().catch((error) => {
        console.error('Server startup failed:', error);
        process.exit(1);
    });
}
export default server;
export { Server };
//# sourceMappingURL=server.js.map
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import 'express-async-errors';

// Load environment variables first
dotenv.config();

/**
 * Real Estate Masterclass LMS Backend Server with MySQL Database Integration
 * Fixed to handle firstName/lastName from frontend
 */

const app = express();
const PORT = process.env.PORT || 3001;

// Database configuration with WSL-friendly defaults
const dbConfig = {
  host: process.env.DB_HOST || '10.255.255.254', // Default to Windows host for WSL
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'masterclass_lms',
  charset: 'utf8mb4',
  // Connection timeout settings (valid for mysql2)
  connectTimeout: 60000
};

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_jwt_key_here_change_this_in_production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Database connection pool
let db: mysql.Pool | null = null;
let isDbConnected = false;

// Database availability checker
function checkDatabaseConnection(): boolean {
  return isDbConnected && db !== undefined;
}

// Database operation wrapper with fallback
async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallbackData: T,
  errorMessage: string = 'Database operation failed'
): Promise<T> {
  if (!checkDatabaseConnection()) {
    console.error(`⚠️  ${errorMessage}: Database not connected`);
    return fallbackData;
  }

  try {
    return await operation();
  } catch (error) {
    console.error(`❌ ${errorMessage}:`, error);
    return fallbackData;
  }
}

// Initialize database connection with retry logic
async function initializeDatabase(retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  try {
    console.log(`🔄 Attempting database connection (attempt ${retryCount + 1}/${maxRetries + 1})...`);
    console.log(`📡 Connecting to: ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);
    
    db = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
      queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0')
    });

    // Test connection with timeout
    const connection = await Promise.race([
      db.getConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]) as mysql.PoolConnection;

    console.log('✅ Database connected successfully');
    console.log(`📊 Connected to: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    
    // Set connection status
    isDbConnected = true;

    // Check if tables exist
    const [tables] = await db!.execute("SHOW TABLES LIKE 'users'");
    if ((tables as any[]).length === 0) {
      console.log('⚠️  WARNING: Users table not found. Please run:');
      console.log('   npm run db:create');
      console.log('   npm run db:schema');
    } else {
      console.log('✅ Database tables are ready');
    }

    return true;

  } catch (error) {
    console.error(`❌ Database connection failed (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < maxRetries) {
      console.log(`⏳ Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return initializeDatabase(retryCount + 1);
    }

    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if Laragon MySQL is running');
    console.log('2. Verify MySQL is accessible from WSL:');
    console.log(`   telnet ${dbConfig.host} ${dbConfig.port}`);
    console.log('3. Check your .env file database settings');
    console.log('4. For WSL + Laragon setup, try these host values:');
    console.log('   - 10.255.255.254 (WSL default gateway)');
    console.log('   - 172.20.240.1 (common WSL host)');
    console.log('   - localhost (if port forwarding is set up)');
    console.log('5. Create database and schema:');
    console.log('   npm run db:create');
    console.log('   npm run db:schema');
    
    isDbConnected = false;
    return false;
  }
}

// Basic middleware setup
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Utility functions
function generateTokens(userId: number, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, email, role, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

// Auth middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      code: 'UNAUTHORIZED'
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'FORBIDDEN'
      });
    }
    req.user = decoded;
    next();
  });
}

// Debug route to check user roles
app.get('/api/debug/users', async (req, res) => {
  try {
    const [users]: any = await db!.execute(
      `SELECT u.id, u.name, u.email, u.role_id,
              r.name as role_name
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );
    
    const [roles]: any = await db!.execute('SELECT * FROM roles');
    
    res.json({
      success: true,
      roles: roles,
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role_id: u.role_id,
        role_name: u.role_name
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

// Health check route
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let tableStatus = 'unknown';
  
  if (checkDatabaseConnection()) {
    const result = await safeDbOperation(
      async () => {
        const [testResult] = await db!.execute('SELECT 1 as test');
        dbStatus = 'connected';
        
        // Check if users table exists
        const [tables] = await db!.execute("SHOW TABLES LIKE 'users'");
        tableStatus = (tables as any[]).length > 0 ? 'ready' : 'missing';
        return true;
      },
      false,
      'Health check database operation'
    );
    
    if (!result) {
      dbStatus = 'error';
    }
  }

  res.json({
    success: true,
    message: 'Real Estate Masterclass LMS API with MySQL',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    tables: tableStatus,
    host: dbConfig.host,
    port: dbConfig.port
  });
});

// Removed conflicting inline registration route - using AuthController instead

// Removed conflicting inline login and logout routes - using AuthController instead

// Get current user
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const [users]: any = await db!.execute(
      `SELECT u.id, u.name, u.email, 
              COALESCE(r.name, 'student') as role_name, u.avatar, u.created_at 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        avatar: user.avatar,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      code: 'USER_FETCH_ERROR'
    });
  }
});

// List all users (for testing)
app.get('/api/users', authenticateToken, async (req: any, res) => {
  try {
    const [users]: any = await db!.execute(
      `SELECT u.id, u.name, u.email, 
              COALESCE(r.name, 'student') as role_name, u.created_at, u.is_active
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       ORDER BY u.created_at DESC`
    );

    const safeUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      createdAt: user.created_at,
      isActive: user.is_active
    }));

    res.json({
      success: true,
      data: safeUsers,
      total: safeUsers.length
    });

  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list users',
      code: 'USERS_FETCH_ERROR'
    });
  }
});

// Courses endpoint with MySQL
app.get('/api/courses', async (req, res) => {
  try {
    const [courses]: any = await db!.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        COALESCE(u.name, 'Unknown Instructor') as instructor,
        c.duration_minutes as duration,
        c.level,
        c.is_paid as isPaid,
        c.price,
        c.original_price as originalPrice,
        c.average_rating as rating,
        c.total_enrollments as studentsCount,
        c.thumbnail_url as thumbnail,
        cat.name as category,
        c.created_at as createdAt
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.is_published = 1 AND c.is_active = 1
      ORDER BY c.total_enrollments DESC
    `);

    const formattedCourses = courses.map((course: any) => ({
      ...course,
      instructor: course.instructor.trim() || 'Unknown Instructor',
      isEnrolled: false, // TODO: Check if user is enrolled
      lessons: [] // TODO: Get lesson count
    }));

    res.json({
      success: true,
      data: formattedCourses,
      pagination: {
        page: 1,
        limit: 50,
        total: formattedCourses.length,
        totalPages: 1
      }
    });

  } catch (error) {
    console.error('MySQL Courses fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      code: 'COURSES_FETCH_ERROR'
    });
  }
});

// Featured courses endpoint
app.get('/api/courses/featured', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 6;
  
  // Mock data for when database is unavailable
  const mockCourses = [
    {
      id: 1,
      title: "Real Estate Investment Fundamentals",
      description: "Learn the basics of real estate investing and build your portfolio",
      instructor: "Sample Instructor",
      duration: 120,
      level: "Beginner",
      isPaid: true,
      price: 99.99,
      originalPrice: 149.99,
      rating: 4.5,
      studentsCount: 1234,
      thumbnail: "/api/placeholder/course-1.jpg",
      category: "Investment",
      createdAt: new Date().toISOString(),
      isEnrolled: false,
      lessons: []
    }
  ];

  const courses = await safeDbOperation(
    async () => {
      const [results]: any = await db!.execute(`
        SELECT 
          c.id,
          c.title,
          c.description,
          COALESCE(u.name, 'Unknown Instructor') as instructor,
          c.duration_minutes as duration,
          c.level,
          c.is_paid as isPaid,
          c.price,
          c.original_price as originalPrice,
          c.average_rating as rating,
          c.total_enrollments as studentsCount,
          c.thumbnail_url as thumbnail,
          cat.name as category,
          c.created_at as createdAt
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.is_published = 1 AND c.is_active = 1 AND c.is_featured = 1
        ORDER BY c.total_enrollments DESC
        LIMIT ?
      `, [limit]);

      return results.map((course: any) => ({
        ...course,
        instructor: course.instructor.trim() || 'Unknown Instructor',
        isEnrolled: false,
        lessons: []
      }));
    },
    mockCourses,
    'Featured courses fetch'
  );

  res.json({
    success: true,
    data: courses,
    message: !checkDatabaseConnection() ? 'Using mock data - database not connected' : undefined
  });
});

// Categories endpoint
app.get('/api/courses/categories', async (req, res) => {
  try {
    const [categories]: any = await db!.execute(
      'SELECT name FROM categories WHERE is_active = 1 ORDER BY name'
    );

    const categoryNames = categories.map((cat: any) => cat.name);

    res.json({
      success: true,
      data: categoryNames
    });

  } catch (error) {
    console.error('MySQL Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      code: 'CATEGORIES_FETCH_ERROR'
    });
  }
});

// ===========================
// ADMIN API ROUTES
// ===========================

// Import routes
import createAdminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', createAdminRoutes(checkDatabaseConnection() ? db : null));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Real Estate Masterclass LMS API with MySQL Database',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR'
  });
});

// Start server
async function startServer() {
  try {
    const dbConnected = await initializeDatabase();
    
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection (using mock data)');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Real Estate Masterclass LMS Backend with MySQL`);
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: MySQL @ ${dbConfig.host}:${dbConfig.port}`);
      console.log(`📝 Registration: Supports firstName/lastName from frontend`);
      console.log(`\n👨‍💼 ADMIN API ENDPOINTS:`);
      console.log(`🎓 Courses: http://localhost:${PORT}/api/admin/courses`);
      console.log(`👥 Users: http://localhost:${PORT}/api/admin/users`);
      console.log(`📊 Analytics: http://localhost:${PORT}/api/admin/analytics`);
      console.log(`💳 Payments: http://localhost:${PORT}/api/admin/payments`);
      console.log(`📁 Content: http://localhost:${PORT}/api/admin/content`);
      console.log(`⚙️  Settings: http://localhost:${PORT}/api/admin/settings`);
      console.log(`📈 Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
      console.log(`🔐 Admin Auth Required for all admin endpoints`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
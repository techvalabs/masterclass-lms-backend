import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'express-async-errors';

/**
 * Real Estate Masterclass LMS Backend Server with Database Integration
 */

const app = express();
const PORT = process.env.PORT || 3001;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'masterclass_lms',
  charset: 'utf8mb4'
};

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_jwt_key_here_change_this_in_production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Database connection pool
let db: mysql.Pool;

// Initialize database connection
async function initializeDatabase() {
  try {
    db = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('Please make sure:');
    console.log('1. Laragon MySQL is running');
    console.log('2. Database "masterclass_lms" exists');
    console.log('3. Run: npm run db:create && npm run db:schema');
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
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, email, role, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
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

// Health check route
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'error';
  }

  res.json({
    success: true,
    message: 'Real Estate Masterclass LMS API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus
  });
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        code: 'VALIDATION_ERROR'
      });
    }

    // Check if user already exists
    const [existingUsers]: any = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Get role ID
    const [roles]: any = await db.execute(
      'SELECT id FROM roles WHERE name = ?',
      [role]
    );

    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
        code: 'INVALID_ROLE'
      });
    }

    const roleId = roles[0].id;

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Insert new user
    const [result]: any = await db.execute(
      `INSERT INTO users (name, email, password_hash, role_id, email_verified, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [name, email, hashedPassword, roleId]
    );

    const userId = result.insertId;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId, email, role);

    // Get the created user
    const [users]: any = await db.execute(
      `SELECT u.id, u.name, u.email, r.name as role, u.avatar, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [userId]
    );

    const user = users[0];

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.created_at
        },
        accessToken,
        refreshToken
      },
      message: 'User registered successfully'
    });

    console.log(`✅ New user registered: ${email} (${role})`);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Get user with role
    const [users]: any = await db.execute(
      `SELECT u.id, u.name, u.email, u.password_hash, r.name as role, u.avatar 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        accessToken,
        refreshToken
      },
      message: 'Login successful'
    });

    console.log(`✅ User logged in: ${email}`);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const [users]: any = await db.execute(
      `SELECT u.id, u.name, u.email, r.name as role, u.avatar, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
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
        role: user.role,
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

// Courses endpoint with database
app.get('/api/courses', async (req, res) => {
  try {
    const [courses]: any = await db.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        CONCAT(u.first_name, ' ', u.last_name) as instructor,
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
    console.error('Courses fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      code: 'COURSES_FETCH_ERROR'
    });
  }
});

// Featured courses endpoint
app.get('/api/courses/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    
    const [courses]: any = await db.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        CONCAT(u.first_name, ' ', u.last_name) as instructor,
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

    const formattedCourses = courses.map((course: any) => ({
      ...course,
      isEnrolled: false,
      lessons: []
    }));

    res.json({
      success: true,
      data: formattedCourses
    });

  } catch (error) {
    console.error('Featured courses fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured courses',
      code: 'FEATURED_COURSES_FETCH_ERROR'
    });
  }
});

// Categories endpoint
app.get('/api/courses/categories', async (req, res) => {
  try {
    const [categories]: any = await db.execute(
      'SELECT name FROM categories WHERE is_active = 1 ORDER BY name'
    );

    const categoryNames = categories.map((cat: any) => cat.name);

    res.json({
      success: true,
      data: categoryNames
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      code: 'CATEGORIES_FETCH_ERROR'
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Real Estate Masterclass LMS API with Database',
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
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Real Estate Masterclass LMS Backend Server with Database`);
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
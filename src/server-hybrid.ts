import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'fs/promises';
import path from 'path';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'express-async-errors';

/**
 * Hybrid Server - Uses file storage for now, ready for database
 */

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_jwt_key_here_change_this_in_production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Initialize data directory and files
async function initializeStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Check if users file exists, if not create it
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
      console.log('✅ Created users.json file');
    }
    
    console.log('✅ File storage initialized');
  } catch (error) {
    console.error('❌ Storage initialization failed:', error);
  }
}

// Storage utility functions
async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveUsers(users: any[]) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
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
  let storageStatus = 'connected';
  try {
    await fs.access(USERS_FILE);
  } catch {
    storageStatus = 'error';
  }

  res.json({
    success: true,
    message: 'Real Estate Masterclass LMS API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    storage: storageStatus,
    note: 'Using file storage - ready for database integration'
  });
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    // Handle both frontend formats: {name} or {firstName, lastName}
    const { name, firstName, lastName, email, password, role = 'student' } = req.body;
    
    // Combine firstName and lastName into name if needed
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName);

    console.log('📥 Registration request received:', { fullName, email, role, body: req.body });

    // Validation
    if (!fullName || !email || !password) {
      console.log('❌ Validation failed:', { fullName: !!fullName, email: !!email, password: !!password });
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

    // Load existing users
    const users = await loadUsers();

    // Check if user already exists
    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create new user
    const newUser = {
      id: users.length + 1,
      name: fullName,
      email,
      password_hash: hashedPassword,
      role,
      avatar: null,
      email_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);

    // Save to file
    await saveUsers(users);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          createdAt: newUser.created_at
        },
        accessToken,
        refreshToken
      },
      message: 'User registered successfully'
    });

    console.log(`✅ New user registered: ${email} (${role}) - ID: ${newUser.id}`);
    console.log(`📊 Total users: ${users.length}`);

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

    // Load users
    const users = await loadUsers();

    // Find user
    const user = users.find((u: any) => u.email === email && u.is_active);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

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

    console.log(`✅ User logged in: ${email} (ID: ${user.id})`);

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
    const users = await loadUsers();
    const user = users.find((u: any) => u.id === req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

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

// List all registered users (for testing)
app.get('/api/users', authenticateToken, async (req: any, res) => {
  try {
    const users = await loadUsers();
    
    const safeUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

// Courses endpoint (mock data for now)
app.get('/api/courses', async (req, res) => {
  const mockCourses = [
    {
      id: '1',
      title: 'Real Estate Wholesaling Masterclass',
      description: 'Learn how to wholesale real estate properties with no money down',
      instructor: 'Loweta Gonzales',
      duration: 120,
      level: 'Beginner',
      isPaid: false,
      price: 0,
      originalPrice: 197,
      rating: 4.8,
      studentsCount: 15420,
      thumbnail: '/img/courses/wholesaling.jpg',
      category: 'Wholesaling',
      createdAt: new Date('2024-01-15').toISOString(),
      isEnrolled: false,
      lessons: []
    },
    {
      id: '2',
      title: 'House Flipping Strategies',
      description: 'Master the art of buying, renovating, and selling properties for profit',
      instructor: 'Loweta Gonzales',
      duration: 180,
      level: 'Intermediate',
      isPaid: false,
      price: 0,
      originalPrice: 297,
      rating: 4.9,
      studentsCount: 12800,
      thumbnail: '/img/courses/flipping.jpg',
      category: 'Flipping',
      createdAt: new Date('2024-02-01').toISOString(),
      isEnrolled: false,
      lessons: []
    }
  ];

  res.json({
    success: true,
    data: mockCourses,
    pagination: {
      page: 1,
      limit: 50,
      total: mockCourses.length,
      totalPages: 1
    }
  });
});

// Featured courses endpoint
app.get('/api/courses/featured', async (req, res) => {
  const mockCourses = [
    {
      id: '1',
      title: 'Real Estate Wholesaling Masterclass',
      description: 'Learn how to wholesale real estate properties with no money down',
      instructor: 'Loweta Gonzales',
      duration: 120,
      level: 'Beginner',
      isPaid: false,
      price: 0,
      originalPrice: 197,
      rating: 4.8,
      studentsCount: 15420,
      thumbnail: '/img/courses/wholesaling.jpg',
      category: 'Wholesaling',
      createdAt: new Date('2024-01-15').toISOString(),
      isEnrolled: false,
      lessons: []
    }
  ];

  res.json({
    success: true,
    data: mockCourses
  });
});

// Categories endpoint
app.get('/api/courses/categories', async (req, res) => {
  const categories = [
    'Wholesaling',
    'Flipping',
    'Buy & Hold',
    'Commercial',
    'Land Development',
    'Creative Financing'
  ];

  res.json({
    success: true,
    data: categories
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Real Estate Masterclass LMS API with File Storage',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    note: 'User registration is working and saving to file storage!'
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
    await initializeStorage();
    
    app.listen(PORT, () => {
      console.log(`🚀 Real Estate Masterclass LMS Backend Server with File Storage`);
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`💾 Storage: File-based (data/users.json)`);
      console.log(`✅ Registration is working and will save users!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
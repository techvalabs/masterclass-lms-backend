import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import 'express-async-errors';
/**
 * Simple Real Estate Masterclass LMS Backend Server
 * Minimal working version for testing integration
 */
const app = express();
const PORT = process.env.PORT || 3001;
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
// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Real Estate Masterclass LMS API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Basic courses endpoint (mock data for testing)
app.get('/api/courses', (req, res) => {
    // Mock course data that matches the expected frontend structure
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
app.get('/api/courses/featured', (req, res) => {
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
app.get('/api/courses/categories', (req, res) => {
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
// Basic auth endpoints (mock responses for testing)
app.post('/api/auth/login', (req, res) => {
    // Mock login response
    res.json({
        success: true,
        data: {
            user: {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'student',
                avatar: null
            },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
        },
        message: 'Login successful'
    });
});
app.post('/api/auth/register', (req, res) => {
    // Mock registration response
    res.json({
        success: true,
        data: {
            user: {
                id: '2',
                email: req.body.email,
                name: req.body.name,
                role: req.body.role || 'student',
                avatar: null
            },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
        },
        message: 'Registration successful'
    });
});
// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Real Estate Masterclass LMS API',
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
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Real Estate Masterclass LMS Backend Server started`);
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ API Base URL: http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});
export default app;
//# sourceMappingURL=server-simple.js.map
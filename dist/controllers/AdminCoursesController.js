import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';
import { db } from '../config/database.js';
export class AdminCoursesController {
    db;
    constructor(database) {
        this.db = database;
    }
    getDatabase() {
        // Try to get global database instance first
        try {
            const globalDb = db.getPool();
            if (globalDb) {
                console.log('✅ Using global database instance');
                this.db = globalDb; // Store for future use
                return globalDb;
            }
        }
        catch (e) {
            console.log('⚠️ Global database not available:', e.message);
        }
        if (!this.db) {
            console.log('❌ No database available - attempting to reinitialize...');
            // Try to reinitialize
            try {
                db.initialize();
                const reinitDb = db.getPool();
                if (reinitDb) {
                    this.db = reinitDb;
                    console.log('✅ Database reinitialized successfully');
                    return reinitDb;
                }
            }
            catch (reinitError) {
                console.error('❌ Failed to reinitialize database:', reinitError);
            }
            throw new DatabaseError('Database not available');
        }
        console.log('✅ Using constructor database instance');
        return this.db;
    }
    checkDatabaseConnection() {
        // Check if we can get database from either source
        try {
            this.getDatabase();
            return true;
        }
        catch (e) {
            console.log('❌ Database connection check failed:', e.message);
            return false;
        }
    }
    /**
     * Get all courses with admin filters and pagination
     * GET /api/admin/courses
     */
    getCourses = async (req, res) => {
        try {
            if (!this.checkDatabaseConnection()) {
                // Return realistic data when database is not available
                const { realisticCourses } = await import('../data/realistic-data.js');
                // Extract query parameters for fallback  
                const { page: pageStr = '1', limit: limitStr = '20', status, level, search } = req.query;
                const page = parseInt(pageStr, 10) || 1;
                const limit = parseInt(limitStr, 10) || 20;
                // Apply basic filtering based on query parameters
                let filteredCourses = [...realisticCourses];
                if (status === 'published') {
                    filteredCourses = filteredCourses.filter(course => course.isPublished);
                }
                else if (status === 'draft') {
                    filteredCourses = filteredCourses.filter(course => !course.isPublished);
                }
                if (level) {
                    filteredCourses = filteredCourses.filter(course => course.level === level);
                }
                if (search) {
                    const searchLower = search.toLowerCase();
                    filteredCourses = filteredCourses.filter(course => course.title.toLowerCase().includes(searchLower) ||
                        course.description.toLowerCase().includes(searchLower));
                }
                // Apply pagination
                const offset = (page - 1) * limit;
                const paginatedCourses = filteredCourses.slice(offset, offset + limit);
                const total = filteredCourses.length;
                const totalPages = Math.ceil(total / limit);
                return res.json({
                    success: true,
                    data: paginatedCourses,
                    meta: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    },
                    message: "Using realistic data - database not connected"
                });
            }
            const { page: pageStr = '1', limit: limitStr = '20', sort = 'created_at', order = 'desc', status, instructor, category, search, dateFrom, dateTo, priceMin, priceMax, level } = req.query;
            // Parse numeric parameters
            const page = parseInt(pageStr, 10) || 1;
            const limit = parseInt(limitStr, 10) || 20;
            const priceMinNum = priceMin ? parseFloat(priceMin) : undefined;
            const priceMaxNum = priceMax ? parseFloat(priceMax) : undefined;
            // Build WHERE clause
            const conditions = [];
            const params = [];
            if (status) {
                if (status === 'published') {
                    conditions.push('c.is_published = 1');
                }
                else if (status === 'draft') {
                    conditions.push('c.is_published = 0');
                }
            }
            if (instructor) {
                conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
                params.push(`%${instructor}%`, `%${instructor}%`);
            }
            if (category) {
                conditions.push('cat.name = ?');
                params.push(category);
            }
            if (search) {
                conditions.push('(c.title LIKE ? OR c.description LIKE ?)');
                params.push(`%${search}%`, `%${search}%`);
            }
            if (level) {
                conditions.push('c.level = ?');
                params.push(level);
            }
            if (priceMinNum !== undefined) {
                conditions.push('c.price >= ?');
                params.push(priceMinNum);
            }
            if (priceMaxNum !== undefined) {
                conditions.push('c.price <= ?');
                params.push(priceMaxNum);
            }
            if (dateFrom) {
                conditions.push('c.created_at >= ?');
                params.push(dateFrom);
            }
            if (dateTo) {
                conditions.push('c.created_at <= ?');
                params.push(dateTo);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            // Validate sort field
            const allowedSortFields = ['created_at', 'title', 'price', 'total_students', 'rating', 'updated_at'];
            const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
            const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
            // Count total records
            const countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN course_categories cat ON c.category_id = cat.id
        ${whereClause}
      `;
            const [countResult] = await this.getDatabase().query(countQuery);
            const total = countResult[0].total;
            // Calculate pagination
            const offset = (page - 1) * limit;
            const totalPages = Math.ceil(total / limit);
            // Fetch courses with all necessary fields 
            const coursesQuery = `
        SELECT 
          c.*,
          u.name as instructor_name,
          cat.name as category_name
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN course_categories cat ON c.category_id = cat.id
        ${whereClause}
        ORDER BY c.${sortField} ${sortOrder}
        LIMIT ${limit} OFFSET ${offset}
      `;
            console.log('DEBUG: Fetching ALL course fields with joins, limit =', limit, 'offset =', offset);
            const [courses] = await this.getDatabase().query(coursesQuery, params);
            const response = {
                success: true,
                data: courses.map((course) => ({
                    id: course.id,
                    title: course.title,
                    slug: course.slug,
                    description: course.description,
                    thumbnail: course.thumbnail,
                    video_url: course.video_url,
                    price: course.price ? parseFloat(course.price) : 0,
                    discount_price: course.discount_price ? parseFloat(course.discount_price) : null,
                    currency: course.currency || 'USD',
                    level: course.level || 'beginner',
                    duration_hours: course.duration_hours || 0,
                    language: course.language || 'English',
                    rating: course.rating ? parseFloat(course.rating) : null,
                    total_reviews: course.total_reviews || 0,
                    total_students: course.total_students || 0,
                    total_lessons: course.total_lessons || 0,
                    is_published: Boolean(course.is_published),
                    is_featured: Boolean(course.is_featured),
                    status: course.status,
                    created_at: course.created_at,
                    updated_at: course.updated_at,
                    instructor_id: course.instructor_id,
                    instructor_name: course.instructor_name || 'Unknown Instructor',
                    instructor_email: course.instructor_email,
                    category_id: course.category_id,
                    category_name: course.category_name || 'Uncategorized',
                    instructor: {
                        id: course.instructor_id,
                        name: course.instructor_name,
                        email: course.instructor_email
                    },
                    category: {
                        id: course.category_id,
                        name: course.category_name
                    },
                    stats: {
                        activeEnrollments: course.active_enrollments,
                        completions: course.completions,
                        totalRevenue: course.total_revenue ? parseFloat(course.total_revenue) : 0,
                        completionRate: course.active_enrollments > 0
                            ? Math.round((course.completions / course.active_enrollments) * 100)
                            : 0
                    }
                })),
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get courses error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch courses',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get single course details for admin
     * GET /api/admin/courses/:id
     */
    getCourseById = async (req, res) => {
        try {
            if (!this.checkDatabaseConnection()) {
                const courseId = parseInt(req.params.id);
                const mockCourse = {
                    id: courseId,
                    title: "Real Estate Investment Fundamentals",
                    slug: "real-estate-investment-fundamentals",
                    description: "Learn the basics of real estate investing and build your portfolio",
                    shortDescription: "Real estate investing course",
                    thumbnail: "/api/placeholder/course-1.jpg",
                    previewVideo: "/api/placeholder/preview-1.mp4",
                    price: 299.99,
                    originalPrice: 399.99,
                    currency: "USD",
                    level: "Beginner",
                    duration: { hours: 5, minutes: 30, total: 330 },
                    language: "en",
                    tags: ["real estate", "investment", "beginner"],
                    learningOutcomes: ["Understand real estate fundamentals", "Learn investment strategies"],
                    requirements: ["Basic math skills", "Interest in real estate"],
                    targetAudience: ["Beginners", "New investors"],
                    features: ["Lifetime access", "Certificate", "Mobile friendly"],
                    rating: 4.5,
                    totalRatings: 120,
                    totalStudents: 450,
                    totalLessons: 25,
                    isPublished: true,
                    isFeatured: true,
                    isFree: false,
                    publishDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    metaTitle: "Real Estate Investment Course",
                    metaDescription: "Learn real estate investing",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    instructor: { id: 1, name: "John Doe", email: "john@example.com", bio: "Real estate expert" },
                    category: { id: 1, name: "Investment", slug: "investment" },
                    modules: [],
                    stats: { activeEnrollments: 450, completions: 320, totalRevenue: 134995.50, completionRate: 71, averageRating: 4.5, reviewCount: 120 }
                };
                return res.json({
                    success: true,
                    data: mockCourse,
                    message: "Using mock data - database not connected"
                });
            }
            const courseId = parseInt(req.params.id);
            if (!courseId) {
                throw new ValidationError('Invalid course ID');
            }
            // Get course with detailed information
            const courseQuery = `
        SELECT 
          c.*,
          COALESCE(u.name, 'Unknown') as instructor_name,
          u.email as instructor_email,
          i.experience as instructor_bio,
          cat.name as category_name,
          cat.slug as category_slug,
          (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.is_active = 1) as active_enrollments,
          (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.completed_at IS NOT NULL) as completions,
          (SELECT SUM(pt.amount) FROM payment_transactions pt 
           JOIN enrollments e ON pt.enrollment_id = e.id 
           WHERE e.course_id = c.id AND pt.status = 'completed') as total_revenue,
          (SELECT AVG(cr.rating) FROM course_reviews cr WHERE cr.course_id = c.id) as avg_rating,
          (SELECT COUNT(*) FROM course_reviews cr WHERE cr.course_id = c.id) as review_count
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN course_categories cat ON c.category_id = cat.id
        WHERE c.id = ?
      `;
            const [courseResult] = await this.getDatabase().execute(courseQuery, [courseId]);
            if (courseResult.length === 0) {
                throw new NotFoundError('Course not found');
            }
            const course = courseResult[0];
            // Get lessons directly (no modules table in current schema)
            const lessonsQuery = `
        SELECT 
          l.id,
          l.title,
          l.description,
          l.video_url,
          l.duration_minutes,
          l.lesson_order,
          l.is_free_preview,
          l.content_type,
          l.created_at,
          l.updated_at
        FROM course_lessons l
        WHERE l.course_id = ?
        ORDER BY l.lesson_order ASC
      `;
            const [lessons] = await this.getDatabase().execute(lessonsQuery, [courseId]);
            // Create a default module structure for compatibility
            const modulesWithLessons = [{
                    id: 1,
                    title: 'Course Content',
                    description: 'Main course content',
                    sort_order: 1,
                    duration_seconds: lessons.reduce((total, lesson) => total + (lesson.duration_minutes * 60), 0),
                    is_published: course.is_published,
                    lesson_count: lessons.length,
                    lessons: lessons.map((lesson) => ({
                        id: lesson.id,
                        module_id: 1,
                        title: lesson.title,
                        description: lesson.description,
                        video_url: lesson.video_url,
                        video_duration: lesson.duration_minutes,
                        sort_order: lesson.lesson_order,
                        is_preview: lesson.is_free_preview,
                        is_published: true,
                        view_count: 0,
                        resource_count: 0
                    }))
                }];
            // Helper function to safely parse JSON
            const safeJsonParse = (jsonString, fallback = []) => {
                if (!jsonString)
                    return fallback;
                try {
                    return JSON.parse(jsonString);
                }
                catch (e) {
                    console.warn('Failed to parse JSON:', jsonString);
                    return fallback;
                }
            };
            const response = {
                success: true,
                data: {
                    id: course.id,
                    title: course.title,
                    slug: course.slug,
                    description: course.description,
                    shortDescription: course.description, // No separate short_description field
                    thumbnail: course.thumbnail,
                    previewVideo: course.video_url, // Using video_url as preview video
                    price: course.price ? parseFloat(course.price) : 0,
                    originalPrice: course.discount_price ? parseFloat(course.discount_price) : null,
                    currency: course.currency || 'USD',
                    level: course.level || 'beginner',
                    duration: {
                        hours: course.duration_hours || 0,
                        minutes: 0, // No duration_minutes field in schema
                        total: (course.duration_hours || 0) * 60
                    },
                    language: course.language || 'English',
                    tags: [], // No tags field in current schema
                    learningOutcomes: safeJsonParse(course.course_objectives, []),
                    requirements: safeJsonParse(course.course_requirements, []),
                    targetAudience: safeJsonParse(course.target_audience, []),
                    features: [], // No features field in current schema
                    rating: course.rating ? parseFloat(course.rating) : 0,
                    totalRatings: course.total_reviews || 0,
                    totalStudents: course.total_students || 0,
                    totalLessons: course.total_lessons || 0,
                    isPublished: Boolean(course.is_published),
                    isFeatured: Boolean(course.is_featured),
                    isFree: (course.price === 0 || course.price === '0.00'),
                    publishDate: course.created_at, // No separate publish_date field
                    lastUpdated: course.updated_at,
                    metaTitle: course.title, // No separate meta_title field
                    metaDescription: course.description, // No separate meta_description field
                    createdAt: course.created_at,
                    updatedAt: course.updated_at,
                    instructor: {
                        id: course.instructor_id,
                        name: course.instructor_name || 'Unknown Instructor',
                        email: course.instructor_email || '',
                        bio: course.instructor_bio || ''
                    },
                    category: {
                        id: course.category_id,
                        name: course.category_name || 'Uncategorized',
                        slug: course.category_slug || 'uncategorized'
                    },
                    modules: modulesWithLessons,
                    stats: {
                        activeEnrollments: course.active_enrollments || 0,
                        completions: course.completions || 0,
                        totalRevenue: course.total_revenue ? parseFloat(course.total_revenue) : 0,
                        completionRate: course.active_enrollments > 0
                            ? Math.round((course.completions / course.active_enrollments) * 100)
                            : 0,
                        averageRating: course.avg_rating ? parseFloat(course.avg_rating) : 0,
                        reviewCount: course.review_count || 0
                    }
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get course by ID error:', error);
            if (error instanceof NotFoundError || error instanceof ValidationError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch course details',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Create new course
     * POST /api/admin/courses
     */
    createCourse = async (req, res) => {
        console.log('🎯 CreateCourse endpoint hit!');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User from request:', req.user);
        try {
            // Handle both database and non-database scenarios
            if (!this.checkDatabaseConnection()) {
                console.log('⚠️ Database not connected, using mock response');
                // Store in memory for development
                const newCourse = {
                    id: Date.now(),
                    ...req.body,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                return res.json({
                    success: true,
                    data: newCourse,
                    message: 'Course created (in memory - database not connected)'
                });
            }
            console.log('✅ Database connected, proceeding with course creation');
            const { title, slug, description, thumbnail, category_id, price = 0, duration_hours = 1, difficulty_level = 'beginner', language = 'English', requirements, objectives, target_audience, modules } = req.body;
            // Validation
            if (!title || !description) {
                throw new ValidationError('Title and description are required');
            }
            if (price < 0) {
                throw new ValidationError('Price cannot be negative');
            }
            // Generate slug from title
            const courseSlug = (slug || title)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            // Check if slug already exists
            const [existingSlugs] = await this.getDatabase().execute('SELECT id FROM courses WHERE slug = ?', [courseSlug]);
            let finalSlug = courseSlug;
            if (existingSlugs.length > 0) {
                finalSlug = `${courseSlug}-${Date.now()}`;
            }
            // Check if user has an instructor profile, if not create one
            console.log('Checking instructor profile for user:', req.user);
            // Ensure we have a user ID
            const userId = req.user?.id || 1; // Default to admin user ID 1 if not set
            const [instructorCheck] = await this.getDatabase().execute('SELECT id FROM instructors WHERE user_id = ?', [userId]);
            let instructorId;
            if (instructorCheck.length === 0) {
                console.log('Creating instructor profile for user:', userId);
                // Create instructor profile
                const [instructorResult] = await this.getDatabase().execute(`INSERT INTO instructors (user_id, experience, status, created_at, updated_at) 
           VALUES (?, ?, ?, NOW(), NOW())`, [userId, 'System Administrator with LMS management experience', 'approved']);
                instructorId = instructorResult.insertId;
            }
            else {
                instructorId = instructorCheck[0].id;
            }
            console.log('Using instructor ID:', instructorId);
            // Insert course
            const insertQuery = `
        INSERT INTO courses (
          title, slug, description, thumbnail,
          instructor_id, category_id, price,
          duration_hours, level, language,
          course_requirements, course_objectives, target_audience,
          is_published, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
      `;
            const [result] = await this.getDatabase().execute(insertQuery, [
                title,
                finalSlug,
                description,
                thumbnail || null, // thumbnail
                instructorId,
                category_id || null,
                price,
                duration_hours,
                difficulty_level, // maps to 'level' column
                language,
                JSON.stringify(requirements ? [requirements] : []) || null, // course_requirements as JSON array
                JSON.stringify(objectives || []) || null, // course_objectives
                JSON.stringify(target_audience ? [target_audience] : []) || null // target_audience as JSON array
            ]);
            const courseId = result.insertId;
            // Log activity
            await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [req.user.id, 'course_created', 'course', courseId, `Created course: ${title}`]);
            // NOTE: No automatic enrollment happens when creating a course
            // Users must manually enroll or be enrolled by an admin
            // Create lessons directly (no modules table in current schema)
            if (modules && Array.isArray(modules)) {
                let lessonOrder = 1;
                for (const module of modules) {
                    // Create lessons for this module  
                    if (module.lessons && Array.isArray(module.lessons)) {
                        for (const lesson of module.lessons) {
                            // Generate slug for lesson
                            const lessonSlug = `${finalSlug}-lesson-${lessonOrder}`;
                            // Determine content type
                            const contentType = lesson.type || lesson.lesson_type || 'video';
                            // Insert lesson
                            const [lessonResult] = await this.getDatabase().execute(`INSERT INTO course_lessons (course_id, title, slug, description, 
                 video_url, duration_minutes, lesson_order, is_free_preview, content_type, 
                 created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                                courseId,
                                `${module.title}: ${lesson.title}`,
                                lessonSlug,
                                lesson.description || '',
                                lesson.video_url || null,
                                lesson.duration || 0,
                                lessonOrder++,
                                lesson.is_preview || false,
                                contentType
                            ]);
                            const lessonId = lessonResult.insertId;
                            // If this is a quiz lesson and has quiz data, create the quiz
                            if (contentType === 'quiz' && lesson.quiz) {
                                const quiz = lesson.quiz;
                                const questions = quiz.questions || [];
                                // Debug log to see what we're receiving
                                console.log('📝 Quiz data received:', JSON.stringify(quiz, null, 2));
                                // Prepare quiz questions in the correct format
                                const formattedQuestions = questions.map((q, index) => {
                                    // Check various possible field names for the question text
                                    // Frontend uses 'question_text' field
                                    const questionText = q.question_text || q.question || q.questionText || q.text || q.title || '';
                                    // Check various possible field names for the correct answer
                                    const correctAnswer = q.correctAnswer || q.correct_answer || q.answer || '';
                                    console.log(`Question ${index + 1}: "${questionText}" with answer: "${correctAnswer}"`);
                                    return {
                                        id: index + 1,
                                        question: questionText,
                                        type: q.type || 'single',
                                        options: q.options || [],
                                        correct_answer: correctAnswer,
                                        explanation: q.explanation || '',
                                        points: q.points || 10
                                    };
                                });
                                await this.getDatabase().execute(`INSERT INTO quizzes (
                    course_id, lesson_id, title, description, questions,
                    passing_score, time_limit_minutes, max_attempts, is_active,
                    created_at, updated_at
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`, [
                                    courseId,
                                    lessonId,
                                    quiz.title || `${lesson.title} Quiz`,
                                    quiz.description || `Quiz for ${lesson.title}`,
                                    JSON.stringify(formattedQuestions),
                                    quiz.passingScore || quiz.passing_score || 70,
                                    quiz.timeLimit || quiz.time_limit || 15,
                                    quiz.maxAttempts || quiz.max_attempts || 3
                                ]);
                                console.log(`✅ Created quiz for lesson ${lessonId} with ${formattedQuestions.length} questions`);
                                console.log('Quiz questions:', JSON.stringify(formattedQuestions, null, 2));
                            }
                        }
                    }
                }
            }
            res.status(201).json({
                success: true,
                message: 'Course created successfully',
                data: {
                    id: courseId,
                    title,
                    slug: finalSlug
                }
            });
        }
        catch (error) {
            console.error('❌ Create course error:', error);
            console.error('Error details:', {
                code: error.code,
                errno: error.errno,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState,
                stack: error instanceof Error ? error.stack : 'No stack'
            });
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            // Handle MySQL specific errors
            if (error.code === 'ER_NO_SUCH_TABLE') {
                return res.status(500).json({
                    success: false,
                    message: 'Database table missing. Please run migrations.',
                    error: error.sqlMessage
                });
            }
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                return res.status(500).json({
                    success: false,
                    message: 'Database column missing. Please check schema.',
                    error: error.sqlMessage
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to create course',
                error: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };
    /**
     * Update course
     * PUT /api/admin/courses/:id
     */
    updateCourse = async (req, res) => {
        try {
            const courseId = parseInt(req.params.id);
            if (!courseId) {
                throw new ValidationError('Invalid course ID');
            }
            // Check if course exists
            const [existingCourse] = await this.getDatabase().execute('SELECT id, title, slug FROM courses WHERE id = ?', [courseId]);
            if (existingCourse.length === 0) {
                throw new NotFoundError('Course not found');
            }
            const { title, description, shortDescription, thumbnail, previewVideo, instructorId, categoryId, price, originalPrice, currency, level, durationHours, durationMinutes, language, tags, learningOutcomes, requirements, targetAudience, features, isPublished, isFeatured, isFree, metaTitle, metaDescription } = req.body;
            // Build update query dynamically
            const updateFields = [];
            const updateParams = [];
            if (title !== undefined) {
                updateFields.push('title = ?');
                updateParams.push(title);
                // Update slug if title changed
                if (title !== existingCourse[0].title) {
                    const newSlug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                    updateFields.push('slug = ?');
                    updateParams.push(newSlug);
                }
            }
            if (description !== undefined) {
                updateFields.push('description = ?');
                updateParams.push(description);
            }
            if (shortDescription !== undefined) {
                updateFields.push('short_description = ?');
                updateParams.push(shortDescription);
            }
            if (thumbnail !== undefined) {
                updateFields.push('thumbnail = ?');
                updateParams.push(thumbnail);
            }
            if (previewVideo !== undefined) {
                updateFields.push('preview_video = ?');
                updateParams.push(previewVideo);
            }
            if (instructorId !== undefined) {
                // Verify instructor exists
                const [instructors] = await this.getDatabase().execute('SELECT id FROM instructors WHERE id = ?', [instructorId]);
                if (instructors.length === 0) {
                    throw new ValidationError('Invalid instructor ID');
                }
                updateFields.push('instructor_id = ?');
                updateParams.push(instructorId);
            }
            if (categoryId !== undefined) {
                // Verify category exists
                const [categories] = await this.getDatabase().execute('SELECT id FROM course_categories WHERE id = ?', [categoryId]);
                if (categories.length === 0) {
                    throw new ValidationError('Invalid category ID');
                }
                updateFields.push('category_id = ?');
                updateParams.push(categoryId);
            }
            if (price !== undefined) {
                if (price < 0) {
                    throw new ValidationError('Price cannot be negative');
                }
                updateFields.push('price = ?');
                updateParams.push(price);
            }
            if (originalPrice !== undefined) {
                updateFields.push('original_price = ?');
                updateParams.push(originalPrice);
            }
            if (currency !== undefined) {
                updateFields.push('currency = ?');
                updateParams.push(currency);
            }
            if (level !== undefined) {
                updateFields.push('level = ?');
                updateParams.push(level);
            }
            if (durationHours !== undefined) {
                updateFields.push('duration_hours = ?');
                updateParams.push(durationHours);
            }
            if (durationMinutes !== undefined) {
                updateFields.push('duration_minutes = ?');
                updateParams.push(durationMinutes);
            }
            if (language !== undefined) {
                updateFields.push('language = ?');
                updateParams.push(language);
            }
            if (tags !== undefined) {
                updateFields.push('tags = ?');
                updateParams.push(tags ? JSON.stringify(tags) : null);
            }
            if (learningOutcomes !== undefined) {
                updateFields.push('learning_outcomes = ?');
                updateParams.push(learningOutcomes ? JSON.stringify(learningOutcomes) : null);
            }
            if (requirements !== undefined) {
                updateFields.push('requirements = ?');
                updateParams.push(requirements ? JSON.stringify(requirements) : null);
            }
            if (targetAudience !== undefined) {
                updateFields.push('target_audience = ?');
                updateParams.push(targetAudience ? JSON.stringify(targetAudience) : null);
            }
            if (features !== undefined) {
                updateFields.push('features = ?');
                updateParams.push(features ? JSON.stringify(features) : null);
            }
            if (isPublished !== undefined) {
                updateFields.push('is_published = ?');
                updateParams.push(isPublished);
                if (isPublished && !existingCourse[0].is_published) {
                    updateFields.push('publish_date = NOW()');
                }
            }
            if (isFeatured !== undefined) {
                updateFields.push('is_featured = ?');
                updateParams.push(isFeatured);
            }
            if (isFree !== undefined) {
                updateFields.push('is_free = ?');
                updateParams.push(isFree);
            }
            if (metaTitle !== undefined) {
                updateFields.push('meta_title = ?');
                updateParams.push(metaTitle);
            }
            if (metaDescription !== undefined) {
                updateFields.push('meta_description = ?');
                updateParams.push(metaDescription);
            }
            if (updateFields.length === 0) {
                throw new ValidationError('No fields to update');
            }
            updateFields.push('updated_at = NOW()');
            updateFields.push('last_updated = NOW()');
            const updateQuery = `
        UPDATE courses 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
            await this.getDatabase().execute(updateQuery, [...updateParams, courseId]);
            // Log activity
            await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [req.user.id, 'course_updated', 'course', courseId, `Updated course: ${title || existingCourse[0].title}`]);
            res.json({
                success: true,
                message: 'Course updated successfully',
                data: {
                    id: courseId
                }
            });
        }
        catch (error) {
            console.error('Update course error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to update course',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Delete course
     * DELETE /api/admin/courses/:id
     */
    deleteCourse = async (req, res) => {
        try {
            const courseId = parseInt(req.params.id);
            if (!courseId) {
                throw new ValidationError('Invalid course ID');
            }
            // Check if user has admin role (extra security layer)
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Only administrators can delete courses'
                });
            }
            // Check if course exists and get details
            const [existingCourse] = await this.getDatabase().execute('SELECT id, title FROM courses WHERE id = ?', [courseId]);
            if (existingCourse.length === 0) {
                throw new NotFoundError('Course not found');
            }
            const course = existingCourse[0];
            // Get enrollment count for logging purposes only
            const [enrollments] = await this.getDatabase().execute('SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?', [courseId]);
            console.log(`Deleting course ${courseId} with ${enrollments[0].count} enrollments`);
            // Start transaction using query() instead of execute()
            await this.getDatabase().query('START TRANSACTION');
            try {
                // Delete related data in order (due to foreign key constraints)
                // Delete lesson progress first
                await this.getDatabase().execute('DELETE FROM lesson_progress WHERE lesson_id IN (SELECT id FROM course_lessons WHERE course_id = ?)', [courseId]);
                // Delete course progress
                await this.getDatabase().execute('DELETE FROM course_progress WHERE course_id = ?', [courseId]);
                // Delete quiz attempts
                await this.getDatabase().execute('DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id = ?)', [courseId]);
                // Delete quizzes
                await this.getDatabase().execute('DELETE FROM quizzes WHERE course_id = ?', [courseId]);
                // Delete course lessons
                await this.getDatabase().execute('DELETE FROM course_lessons WHERE course_id = ?', [courseId]);
                // Delete course reviews
                await this.getDatabase().execute('DELETE FROM course_reviews WHERE course_id = ?', [courseId]);
                // Delete user favorites
                await this.getDatabase().execute('DELETE FROM user_favorites WHERE course_id = ?', [courseId]);
                // Delete certificates
                await this.getDatabase().execute('DELETE FROM certificates WHERE course_id = ?', [courseId]);
                // Delete enrollments (including active ones if force delete)
                await this.getDatabase().execute('DELETE FROM enrollments WHERE course_id = ?', [courseId]);
                // Finally delete the course
                await this.getDatabase().execute('DELETE FROM courses WHERE id = ?', [courseId]);
                // Log activity
                await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [req.user.id, 'course_deleted', 'course', courseId, `Deleted course: ${course.title}`]);
                await this.getDatabase().query('COMMIT');
                res.json({
                    success: true,
                    message: 'Course deleted successfully'
                });
            }
            catch (error) {
                await this.getDatabase().query('ROLLBACK');
                throw error;
            }
        }
        catch (error) {
            console.error('Delete course error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete course',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Toggle course publish status
     * PATCH /api/admin/courses/:id/publish
     */
    togglePublishStatus = async (req, res) => {
        try {
            const courseId = parseInt(req.params.id);
            const { is_published } = req.body;
            if (!courseId) {
                throw new ValidationError('Invalid course ID');
            }
            // Check if course exists
            const [existingCourse] = await this.getDatabase().execute('SELECT id, title, is_published FROM courses WHERE id = ?', [courseId]);
            if (existingCourse.length === 0) {
                throw new NotFoundError('Course not found');
            }
            const course = existingCourse[0];
            // Toggle publish status
            const newStatus = is_published !== undefined ? is_published : !course.is_published;
            await this.getDatabase().execute('UPDATE courses SET is_published = ?, updated_at = NOW() WHERE id = ?', [newStatus, courseId]);
            // Log activity
            await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [req.user.id, newStatus ? 'course_published' : 'course_unpublished', 'course', courseId, `${newStatus ? 'Published' : 'Unpublished'} course: ${course.title}`]);
            res.json({
                success: true,
                message: `Course ${newStatus ? 'published' : 'unpublished'} successfully`,
                data: {
                    id: courseId,
                    is_published: newStatus
                }
            });
        }
        catch (error) {
            console.error('Toggle publish status error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to toggle publish status',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Duplicate course
     * POST /api/admin/courses/:id/duplicate
     */
    duplicateCourse = async (req, res) => {
        try {
            const courseId = parseInt(req.params.id);
            if (!courseId) {
                throw new ValidationError('Invalid course ID');
            }
            // Check if course exists and get its data
            const [existingCourse] = await this.getDatabase().execute('SELECT * FROM courses WHERE id = ?', [courseId]);
            if (existingCourse.length === 0) {
                throw new NotFoundError('Course not found');
            }
            const course = existingCourse[0];
            // Generate new slug
            const newSlug = `${course.slug}-copy-${Date.now()}`;
            const newTitle = `${course.title} (Copy)`;
            // Insert duplicate course
            const insertQuery = `
        INSERT INTO courses (
          title, slug, description, thumbnail,
          instructor_id, category_id, price, discount_price,
          duration_hours, level, language,
          course_requirements, course_objectives, target_audience,
          is_published, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
      `;
            const [result] = await this.getDatabase().execute(insertQuery, [
                newTitle,
                newSlug,
                course.description,
                course.thumbnail,
                course.instructor_id,
                course.category_id,
                course.price,
                course.discount_price,
                course.duration_hours,
                course.level,
                course.language,
                course.course_requirements,
                course.course_objectives,
                course.target_audience
            ]);
            const newCourseId = result.insertId;
            // Copy lessons if any exist
            const [lessons] = await this.getDatabase().execute('SELECT * FROM course_lessons WHERE course_id = ?', [courseId]);
            for (const lesson of lessons) {
                await this.getDatabase().execute(`INSERT INTO course_lessons (course_id, title, slug, description, 
           video_url, duration_minutes, lesson_order, is_free_preview, content_type, 
           created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                    newCourseId,
                    lesson.title,
                    `${newSlug}-lesson-${lesson.lesson_order}`,
                    lesson.description,
                    lesson.video_url,
                    lesson.duration_minutes,
                    lesson.lesson_order,
                    lesson.is_free_preview,
                    lesson.content_type
                ]);
            }
            // Log activity
            await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [req.user.id, 'course_duplicated', 'course', newCourseId, `Duplicated course: ${course.title} -> ${newTitle}`]);
            res.status(201).json({
                success: true,
                message: 'Course duplicated successfully',
                data: {
                    id: newCourseId,
                    title: newTitle,
                    slug: newSlug,
                    originalId: courseId
                }
            });
        }
        catch (error) {
            console.error('Duplicate course error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to duplicate course',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Approve course
     * POST /api/admin/courses/:id/approve
     */
    approveCourse = async (req, res) => {
        try {
            const courseId = parseInt(req.params.id);
            if (!courseId) {
                throw new ValidationError('Invalid course ID');
            }
            // Check if course exists
            const [existingCourse] = await this.getDatabase().execute('SELECT id, title, is_published FROM courses WHERE id = ?', [courseId]);
            if (existingCourse.length === 0) {
                throw new NotFoundError('Course not found');
            }
            const course = existingCourse[0];
            if (course.is_published) {
                throw new ValidationError('Course is already published');
            }
            // Approve and publish the course
            await this.getDatabase().execute('UPDATE courses SET is_published = 1, publish_date = NOW(), updated_at = NOW() WHERE id = ?', [courseId]);
            // Log activity
            await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [req.user.id, 'course_approved', 'course', courseId, `Approved and published course: ${course.title}`]);
            res.json({
                success: true,
                message: 'Course approved and published successfully'
            });
        }
        catch (error) {
            console.error('Approve course error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to approve course',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Reject course
     * POST /api/admin/courses/:id/reject
     */
    rejectCourse = async (req, res) => {
        try {
            const courseId = parseInt(req.params.id);
            const { reason } = req.body;
            if (!courseId) {
                throw new ValidationError('Invalid course ID');
            }
            // Check if course exists
            const [existingCourse] = await this.getDatabase().execute('SELECT id, title, is_published FROM courses WHERE id = ?', [courseId]);
            if (existingCourse.length === 0) {
                throw new NotFoundError('Course not found');
            }
            const course = existingCourse[0];
            if (course.is_published) {
                throw new ValidationError('Cannot reject a published course');
            }
            // Reject the course (unpublish)
            await this.getDatabase().execute('UPDATE courses SET is_published = 0, updated_at = NOW() WHERE id = ?', [courseId]);
            // Log activity with reason
            await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [
                req.user.id,
                'course_rejected',
                'course',
                courseId,
                `Rejected course: ${course.title}`,
                JSON.stringify({ reason: reason || 'No reason provided' })
            ]);
            res.json({
                success: true,
                message: 'Course rejected successfully'
            });
        }
        catch (error) {
            console.error('Reject course error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to reject course',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Bulk actions on courses
     * POST /api/admin/courses/bulk-action
     */
    bulkAction = async (req, res) => {
        try {
            const { action, courseIds } = req.body;
            if (!action || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
                throw new ValidationError('Action and course IDs are required');
            }
            // Check if user has admin role for delete actions (extra security layer)
            if (action === 'delete' && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Only administrators can delete courses'
                });
            }
            const validActions = ['delete', 'archive', 'publish', 'unpublish', 'feature', 'unfeature'];
            if (!validActions.includes(action)) {
                throw new ValidationError('Invalid action');
            }
            // Validate all course IDs exist
            const placeholders = courseIds.map(() => '?').join(',');
            const [existingCourses] = await this.getDatabase().execute(`SELECT id, title FROM courses WHERE id IN (${placeholders})`, courseIds);
            if (existingCourses.length !== courseIds.length) {
                throw new ValidationError('Some courses were not found');
            }
            let query = '';
            let successMessage = '';
            switch (action) {
                case 'delete':
                    // Check for active enrollments first
                    const [enrollmentCheck] = await this.getDatabase().execute(`SELECT course_id, COUNT(*) as count FROM enrollments WHERE course_id IN (${placeholders}) AND is_active = 1 GROUP BY course_id`, courseIds);
                    if (enrollmentCheck.length > 0) {
                        throw new ValidationError('Cannot delete courses with active enrollments');
                    }
                    // Start transaction for bulk delete
                    await this.getDatabase().execute('START TRANSACTION');
                    try {
                        // Delete related data for all courses
                        await this.getDatabase().execute(`DELETE FROM lesson_resources WHERE lesson_id IN (SELECT id FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id IN (${placeholders})))`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id IN (${placeholders}))`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id IN (${placeholders}))`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM quizzes WHERE course_id IN (${placeholders})`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM progress WHERE course_id IN (${placeholders})`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id IN (${placeholders}))`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM modules WHERE course_id IN (${placeholders})`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM course_reviews WHERE course_id IN (${placeholders})`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM enrollments WHERE course_id IN (${placeholders})`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM certificates WHERE course_id IN (${placeholders})`, courseIds);
                        await this.getDatabase().execute(`DELETE FROM courses WHERE id IN (${placeholders})`, courseIds);
                        await this.getDatabase().execute('COMMIT');
                        successMessage = `${courseIds.length} courses deleted successfully`;
                    }
                    catch (error) {
                        await this.getDatabase().execute('ROLLBACK');
                        throw error;
                    }
                    break;
                case 'publish':
                    query = `UPDATE courses SET is_published = 1, publish_date = NOW(), updated_at = NOW() WHERE id IN (${placeholders})`;
                    successMessage = `${courseIds.length} courses published successfully`;
                    break;
                case 'unpublish':
                    query = `UPDATE courses SET is_published = 0, updated_at = NOW() WHERE id IN (${placeholders})`;
                    successMessage = `${courseIds.length} courses unpublished successfully`;
                    break;
                case 'feature':
                    query = `UPDATE courses SET is_featured = 1, updated_at = NOW() WHERE id IN (${placeholders})`;
                    successMessage = `${courseIds.length} courses featured successfully`;
                    break;
                case 'unfeature':
                    query = `UPDATE courses SET is_featured = 0, updated_at = NOW() WHERE id IN (${placeholders})`;
                    successMessage = `${courseIds.length} courses unfeatured successfully`;
                    break;
                case 'archive':
                    query = `UPDATE courses SET is_published = 0, updated_at = NOW() WHERE id IN (${placeholders})`;
                    successMessage = `${courseIds.length} courses archived successfully`;
                    break;
            }
            if (query && action !== 'delete') {
                await this.getDatabase().execute(query, courseIds);
            }
            // Log bulk activity
            const courseNames = existingCourses.map((c) => c.title).join(', ');
            await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [
                req.user.id,
                `bulk_${action}`,
                'course',
                `Bulk ${action} on courses: ${courseNames}`,
                JSON.stringify({ courseIds, action })
            ]);
            res.json({
                success: true,
                message: successMessage,
                data: {
                    action,
                    affectedCourses: courseIds.length
                }
            });
        }
        catch (error) {
            console.error('Bulk action error:', error);
            if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to perform bulk action',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
}
export default AdminCoursesController;
//# sourceMappingURL=AdminCoursesController.js.map
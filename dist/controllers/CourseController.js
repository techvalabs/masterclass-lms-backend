import { db } from '@/config/database.js';
import VideoAnalyzer from '@/utils/videoAnalyzer.js';
import path from 'path';
import fs from 'fs';
export class CourseController {
    // Get all categories
    getCategories = async (req, res) => {
        try {
            const categories = await db.query(`
        SELECT id, name, slug, description
        FROM course_categories 
        ORDER BY name ASC
      `);
            // Transform categories to match frontend expectation
            const categoryNames = categories.map(category => category.name);
            res.json({
                success: true,
                data: categoryNames,
                message: 'Categories retrieved successfully'
            });
        }
        catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch categories',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };
    // Placeholder methods to get server running
    getCourses = async (req, res) => {
        try {
            const pool = db.getPool();
            if (!pool) {
                return res.status(503).json({
                    success: false,
                    message: 'Database connection not available'
                });
            }
            // Get all published courses with instructor and category details
            const [courses] = await pool.execute(`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.thumbnail,
          c.price,
          c.discount_price,
          c.level,
          c.duration_hours,
          c.language,
          c.rating,
          c.total_students,
          c.total_lessons,
          c.total_reviews,
          c.is_published,
          c.is_featured,
          c.created_at,
          c.updated_at,
          u.name as instructor_name,
          u.email as instructor_email,
          u.avatar as instructor_avatar,
          cc.name as category_name
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id  
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE c.is_published = TRUE
        ORDER BY c.created_at DESC
      `);
            // Transform to match frontend Course type
            const transformedCourses = courses.map(course => ({
                id: course.id.toString(),
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail ? `http://localhost:3002${course.thumbnail}` : '/api/placeholder/course.jpg',
                category: course.category_name || 'Uncategorized',
                level: course.level,
                duration: `${course.duration_hours}h`,
                price: parseFloat(course.price),
                originalPrice: course.discount_price ? parseFloat(course.price) : null,
                isPaid: parseFloat(course.price) > 0,
                rating: course.rating || 0,
                studentsCount: course.total_students || 0,
                instructor: {
                    id: course.instructor_id || 1,
                    name: course.instructor_name || 'Unknown Instructor',
                    email: course.instructor_email || '',
                    avatar: course.instructor_avatar ? `http://localhost:3002${course.instructor_avatar}` : '/api/placeholder/avatar.jpg'
                },
                totalLessons: course.total_lessons || 0,
                isFeatured: !!course.is_featured,
                createdAt: course.created_at,
                updatedAt: course.updated_at
            }));
            res.json({
                success: true,
                data: transformedCourses,
                pagination: {
                    page: 1,
                    limit: 50,
                    total: transformedCourses.length,
                    totalPages: 1
                }
            });
        }
        catch (error) {
            console.error('Error fetching courses:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch courses',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };
    searchCourses = async (req, res) => {
        res.json({
            success: true,
            message: 'searchCourses endpoint - placeholder',
            data: []
        });
    };
    getFeaturedCourses = async (req, res) => {
        res.json({
            success: true,
            message: 'getFeaturedCourses endpoint - placeholder',
            data: []
        });
    };
    getFreeCourses = async (req, res) => {
        res.json({
            success: true,
            message: 'getFreeCourses endpoint - placeholder',
            data: []
        });
    };
    getCoursesByCategory = async (req, res) => {
        res.json({
            success: true,
            message: 'getCoursesByCategory endpoint - placeholder',
            data: []
        });
    };
    getCourseById = async (req, res) => {
        res.json({
            success: true,
            message: 'getCourseById endpoint - placeholder',
            data: null
        });
    };
    getCoursePreview = async (req, res) => {
        res.json({
            success: true,
            message: 'getCoursePreview endpoint - placeholder',
            data: null
        });
    };
    getCourseModules = async (req, res) => {
        res.json({
            success: true,
            message: 'getCourseModules endpoint - placeholder',
            data: []
        });
    };
    getCourseReviews = async (req, res) => {
        res.json({
            success: true,
            message: 'getCourseReviews endpoint - placeholder',
            data: []
        });
    };
    enrollInCourse = async (req, res) => {
        res.json({
            success: true,
            message: 'enrollInCourse endpoint - placeholder'
        });
    };
    getEnrollmentStatus = async (req, res) => {
        res.json({
            success: true,
            message: 'getEnrollmentStatus endpoint - placeholder',
            data: { enrolled: false }
        });
    };
    getCourseContent = async (req, res) => {
        res.json({
            success: true,
            message: 'getCourseContent endpoint - placeholder',
            data: []
        });
    };
    getLesson = async (req, res) => {
        res.json({
            success: true,
            message: 'getLesson endpoint - placeholder',
            data: null
        });
    };
    updateLessonProgress = async (req, res) => {
        res.json({
            success: true,
            message: 'updateLessonProgress endpoint - placeholder'
        });
    };
    getCourseProgress = async (req, res) => {
        res.json({
            success: true,
            message: 'getCourseProgress endpoint - placeholder',
            data: { progress: 0 }
        });
    };
    addCourseReview = async (req, res) => {
        res.json({
            success: true,
            message: 'addCourseReview endpoint - placeholder'
        });
    };
    updateCourseReview = async (req, res) => {
        res.json({
            success: true,
            message: 'updateCourseReview endpoint - placeholder'
        });
    };
    deleteCourseReview = async (req, res) => {
        res.json({
            success: true,
            message: 'deleteCourseReview endpoint - placeholder'
        });
    };
    getCertificate = async (req, res) => {
        res.json({
            success: true,
            message: 'getCertificate endpoint - placeholder',
            data: null
        });
    };
    downloadResource = async (req, res) => {
        res.json({
            success: true,
            message: 'downloadResource endpoint - placeholder'
        });
    };
    createCourse = async (req, res) => {
        res.json({
            success: true,
            message: 'createCourse endpoint - placeholder'
        });
    };
    updateCourse = async (req, res) => {
        res.json({
            success: true,
            message: 'updateCourse endpoint - placeholder'
        });
    };
    deleteCourse = async (req, res) => {
        res.json({
            success: true,
            message: 'deleteCourse endpoint - placeholder'
        });
    };
    toggleCoursePublication = async (req, res) => {
        res.json({
            success: true,
            message: 'toggleCoursePublication endpoint - placeholder'
        });
    };
    getCourseAnalytics = async (req, res) => {
        res.json({
            success: true,
            message: 'getCourseAnalytics endpoint - placeholder',
            data: {}
        });
    };
    getCourseEnrollments = async (req, res) => {
        res.json({
            success: true,
            message: 'getCourseEnrollments endpoint - placeholder',
            data: []
        });
    };
    getAllCoursesAdmin = async (req, res) => {
        res.json({
            success: true,
            message: 'getAllCoursesAdmin endpoint - placeholder',
            data: []
        });
    };
    toggleCourseFeatured = async (req, res) => {
        res.json({
            success: true,
            message: 'toggleCourseFeatured endpoint - placeholder'
        });
    };
    bulkCourseAction = async (req, res) => {
        res.json({
            success: true,
            message: 'bulkCourseAction endpoint - placeholder'
        });
    };
    // Analyze videos and suggest pricing
    analyzeVideosForPricing = async (req, res) => {
        try {
            const { modules } = req.body;
            if (!modules || !Array.isArray(modules)) {
                return res.status(400).json({
                    success: false,
                    message: 'Modules data is required'
                });
            }
            // Transform modules data for analysis
            const modulesForAnalysis = modules.map((module) => ({
                id: module.id,
                lessons: module.lessons.map((lesson) => {
                    // Construct video path if video was uploaded
                    let videoPath;
                    if (lesson.video_filename) {
                        videoPath = path.join(process.cwd(), 'uploads', 'videos', lesson.video_filename);
                        if (!fs.existsSync(videoPath)) {
                            videoPath = undefined;
                        }
                    }
                    return {
                        id: lesson.id,
                        videoPath,
                        estimatedDuration: lesson.duration || 10 // fallback to 10 minutes
                    };
                })
            }));
            // Analyze course content
            const analysis = await VideoAnalyzer.analyzeCourseContent(modulesForAnalysis);
            // Generate pricing tiers
            const pricingTiers = VideoAnalyzer.generatePricingTiers(analysis.pricingSuggestion);
            res.json({
                success: true,
                data: {
                    analysis,
                    pricingTiers,
                    autoDetected: {
                        duration: analysis.totalDuration,
                        durationFormatted: analysis.totalDurationFormatted,
                        price: analysis.pricingSuggestion.recommendedPrice,
                        isFree: analysis.pricingSuggestion.isFree,
                        difficulty: analysis.difficultyEstimate
                    }
                }
            });
        }
        catch (error) {
            console.error('Error analyzing videos:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze videos',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };
}
//# sourceMappingURL=CourseController.js.map
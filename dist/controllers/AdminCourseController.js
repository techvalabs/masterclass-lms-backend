import { db } from '@/config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = path.join(process.cwd(), 'uploads');
        if (file.fieldname === 'thumbnail') {
            uploadPath = path.join(uploadPath, 'thumbnails');
        }
        else if (file.fieldname === 'video') {
            uploadPath = path.join(uploadPath, 'videos');
        }
        else {
            uploadPath = path.join(uploadPath, 'resources');
        }
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
export const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max file size
    }
});
export class AdminCourseController {
    // Get all courses for admin
    getAllCourses = async (req, res) => {
        try {
            const courses = await db.query(`
        SELECT 
          c.id,
          c.title,
          c.slug,
          c.price,
          c.discount_price,
          c.thumbnail,
          c.duration_hours,
          c.difficulty_level,
          c.is_published,
          c.is_featured,
          c.created_at,
          cat.name as category_name,
          u.name as instructor_name,
          COUNT(DISTINCT e.id) as enrollment_count
        FROM courses c
        LEFT JOIN course_categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);
            res.json({
                success: true,
                data: courses
            });
        }
        catch (error) {
            console.error('Error fetching courses:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch courses'
            });
        }
    };
    // Create a new course
    createCourse = async (req, res) => {
        try {
            const userId = req.user?.id;
            const { title, slug, description, short_description, category_id, price, discount_price, duration_hours, difficulty_level, language, requirements, objectives, target_audience } = req.body;
            // Generate slug if not provided
            const courseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            // Get thumbnail path if uploaded
            const thumbnailPath = req.file ? `/uploads/thumbnails/${req.file.filename}` : null;
            // Insert course into database
            const result = await db.query(`INSERT INTO courses (
          title, 
          slug, 
          description, 
          short_description,
          category_id, 
          instructor_id,
          price, 
          discount_price,
          duration_hours,
          difficulty_level,
          language,
          requirements,
          objectives,
          target_audience,
          thumbnail,
          is_published,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                title,
                courseSlug,
                description,
                short_description,
                category_id || null,
                userId, // Current user as instructor
                price || 0,
                discount_price || null,
                duration_hours || 1,
                difficulty_level || 'beginner',
                language || 'English',
                requirements || '',
                objectives || '[]',
                target_audience || '',
                thumbnailPath,
                false // Start as unpublished
            ]);
            const courseId = result.insertId;
            res.json({
                success: true,
                data: {
                    id: courseId,
                    slug: courseSlug
                },
                message: 'Course created successfully'
            });
        }
        catch (error) {
            console.error('Error creating course:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create course',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };
    // Create module for a course
    createModule = async (req, res) => {
        try {
            const { courseId } = req.params;
            const { title, description, display_order } = req.body;
            const result = await db.query(`INSERT INTO course_modules (
          course_id,
          title,
          description,
          display_order,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW())`, [courseId, title, description || '', display_order || 1]);
            const moduleId = result.insertId;
            res.json({
                success: true,
                data: { id: moduleId }
            });
        }
        catch (error) {
            console.error('Error creating module:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create module'
            });
        }
    };
    // Create lesson for a module
    createLesson = async (req, res) => {
        try {
            const { courseId, moduleId } = req.params;
            const { title, description, lesson_type, duration, is_preview, display_order, content } = req.body;
            const result = await db.query(`INSERT INTO course_lessons (
          course_id,
          module_id,
          title,
          description,
          lesson_type,
          duration,
          is_preview,
          display_order,
          content,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                courseId,
                moduleId,
                title,
                description || '',
                lesson_type || 'video',
                duration || 0,
                is_preview || false,
                display_order || 1,
                content || ''
            ]);
            const lessonId = result.insertId;
            res.json({
                success: true,
                data: { id: lessonId }
            });
        }
        catch (error) {
            console.error('Error creating lesson:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create lesson'
            });
        }
    };
    // Upload video for a lesson
    uploadLessonVideo = async (req, res) => {
        try {
            const { courseId, lessonId } = req.params;
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No video file uploaded'
                });
            }
            const videoPath = `/uploads/videos/${req.file.filename}`;
            // Insert video record
            await db.query(`INSERT INTO video_files (
          lesson_id,
          course_id,
          filename,
          original_name,
          file_path,
          file_size,
          mime_type,
          storage_type,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'local', NOW())`, [
                lessonId,
                courseId,
                req.file.filename,
                req.file.originalname,
                videoPath,
                req.file.size,
                req.file.mimetype
            ]);
            // Update lesson with video URL
            await db.query(`UPDATE course_lessons SET video_url = ? WHERE id = ?`, [videoPath, lessonId]);
            res.json({
                success: true,
                data: {
                    videoPath,
                    filename: req.file.filename
                }
            });
        }
        catch (error) {
            console.error('Error uploading video:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload video'
            });
        }
    };
    // Create quiz for a lesson
    createQuiz = async (req, res) => {
        try {
            const { courseId, lessonId } = req.params;
            const { title, description, questions, passing_score, time_limit } = req.body;
            // Insert quiz
            const quizResult = await db.query(`INSERT INTO quizzes (
          course_id,
          lesson_id,
          title,
          description,
          passing_score,
          time_limit,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                courseId,
                lessonId,
                title,
                description || '',
                passing_score || 70,
                time_limit || null
            ]);
            const quizId = quizResult.insertId;
            // Insert questions
            if (questions && Array.isArray(questions)) {
                for (const question of questions) {
                    const questionResult = await db.query(`INSERT INTO quiz_questions (
              quiz_id,
              question_text,
              question_type,
              correct_answer,
              options,
              explanation,
              points,
              display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                        quizId,
                        question.question_text,
                        question.question_type || 'multiple_choice',
                        question.correct_answer,
                        JSON.stringify(question.options || []),
                        question.explanation || '',
                        question.points || 1,
                        question.display_order || 1
                    ]);
                }
            }
            res.json({
                success: true,
                data: { id: quizId }
            });
        }
        catch (error) {
            console.error('Error creating quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create quiz'
            });
        }
    };
    // Update course
    updateCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;
            // Build dynamic update query
            const fields = Object.keys(updates);
            const values = Object.values(updates);
            if (fields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No fields to update'
                });
            }
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            await db.query(`UPDATE courses SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
            res.json({
                success: true,
                message: 'Course updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating course:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update course'
            });
        }
    };
    // Delete course
    deleteCourse = async (req, res) => {
        try {
            const { id } = req.params;
            // Soft delete
            await db.query(`UPDATE courses SET deleted_at = NOW() WHERE id = ?`, [id]);
            res.json({
                success: true,
                message: 'Course deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting course:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete course'
            });
        }
    };
    // Toggle course publication
    togglePublication = async (req, res) => {
        try {
            const { id } = req.params;
            await db.query(`UPDATE courses SET is_published = NOT is_published WHERE id = ?`, [id]);
            res.json({
                success: true,
                message: 'Course publication status toggled'
            });
        }
        catch (error) {
            console.error('Error toggling publication:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle publication'
            });
        }
    };
    // Get course statistics
    getCourseStats = async (req, res) => {
        try {
            const stats = await db.query(`
        SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN is_published = 1 THEN 1 END) as published_courses,
          COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_courses,
          COUNT(CASE WHEN price = 0 THEN 1 END) as free_courses,
          AVG(price) as average_price
        FROM courses
        WHERE deleted_at IS NULL
      `);
            res.json({
                success: true,
                data: stats[0]
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics'
            });
        }
    };
}
//# sourceMappingURL=AdminCourseController.js.map
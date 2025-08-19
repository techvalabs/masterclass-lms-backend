-- ===========================================
-- Video and Quiz Enhancement Migration
-- Version: 1.0
-- Date: 2025-08-16
-- ===========================================

-- ===========================================
-- VIDEO MANAGEMENT TABLES
-- ===========================================

-- Video Files Table (for storing video metadata)
CREATE TABLE IF NOT EXISTS video_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT,
    course_id INT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    duration_seconds INT,
    resolution VARCHAR(20),
    format VARCHAR(20),
    storage_path VARCHAR(500),
    storage_type ENUM('local', 'cloudinary', 's3', 'youtube', 'vimeo') DEFAULT 'local',
    external_id VARCHAR(255), -- For external storage IDs
    thumbnail_path VARCHAR(500),
    status ENUM('uploading', 'processing', 'ready', 'failed') DEFAULT 'uploading',
    processing_progress INT DEFAULT 0,
    error_message TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status)
);

-- Video Watch Progress
CREATE TABLE IF NOT EXISTS video_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    video_id INT NOT NULL,
    lesson_id INT NOT NULL,
    course_id INT NOT NULL,
    watch_time_seconds INT DEFAULT 0,
    total_duration_seconds INT,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_position_seconds INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES video_files(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_video (user_id, video_id),
    INDEX idx_user_course (user_id, course_id)
);

-- ===========================================
-- ENHANCED QUIZ TABLES
-- ===========================================

-- Update existing quizzes table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS quiz_type ENUM('lesson', 'module', 'final') DEFAULT 'lesson',
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_correct_answers BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS certificate_required BOOLEAN DEFAULT FALSE;

-- Quiz Questions Table (separate from JSON storage)
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank', 'essay', 'matching') DEFAULT 'multiple_choice',
    options JSON, -- For multiple choice options
    correct_answer JSON, -- Can be string, array, or object depending on type
    explanation TEXT,
    points INT DEFAULT 1,
    display_order INT DEFAULT 0,
    media_url VARCHAR(500),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_display_order (display_order)
);

-- Quiz Attempt Answers (detailed answer tracking)
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer JSON,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned DECIMAL(5,2) DEFAULT 0.00,
    time_spent_seconds INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    INDEX idx_attempt_id (attempt_id),
    INDEX idx_question_id (question_id)
);

-- ===========================================
-- COURSE CONTENT ORGANIZATION
-- ===========================================

-- Course Modules/Sections
CREATE TABLE IF NOT EXISTS course_modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_display_order (display_order)
);

-- Update course_lessons to support modules
ALTER TABLE course_lessons 
ADD COLUMN IF NOT EXISTS module_id INT,
ADD COLUMN IF NOT EXISTS lesson_type ENUM('video', 'text', 'quiz', 'assignment', 'live') DEFAULT 'video',
ADD COLUMN IF NOT EXISTS estimated_duration INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS attachments JSON,
ADD CONSTRAINT fk_module_id FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE SET NULL;

-- ===========================================
-- FILE UPLOADS (for course materials)
-- ===========================================

CREATE TABLE IF NOT EXISTS course_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    lesson_id INT,
    module_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_type ENUM('pdf', 'doc', 'ppt', 'zip', 'image', 'other') DEFAULT 'other',
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    download_count INT DEFAULT 0,
    is_downloadable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_lesson_id (lesson_id)
);

-- ===========================================
-- COURSE BUILDER DRAFTS
-- ===========================================

CREATE TABLE IF NOT EXISTS course_drafts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    instructor_id INT NOT NULL,
    course_id INT,
    draft_data JSON NOT NULL,
    current_step VARCHAR(50),
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_course_id (course_id)
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_video_files_status ON video_files(status);
CREATE INDEX IF NOT EXISTS idx_video_progress_user ON video_progress(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON quiz_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_course_materials_type ON course_materials(file_type);

-- ===========================================
-- DEFAULT DATA
-- ===========================================

-- Add sample course modules for existing courses
INSERT INTO course_modules (course_id, title, description, display_order) 
SELECT 
    id,
    'Module 1: Introduction',
    'Getting started with the course fundamentals',
    1
FROM courses 
WHERE id IN (1, 2, 3)
AND NOT EXISTS (SELECT 1 FROM course_modules WHERE course_id = courses.id);

-- ===========================================
-- END OF MIGRATION
-- ===========================================
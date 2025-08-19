-- ===========================================
-- Real Estate Masterclass LMS Database Schema
-- Migration: 001_create_initial_schema.sql
-- ===========================================

-- Disable foreign key checks to allow dropping tables with dependencies
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS lesson_progress;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS course_modules;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS course_reviews;
DROP TABLE IF EXISTS coupon_usage;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS file_uploads;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS instructors;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS backup_logs;

-- ===========================================
-- SYSTEM TABLES
-- ===========================================

-- System Settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- Backup Logs
CREATE TABLE backup_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    backup_name VARCHAR(255) NOT NULL,
    backup_type ENUM('full', 'tables', 'files') DEFAULT 'full',
    file_path VARCHAR(500),
    file_size BIGINT DEFAULT 0,
    compression ENUM('none', 'gzip', 'zip') DEFAULT 'gzip',
    status ENUM('running', 'completed', 'failed') DEFAULT 'running',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    error_message TEXT,
    tables_included JSON,
    metadata JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_backup_type (backup_type),
    INDEX idx_created_at (created_at)
);

-- ===========================================
-- USER MANAGEMENT TABLES
-- ===========================================

-- Roles and Permissions
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);

-- Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role_id INT NOT NULL,
    date_of_birth DATE,
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    social_links JSON,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    preferences JSON,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_role_id (role_id),
    INDEX idx_is_active (is_active),
    INDEX idx_email_verified (email_verified),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (name, email)
);

-- Email Verifications
CREATE TABLE email_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Password Resets
CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- User Sessions
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSON,
    location_info JSON,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_refresh_token (refresh_token),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_activity (last_activity)
);

-- ===========================================
-- INSTRUCTOR MANAGEMENT
-- ===========================================

-- Instructors (Extended profile for users with instructor role)
CREATE TABLE instructors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    experience TEXT,
    qualifications JSON,
    certifications JSON,
    specialties JSON,
    hourly_rate DECIMAL(10,2),
    commission_rate DECIMAL(5,2) DEFAULT 70.00,
    bank_details JSON,
    tax_info JSON,
    status ENUM('pending', 'approved', 'suspended', 'rejected') DEFAULT 'pending',
    approved_at TIMESTAMP NULL,
    approved_by INT,
    total_students INT DEFAULT 0,
    total_courses INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_avg_rating (avg_rating),
    FULLTEXT idx_search (experience)
);

-- ===========================================
-- COURSE MANAGEMENT TABLES
-- ===========================================

-- Courses
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    thumbnail VARCHAR(500),
    preview_video VARCHAR(500),
    instructor_id INT NOT NULL,
    category_id INT,
    level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    language VARCHAR(10) DEFAULT 'en',
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    original_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    duration_hours INT DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    max_students INT,
    prerequisites TEXT,
    learning_outcomes JSON,
    target_audience JSON,
    course_materials JSON,
    tags JSON,
    status ENUM('draft', 'pending', 'published', 'archived', 'rejected') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    submission_date TIMESTAMP NULL,
    review_notes TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    enrollment_count INT DEFAULT 0,
    completion_count INT DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    last_updated TIMESTAMP,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_status (status),
    INDEX idx_is_published (is_published),
    INDEX idx_is_featured (is_featured),
    INDEX idx_level (level),
    INDEX idx_price (price),
    INDEX idx_avg_rating (avg_rating),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, description, short_description)
);

-- Course Modules
CREATE TABLE course_modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    duration_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_sort_order (sort_order)
);

-- Lessons
CREATE TABLE lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    lesson_type ENUM('video', 'text', 'quiz', 'assignment', 'file') DEFAULT 'video',
    video_url VARCHAR(500),
    video_duration INT DEFAULT 0,
    video_provider ENUM('youtube', 'vimeo', 'wistia', 'self-hosted') DEFAULT 'youtube',
    attachments JSON,
    sort_order INT DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    INDEX idx_module_id (module_id),
    INDEX idx_lesson_type (lesson_type),
    INDEX idx_sort_order (sort_order),
    FULLTEXT idx_search (title, content)
);

-- ===========================================
-- ENROLLMENT AND PROGRESS TABLES
-- ===========================================

-- Enrollments
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    completed_at TIMESTAMP NULL,
    last_accessed_at TIMESTAMP NULL,
    completion_certificate_url VARCHAR(500),
    payment_status ENUM('free', 'paid', 'pending', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) DEFAULT 0.00,
    enrollment_source VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_progress_percentage (progress_percentage),
    INDEX idx_enrolled_at (enrolled_at),
    INDEX idx_is_active (is_active)
);

-- Lesson Progress
CREATE TABLE lesson_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent INT DEFAULT 0, -- in seconds
    last_position INT DEFAULT 0, -- for video lessons, position in seconds
    completed_at TIMESTAMP NULL,
    notes TEXT,
    attempts INT DEFAULT 0,
    max_score DECIMAL(5,2),
    achieved_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lesson_progress (user_id, lesson_id),
    INDEX idx_user_id (user_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_status (status)
);

-- ===========================================
-- ASSESSMENT TABLES
-- ===========================================

-- Quizzes
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT,
    course_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    time_limit_minutes INT,
    attempts_allowed INT DEFAULT 1,
    passing_score DECIMAL(5,2) DEFAULT 60.00,
    question_count INT DEFAULT 0,
    randomize_questions BOOLEAN DEFAULT FALSE,
    show_results BOOLEAN DEFAULT TRUE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_course_id (course_id)
);

-- Quiz Questions
CREATE TABLE quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay') DEFAULT 'multiple_choice',
    options JSON,
    correct_answer JSON,
    explanation TEXT,
    points DECIMAL(5,2) DEFAULT 1.00,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_sort_order (sort_order)
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    attempt_number INT DEFAULT 1,
    answers JSON,
    score DECIMAL(5,2) DEFAULT 0.00,
    max_score DECIMAL(5,2) DEFAULT 0.00,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    time_taken INT, -- in seconds
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_status (status)
);

-- Assignments
CREATE TABLE assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT,
    course_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    due_date TIMESTAMP NULL,
    submission_format ENUM('text', 'file', 'both') DEFAULT 'text',
    allowed_file_types JSON,
    max_file_size INT DEFAULT 10485760, -- 10MB in bytes
    is_required BOOLEAN DEFAULT FALSE,
    auto_grade BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_course_id (course_id),
    INDEX idx_due_date (due_date)
);

-- Assignment Submissions
CREATE TABLE assignment_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assignment_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    submission_text LONGTEXT,
    file_attachments JSON,
    score DECIMAL(5,2),
    feedback TEXT,
    status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    graded_at TIMESTAMP NULL,
    graded_by INT,
    attempt_number INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
);

-- ===========================================
-- PAYMENT AND TRANSACTION TABLES
-- ===========================================

-- Payment Transactions
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT,
    order_id VARCHAR(255) NOT NULL UNIQUE,
    transaction_id VARCHAR(255) UNIQUE,
    payment_method ENUM('stripe', 'paypal', 'razorpay', 'manual', 'free') DEFAULT 'stripe',
    payment_provider_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    fee_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    description TEXT,
    metadata JSON,
    gateway_response JSON,
    failure_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    instructor_payout DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_order_id (order_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_payment_date (payment_date),
    INDEX idx_created_at (created_at)
);

-- Coupons
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
    value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2),
    maximum_discount DECIMAL(10,2),
    usage_limit INT,
    usage_limit_per_user INT DEFAULT 1,
    used_count INT DEFAULT 0,
    applicable_courses JSON,
    applicable_categories JSON,
    exclude_courses JSON,
    exclude_categories JSON,
    starts_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_by (created_by)
);

-- Coupon Usage
CREATE TABLE coupon_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_used_at (used_at)
);

-- Refunds
CREATE TABLE refunds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    refund_transaction_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    reason ENUM('customer_request', 'fraud', 'duplicate', 'other') DEFAULT 'customer_request',
    description TEXT,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processed_by INT,
    processed_at TIMESTAMP NULL,
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_processed_at (processed_at)
);

-- ===========================================
-- REVIEW AND RATING TABLES
-- ===========================================

-- Course Reviews
CREATE TABLE course_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected', 'hidden') DEFAULT 'pending',
    helpful_count INT DEFAULT 0,
    reported_count INT DEFAULT 0,
    instructor_response TEXT,
    instructor_response_at TIMESTAMP NULL,
    moderated_by INT,
    moderated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_course_review (user_id, course_id),
    INDEX idx_course_id (course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, review_text)
);

-- ===========================================
-- CERTIFICATE MANAGEMENT
-- ===========================================

-- Certificates
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    certificate_url VARCHAR(500),
    template_id INT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    verification_token VARCHAR(255) UNIQUE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_certificate_number (certificate_number),
    INDEX idx_verification_token (verification_token),
    INDEX idx_issued_at (issued_at)
);

-- ===========================================
-- FILE MANAGEMENT
-- ===========================================

-- File Uploads
CREATE TABLE file_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_category ENUM('image', 'video', 'document', 'audio', 'other') DEFAULT 'other',
    upload_type ENUM('course_thumbnail', 'course_video', 'lesson_video', 'lesson_attachment', 'user_avatar', 'assignment_submission', 'other') DEFAULT 'other',
    entity_type VARCHAR(50),
    entity_id INT,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_file_category (file_category),
    INDEX idx_upload_type (upload_type),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_is_public (is_public),
    INDEX idx_created_at (created_at)
);

-- ===========================================
-- ACTIVITY AND NOTIFICATION TABLES
-- ===========================================

-- Activity Logs
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'course', 'payment', 'system') DEFAULT 'info',
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    expires_at TIMESTAMP NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at)
);

-- ===========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ===========================================

-- Additional composite indexes for common queries
CREATE INDEX idx_enrollments_user_status ON enrollments(user_id, payment_status, is_active);
CREATE INDEX idx_enrollments_course_status ON enrollments(course_id, payment_status, is_active);
CREATE INDEX idx_courses_instructor_status ON courses(instructor_id, status, is_published);
CREATE INDEX idx_transactions_user_status ON payment_transactions(user_id, status, payment_date);
CREATE INDEX idx_transactions_course_status ON payment_transactions(course_id, status, payment_date);
CREATE INDEX idx_lesson_progress_user_status ON lesson_progress(user_id, status, completed_at);
CREATE INDEX idx_reviews_course_status ON course_reviews(course_id, status, created_at);
CREATE INDEX idx_activity_user_date ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- Course Statistics View
CREATE VIEW course_stats AS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    c.status,
    c.price,
    COUNT(DISTINCT e.id) as enrollment_count,
    COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.id END) as completion_count,
    AVG(cr.rating) as avg_rating,
    COUNT(DISTINCT cr.id) as review_count,
    SUM(CASE WHEN pt.status = 'completed' THEN pt.amount ELSE 0 END) as total_revenue,
    MAX(e.enrolled_at) as last_enrollment_date
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id AND e.is_active = TRUE
LEFT JOIN course_reviews cr ON c.id = cr.course_id AND cr.status = 'approved'
LEFT JOIN payment_transactions pt ON c.id = pt.course_id AND pt.status = 'completed'
GROUP BY c.id;

-- User Progress Summary View
CREATE VIEW user_progress_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.id END) as completed_courses,
    AVG(e.progress_percentage) as avg_progress,
    SUM(CASE WHEN pt.status = 'completed' THEN pt.amount ELSE 0 END) as total_spent,
    COUNT(DISTINCT cr.id) as reviews_given,
    MAX(e.last_accessed_at) as last_learning_activity
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id AND e.is_active = TRUE
LEFT JOIN payment_transactions pt ON u.id = pt.user_id AND pt.status = 'completed'
LEFT JOIN course_reviews cr ON u.id = cr.user_id
WHERE u.is_active = TRUE
GROUP BY u.id;

-- Instructor Performance View
CREATE VIEW instructor_performance AS
SELECT 
    i.id as instructor_id,
    u.name as instructor_name,
    u.email as instructor_email,
    i.status as instructor_status,
    COUNT(DISTINCT c.id) as total_courses,
    COUNT(DISTINCT CASE WHEN c.is_published = TRUE THEN c.id END) as published_courses,
    COUNT(DISTINCT e.id) as total_students,
    AVG(cr.rating) as avg_rating,
    COUNT(DISTINCT cr.id) as total_reviews,
    SUM(CASE WHEN pt.status = 'completed' THEN pt.instructor_payout ELSE 0 END) as total_earnings,
    SUM(CASE WHEN pt.status = 'completed' THEN pt.amount ELSE 0 END) as total_revenue_generated
FROM instructors i
JOIN users u ON i.user_id = u.id
LEFT JOIN courses c ON i.id = c.instructor_id
LEFT JOIN enrollments e ON c.id = e.course_id AND e.is_active = TRUE
LEFT JOIN course_reviews cr ON c.id = cr.course_id AND cr.status = 'approved'
LEFT JOIN payment_transactions pt ON c.id = pt.course_id AND pt.status = 'completed'
GROUP BY i.id;

-- ===========================================
-- TRIGGERS FOR DATA CONSISTENCY
-- ===========================================

DELIMITER //

-- Update course enrollment count when enrollment is added/removed
CREATE TRIGGER update_course_enrollment_count_insert 
AFTER INSERT ON enrollments
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET enrollment_count = (
        SELECT COUNT(*) 
        FROM enrollments 
        WHERE course_id = NEW.course_id AND is_active = TRUE
    )
    WHERE id = NEW.course_id;
END//

CREATE TRIGGER update_course_enrollment_count_update
AFTER UPDATE ON enrollments
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET enrollment_count = (
        SELECT COUNT(*) 
        FROM enrollments 
        WHERE course_id = NEW.course_id AND is_active = TRUE
    )
    WHERE id = NEW.course_id;
    
    IF NEW.course_id != OLD.course_id THEN
        UPDATE courses 
        SET enrollment_count = (
            SELECT COUNT(*) 
            FROM enrollments 
            WHERE course_id = OLD.course_id AND is_active = TRUE
        )
        WHERE id = OLD.course_id;
    END IF;
END//

-- Update course completion count when enrollment is completed
CREATE TRIGGER update_course_completion_count
AFTER UPDATE ON enrollments
FOR EACH ROW
BEGIN
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        UPDATE courses 
        SET completion_count = completion_count + 1
        WHERE id = NEW.course_id;
    ELSEIF NEW.completed_at IS NULL AND OLD.completed_at IS NOT NULL THEN
        UPDATE courses 
        SET completion_count = completion_count - 1
        WHERE id = NEW.course_id;
    END IF;
END//

-- Update course rating when review is added/updated
CREATE TRIGGER update_course_rating_insert
AFTER INSERT ON course_reviews
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET 
        avg_rating = (
            SELECT AVG(rating) 
            FROM course_reviews 
            WHERE course_id = NEW.course_id AND status = 'approved'
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM course_reviews 
            WHERE course_id = NEW.course_id AND status = 'approved'
        )
    WHERE id = NEW.course_id;
END//

CREATE TRIGGER update_course_rating_update
AFTER UPDATE ON course_reviews
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET 
        avg_rating = (
            SELECT AVG(rating) 
            FROM course_reviews 
            WHERE course_id = NEW.course_id AND status = 'approved'
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM course_reviews 
            WHERE course_id = NEW.course_id AND status = 'approved'
        )
    WHERE id = NEW.course_id;
END//

-- Update coupon used count
CREATE TRIGGER update_coupon_usage_count
AFTER INSERT ON coupon_usage
FOR EACH ROW
BEGIN
    UPDATE coupons 
    SET used_count = used_count + 1
    WHERE id = NEW.coupon_id;
END//

-- Update user last login
CREATE TRIGGER update_user_last_login
AFTER INSERT ON user_sessions
FOR EACH ROW
BEGIN
    UPDATE users 
    SET last_login = NEW.created_at
    WHERE id = NEW.user_id;
END//

DELIMITER ;

-- ===========================================
-- FINAL SCHEMA VALIDATION
-- ===========================================

-- Add any final constraints or validations
ALTER TABLE users ADD CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE courses ADD CONSTRAINT chk_price_positive CHECK (price >= 0);
ALTER TABLE course_reviews ADD CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1.0 AND 5.0);
ALTER TABLE quiz_attempts ADD CONSTRAINT chk_percentage_range CHECK (percentage BETWEEN 0 AND 100);

-- ===========================================
-- SCHEMA COMPLETE
-- ===========================================

-- Insert migration record
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, created_at) 
VALUES ('schema_version', '1.0.0', 'string', 'Database schema version', NOW())
ON DUPLICATE KEY UPDATE 
setting_value = '1.0.0', 
updated_at = NOW();

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
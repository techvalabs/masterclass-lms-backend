-- Real Estate Masterclass LMS - MySQL Database Schema
-- Created: August 2024
-- Purpose: Complete LMS database with user management, courses, progress tracking, and more

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `progress_lessons`;
DROP TABLE IF EXISTS `progress`;
DROP TABLE IF EXISTS `quiz_attempts`;
DROP TABLE IF EXISTS `quiz_questions`;
DROP TABLE IF EXISTS `quizzes`;
DROP TABLE IF EXISTS `lesson_resources`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `modules`;
DROP TABLE IF EXISTS `course_reviews`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `course_categories`;
DROP TABLE IF EXISTS `instructors`;
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `activity_logs`;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- System Settings Table
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL UNIQUE,
  `setting_value` text,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles Table
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL UNIQUE,
  `description` text,
  `permissions` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` varchar(500) NULL,
  `role_id` int NOT NULL DEFAULT 1,
  `phone` varchar(50) NULL,
  `date_of_birth` date NULL,
  `bio` text NULL,
  `location` varchar(255) NULL,
  `website` varchar(500) NULL,
  `social_links` json NULL,
  `email_verified` boolean DEFAULT FALSE,
  `email_verified_at` timestamp NULL,
  `is_active` boolean DEFAULT TRUE,
  `last_login` timestamp NULL,
  `preferences` json NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_email` (`email`),
  KEY `idx_users_role` (`role_id`),
  KEY `idx_users_email_verified` (`email_verified`),
  KEY `idx_users_active` (`is_active`),
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password Resets Table
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_resets_email` (`email`),
  KEY `idx_password_resets_token` (`token`),
  KEY `idx_password_resets_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Sessions Table (for JWT token management)
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `refresh_token` varchar(500) NOT NULL,
  `access_token_id` varchar(255) NOT NULL,
  `device_info` json NULL,
  `ip_address` varchar(45) NULL,
  `user_agent` text NULL,
  `is_active` boolean DEFAULT TRUE,
  `expires_at` timestamp NOT NULL,
  `last_used_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_refresh_token` (`refresh_token`),
  KEY `idx_sessions_access_token` (`access_token_id`),
  KEY `idx_sessions_active` (`is_active`),
  KEY `idx_sessions_expires` (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Categories Table
CREATE TABLE `course_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL UNIQUE,
  `description` text NULL,
  `color` varchar(20) NULL,
  `icon` varchar(100) NULL,
  `sort_order` int DEFAULT 0,
  `is_active` boolean DEFAULT TRUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_slug` (`slug`),
  KEY `idx_categories_active` (`is_active`),
  KEY `idx_categories_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Instructors Table
CREATE TABLE `instructors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `bio` text NOT NULL,
  `expertise` json NOT NULL,
  `years_experience` int DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_students` int DEFAULT 0,
  `total_courses` int DEFAULT 0,
  `total_reviews` int DEFAULT 0,
  `certifications` json NULL,
  `education` json NULL,
  `achievements` json NULL,
  `hourly_rate` decimal(10,2) NULL,
  `is_featured` boolean DEFAULT FALSE,
  `status` enum('active','inactive','pending') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_instructor_user` (`user_id`),
  KEY `idx_instructors_status` (`status`),
  KEY `idx_instructors_featured` (`is_featured`),
  KEY `idx_instructors_rating` (`rating`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses Table
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text NOT NULL,
  `short_description` varchar(500) NULL,
  `thumbnail` varchar(500) NULL,
  `preview_video` varchar(500) NULL,
  `instructor_id` int NOT NULL,
  `category_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `original_price` decimal(10,2) NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `level` enum('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
  `duration_hours` int DEFAULT 0,
  `duration_minutes` int DEFAULT 0,
  `language` varchar(10) DEFAULT 'en',
  `tags` json NULL,
  `learning_outcomes` json NULL,
  `requirements` json NULL,
  `target_audience` json NULL,
  `features` json NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_ratings` int DEFAULT 0,
  `total_students` int DEFAULT 0,
  `total_lessons` int DEFAULT 0,
  `total_duration_seconds` int DEFAULT 0,
  `is_published` boolean DEFAULT FALSE,
  `is_featured` boolean DEFAULT FALSE,
  `is_free` boolean DEFAULT FALSE,
  `publish_date` timestamp NULL,
  `last_updated` timestamp NULL,
  `meta_title` varchar(255) NULL,
  `meta_description` varchar(500) NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_course_slug` (`slug`),
  KEY `idx_courses_instructor` (`instructor_id`),
  KEY `idx_courses_category` (`category_id`),
  KEY `idx_courses_published` (`is_published`),
  KEY `idx_courses_featured` (`is_featured`),
  KEY `idx_courses_free` (`is_free`),
  KEY `idx_courses_rating` (`rating`),
  KEY `idx_courses_price` (`price`),
  KEY `idx_courses_level` (`level`),
  FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modules Table
CREATE TABLE `modules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `duration_seconds` int DEFAULT 0,
  `is_published` boolean DEFAULT TRUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_modules_course` (`course_id`),
  KEY `idx_modules_order` (`sort_order`),
  KEY `idx_modules_published` (`is_published`),
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lessons Table
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `module_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NULL,
  `content` longtext NULL,
  `video_url` varchar(500) NULL,
  `video_duration` int DEFAULT 0,
  `video_size` bigint DEFAULT 0,
  `video_format` varchar(20) NULL,
  `transcript` longtext NULL,
  `notes` longtext NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_preview` boolean DEFAULT FALSE,
  `is_published` boolean DEFAULT TRUE,
  `can_download` boolean DEFAULT FALSE,
  `view_count` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lessons_module` (`module_id`),
  KEY `idx_lessons_order` (`sort_order`),
  KEY `idx_lessons_preview` (`is_preview`),
  KEY `idx_lessons_published` (`is_published`),
  FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lesson Resources Table
CREATE TABLE `lesson_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint DEFAULT 0,
  `file_type` varchar(100) NOT NULL,
  `download_count` int DEFAULT 0,
  `is_downloadable` boolean DEFAULT TRUE,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resources_lesson` (`lesson_id`),
  KEY `idx_resources_downloadable` (`is_downloadable`),
  KEY `idx_resources_order` (`sort_order`),
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quizzes Table
CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NULL,
  `course_id` int NULL,
  `title` varchar(255) NOT NULL,
  `description` text NULL,
  `instructions` text NULL,
  `time_limit` int NULL,
  `passing_score` int DEFAULT 70,
  `max_attempts` int DEFAULT -1,
  `randomize_questions` boolean DEFAULT FALSE,
  `show_results` boolean DEFAULT TRUE,
  `allow_review` boolean DEFAULT TRUE,
  `is_published` boolean DEFAULT TRUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quizzes_lesson` (`lesson_id`),
  KEY `idx_quizzes_course` (`course_id`),
  KEY `idx_quizzes_published` (`is_published`),
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz Questions Table
CREATE TABLE `quiz_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','true_false','short_answer','essay') DEFAULT 'multiple_choice',
  `options` json NULL,
  `correct_answer` text NULL,
  `explanation` text NULL,
  `points` int DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `is_active` boolean DEFAULT TRUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_questions_quiz` (`quiz_id`),
  KEY `idx_quiz_questions_order` (`sort_order`),
  KEY `idx_quiz_questions_active` (`is_active`),
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments Table
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrolled_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `progress_percentage` decimal(5,2) DEFAULT 0.00,
  `last_accessed_at` timestamp NULL,
  `completed_at` timestamp NULL,
  `certificate_issued_at` timestamp NULL,
  `payment_status` enum('free','pending','completed','failed','refunded') DEFAULT 'free',
  `payment_amount` decimal(10,2) DEFAULT 0.00,
  `payment_currency` varchar(10) DEFAULT 'USD',
  `payment_method` varchar(50) NULL,
  `payment_transaction_id` varchar(255) NULL,
  `rating` int NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review` text NULL,
  `review_date` timestamp NULL,
  `is_active` boolean DEFAULT TRUE,
  `notes` text NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_course_enrollment` (`user_id`, `course_id`),
  KEY `idx_enrollments_user` (`user_id`),
  KEY `idx_enrollments_course` (`course_id`),
  KEY `idx_enrollments_payment_status` (`payment_status`),
  KEY `idx_enrollments_progress` (`progress_percentage`),
  KEY `idx_enrollments_completed` (`completed_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Progress Table
CREATE TABLE `progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `completed_at` timestamp NULL,
  `watch_time_seconds` int DEFAULT 0,
  `completion_percentage` decimal(5,2) DEFAULT 0.00,
  `notes` text NULL,
  `bookmarks` json NULL,
  `last_position_seconds` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_lesson_progress` (`user_id`, `lesson_id`),
  KEY `idx_progress_user` (`user_id`),
  KEY `idx_progress_course` (`course_id`),
  KEY `idx_progress_lesson` (`lesson_id`),
  KEY `idx_progress_completed` (`completed_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz Attempts Table
CREATE TABLE `quiz_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `attempt_number` int NOT NULL DEFAULT 1,
  `answers` json NOT NULL,
  `score` decimal(5,2) DEFAULT 0.00,
  `max_score` decimal(5,2) DEFAULT 100.00,
  `passed` boolean DEFAULT FALSE,
  `time_taken_seconds` int DEFAULT 0,
  `started_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_attempts_user` (`user_id`),
  KEY `idx_quiz_attempts_quiz` (`quiz_id`),
  KEY `idx_quiz_attempts_score` (`score`),
  KEY `idx_quiz_attempts_passed` (`passed`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Certificates Table
CREATE TABLE `certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `certificate_number` varchar(100) NOT NULL UNIQUE,
  `issued_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `certificate_url` varchar(500) NULL,
  `verification_code` varchar(100) NOT NULL UNIQUE,
  `is_valid` boolean DEFAULT TRUE,
  `metadata` json NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_course_certificate` (`user_id`, `course_id`),
  UNIQUE KEY `unique_certificate_number` (`certificate_number`),
  UNIQUE KEY `unique_verification_code` (`verification_code`),
  KEY `idx_certificates_user` (`user_id`),
  KEY `idx_certificates_course` (`course_id`),
  KEY `idx_certificates_valid` (`is_valid`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Reviews Table
CREATE TABLE `course_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `rating` int NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review_title` varchar(255) NULL,
  `review_text` text NULL,
  `pros` json NULL,
  `cons` json NULL,
  `is_recommended` boolean DEFAULT TRUE,
  `is_verified_purchase` boolean DEFAULT FALSE,
  `is_published` boolean DEFAULT TRUE,
  `helpful_count` int DEFAULT 0,
  `reported_count` int DEFAULT 0,
  `instructor_response` text NULL,
  `instructor_response_date` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_course_review` (`user_id`, `course_id`),
  KEY `idx_reviews_user` (`user_id`),
  KEY `idx_reviews_course` (`course_id`),
  KEY `idx_reviews_rating` (`rating`),
  KEY `idx_reviews_published` (`is_published`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error','course','progress','payment','system') DEFAULT 'info',
  `action_url` varchar(500) NULL,
  `action_text` varchar(100) NULL,
  `is_read` boolean DEFAULT FALSE,
  `read_at` timestamp NULL,
  `data` json NULL,
  `expires_at` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_type` (`type`),
  KEY `idx_notifications_read` (`is_read`),
  KEY `idx_notifications_expires` (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NULL,
  `entity_id` int NULL,
  `description` text NULL,
  `metadata` json NULL,
  `ip_address` varchar(45) NULL,
  `user_agent` text NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_logs_user` (`user_id`),
  KEY `idx_activity_logs_action` (`action`),
  KEY `idx_activity_logs_entity` (`entity_type`, `entity_id`),
  KEY `idx_activity_logs_created` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX `idx_users_email_password` ON `users` (`email`, `password_hash`);
CREATE INDEX `idx_courses_published_featured` ON `courses` (`is_published`, `is_featured`);
CREATE INDEX `idx_enrollments_user_course_active` ON `enrollments` (`user_id`, `course_id`, `is_active`);
CREATE INDEX `idx_progress_user_course_completed` ON `progress` (`user_id`, `course_id`, `completed_at`);
CREATE INDEX `idx_lessons_module_order_published` ON `lessons` (`module_id`, `sort_order`, `is_published`);

-- Create triggers for automatic updates
DELIMITER //

-- Trigger to update course statistics when enrollment changes
CREATE TRIGGER `update_course_stats_on_enrollment` 
  AFTER INSERT ON `enrollments`
  FOR EACH ROW
BEGIN
  UPDATE `courses` 
  SET `total_students` = (
    SELECT COUNT(*) 
    FROM `enrollments` 
    WHERE `course_id` = NEW.course_id AND `is_active` = TRUE
  )
  WHERE `id` = NEW.course_id;
END//

-- Trigger to update course statistics when enrollment is updated
CREATE TRIGGER `update_course_stats_on_enrollment_update` 
  AFTER UPDATE ON `enrollments`
  FOR EACH ROW
BEGIN
  IF OLD.is_active != NEW.is_active THEN
    UPDATE `courses` 
    SET `total_students` = (
      SELECT COUNT(*) 
      FROM `enrollments` 
      WHERE `course_id` = NEW.course_id AND `is_active` = TRUE
    )
    WHERE `id` = NEW.course_id;
  END IF;
END//

-- Trigger to update course rating when review is added
CREATE TRIGGER `update_course_rating_on_review` 
  AFTER INSERT ON `course_reviews`
  FOR EACH ROW
BEGIN
  UPDATE `courses` 
  SET 
    `rating` = (
      SELECT AVG(`rating`) 
      FROM `course_reviews` 
      WHERE `course_id` = NEW.course_id AND `is_published` = TRUE
    ),
    `total_ratings` = (
      SELECT COUNT(*) 
      FROM `course_reviews` 
      WHERE `course_id` = NEW.course_id AND `is_published` = TRUE
    )
  WHERE `id` = NEW.course_id;
END//

-- Trigger to update course rating when review is updated
CREATE TRIGGER `update_course_rating_on_review_update` 
  AFTER UPDATE ON `course_reviews`
  FOR EACH ROW
BEGIN
  IF OLD.rating != NEW.rating OR OLD.is_published != NEW.is_published THEN
    UPDATE `courses` 
    SET 
      `rating` = (
        SELECT AVG(`rating`) 
        FROM `course_reviews` 
        WHERE `course_id` = NEW.course_id AND `is_published` = TRUE
      ),
      `total_ratings` = (
        SELECT COUNT(*) 
        FROM `course_reviews` 
        WHERE `course_id` = NEW.course_id AND `is_published` = TRUE
      )
    WHERE `id` = NEW.course_id;
  END IF;
END//

-- Trigger to update instructor statistics
CREATE TRIGGER `update_instructor_stats_on_course_change` 
  AFTER UPDATE ON `courses`
  FOR EACH ROW
BEGIN
  IF OLD.is_published != NEW.is_published THEN
    UPDATE `instructors` 
    SET 
      `total_courses` = (
        SELECT COUNT(*) 
        FROM `courses` 
        WHERE `instructor_id` = NEW.instructor_id AND `is_published` = TRUE
      ),
      `total_students` = (
        SELECT SUM(`total_students`) 
        FROM `courses` 
        WHERE `instructor_id` = NEW.instructor_id AND `is_published` = TRUE
      ),
      `rating` = (
        SELECT AVG(`rating`) 
        FROM `courses` 
        WHERE `instructor_id` = NEW.instructor_id AND `is_published` = TRUE AND `rating` > 0
      )
    WHERE `id` = NEW.instructor_id;
  END IF;
END//

DELIMITER ;

-- Insert default system roles
INSERT INTO `roles` (`name`, `description`, `permissions`) VALUES
('student', 'Student role with basic course access', '["course.view", "progress.track", "quiz.take", "certificate.view"]'),
('instructor', 'Instructor role for course creation and management', '["course.create", "course.manage", "student.view", "analytics.view", "content.upload"]'),
('admin', 'Administrator role with full system access', '["*"]');

-- Insert default system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('site_name', 'Real Estate Masterclass LMS', 'string', 'Name of the LMS platform'),
('site_description', 'Master Real Estate Investing Through Expert-Led Courses', 'string', 'Site description for SEO'),
('site_logo', '/img/logo.jpg', 'string', 'Path to site logo'),
('default_currency', 'USD', 'string', 'Default currency for course pricing'),
('email_from_name', 'Real Estate Masterclass', 'string', 'Default sender name for emails'),
('email_from_address', 'noreply@masterclass-lms.com', 'string', 'Default sender email address'),
('enable_registration', 'true', 'boolean', 'Allow new user registration'),
('enable_course_reviews', 'true', 'boolean', 'Enable course review system'),
('enable_certificates', 'true', 'boolean', 'Enable certificate generation'),
('max_file_upload_size', '100', 'number', 'Maximum file upload size in MB'),
('session_timeout_hours', '24', 'number', 'User session timeout in hours'),
('password_min_length', '8', 'number', 'Minimum password length'),
('quiz_default_passing_score', '70', 'number', 'Default passing score for quizzes'),
('certificate_validity_years', '5', 'number', 'Certificate validity period in years');

-- Insert default course categories
INSERT INTO `course_categories` (`name`, `slug`, `description`, `color`, `icon`, `sort_order`) VALUES
('Real Estate Wholesaling', 'wholesaling', 'Learn the art of real estate wholesaling and contract assignment', '#10B981', 'home', 1),
('House Flipping', 'house-flipping', 'Master the complete house flipping process from purchase to sale', '#3B82F6', 'hammer', 2),
('Creative Financing', 'creative-financing', 'Discover alternative financing strategies for real estate investments', '#8B5CF6', 'credit-card', 3),
('Land Development', 'land-development', 'Learn land development from zoning to profitable projects', '#F59E0B', 'map', 4),
('Property Purchasing', 'property-purchasing', 'Master smart property acquisition strategies and techniques', '#EF4444', 'key', 5),
('Commercial Real Estate', 'commercial-real-estate', 'Advanced commercial real estate investment strategies', '#6B7280', 'building', 6);

SET FOREIGN_KEY_CHECKS = 1;

-- End of schema
-- Total tables: 24
-- Indexes: Optimized for common queries
-- Triggers: Automatic statistics updates
-- Foreign Keys: Maintain referential integrity
-- Character Set: UTF8MB4 for full Unicode support
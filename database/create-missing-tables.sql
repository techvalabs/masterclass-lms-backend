-- Missing Tables for Masterclass LMS
-- Tables identified in website test report that need to be created

-- Payment Transactions Table (for detailed payment history)
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NULL,
  `enrollment_id` int NULL,
  `transaction_id` varchar(255) NOT NULL UNIQUE,
  `payment_method` enum('stripe','paypal','mock','bank_transfer','crypto') DEFAULT 'stripe',
  `payment_type` enum('course_purchase','subscription','refund','withdrawal') DEFAULT 'course_purchase',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `status` enum('pending','processing','completed','failed','refunded','cancelled') DEFAULT 'pending',
  `gateway_response` json NULL,
  `metadata` json NULL,
  `refund_amount` decimal(10,2) DEFAULT 0.00,
  `refund_reason` text NULL,
  `refunded_at` timestamp NULL,
  `notes` text NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_transaction_id` (`transaction_id`),
  KEY `idx_payment_transactions_user` (`user_id`),
  KEY `idx_payment_transactions_course` (`course_id`),
  KEY `idx_payment_transactions_enrollment` (`enrollment_id`),
  KEY `idx_payment_transactions_status` (`status`),
  KEY `idx_payment_transactions_method` (`payment_method`),
  KEY `idx_payment_transactions_created` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Progress Table (overall course progress tracking)
CREATE TABLE IF NOT EXISTS `course_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrollment_id` int NOT NULL,
  `completed_lessons` int DEFAULT 0,
  `total_lessons` int DEFAULT 0,
  `completed_modules` int DEFAULT 0,
  `total_modules` int DEFAULT 0,
  `progress_percentage` decimal(5,2) DEFAULT 0.00,
  `total_watch_time_seconds` int DEFAULT 0,
  `last_accessed_lesson_id` int NULL,
  `last_accessed_at` timestamp NULL,
  `started_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL,
  `is_completed` boolean DEFAULT FALSE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_course_progress` (`user_id`, `course_id`),
  KEY `idx_course_progress_user` (`user_id`),
  KEY `idx_course_progress_course` (`course_id`),
  KEY `idx_course_progress_enrollment` (`enrollment_id`),
  KEY `idx_course_progress_completed` (`is_completed`),
  KEY `idx_course_progress_percentage` (`progress_percentage`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`last_accessed_lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lesson Progress Table (detailed lesson-level tracking)
CREATE TABLE IF NOT EXISTS `lesson_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `module_id` int NOT NULL,
  `video_progress_seconds` int DEFAULT 0,
  `video_duration_seconds` int DEFAULT 0,
  `watch_percentage` decimal(5,2) DEFAULT 0.00,
  `is_completed` boolean DEFAULT FALSE,
  `completed_at` timestamp NULL,
  `last_position_seconds` int DEFAULT 0,
  `playback_speed` decimal(3,2) DEFAULT 1.00,
  `notes` text NULL,
  `bookmarks` json NULL,
  `quiz_attempts` int DEFAULT 0,
  `quiz_passed` boolean DEFAULT FALSE,
  `started_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `last_watched_at` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_lesson_progress` (`user_id`, `lesson_id`),
  KEY `idx_lesson_progress_user` (`user_id`),
  KEY `idx_lesson_progress_course` (`course_id`),
  KEY `idx_lesson_progress_lesson` (`lesson_id`),
  KEY `idx_lesson_progress_module` (`module_id`),
  KEY `idx_lesson_progress_completed` (`is_completed`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Video Uploads Table (for video management and processing)
CREATE TABLE IF NOT EXISTS `video_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NULL,
  `course_id` int NULL,
  `uploaded_by` int NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `stored_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `cdn_url` varchar(500) NULL,
  `hls_url` varchar(500) NULL,
  `thumbnail_url` varchar(500) NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `duration_seconds` int DEFAULT 0,
  `resolution` varchar(20) NULL,
  `bitrate` int NULL,
  `codec` varchar(50) NULL,
  `format` varchar(20) NULL,
  `processing_status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `processing_error` text NULL,
  `processed_at` timestamp NULL,
  `transcoding_jobs` json NULL,
  `metadata` json NULL,
  `is_public` boolean DEFAULT FALSE,
  `view_count` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_video_uploads_lesson` (`lesson_id`),
  KEY `idx_video_uploads_course` (`course_id`),
  KEY `idx_video_uploads_user` (`uploaded_by`),
  KEY `idx_video_uploads_status` (`processing_status`),
  KEY `idx_video_uploads_created` (`created_at`),
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Lessons Table (simplified version for course content)
-- Note: This might be redundant with 'lessons' table, but included for compatibility
CREATE TABLE IF NOT EXISTS `course_lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `module_id` int NULL,
  `title` varchar(255) NOT NULL,
  `description` text NULL,
  `video_url` varchar(500) NULL,
  `duration_minutes` int DEFAULT 0,
  `order_index` int DEFAULT 0,
  `is_preview` boolean DEFAULT FALSE,
  `is_published` boolean DEFAULT TRUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_lessons_course` (`course_id`),
  KEY `idx_course_lessons_module` (`module_id`),
  KEY `idx_course_lessons_order` (`order_index`),
  KEY `idx_course_lessons_published` (`is_published`),
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File Uploads Table (already exists in backend, but including for completeness)
CREATE TABLE IF NOT EXISTS `file_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL,
  `original_name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) NULL,
  `file_type` varchar(50) NULL,
  `entity_type` varchar(50) NULL,
  `entity_id` int NULL,
  `alt_text` varchar(255) NULL,
  `title` varchar(255) NULL,
  `description` text NULL,
  `dimensions` json NULL,
  `public_url` varchar(500) NULL,
  `is_processed` boolean DEFAULT FALSE,
  `processing_status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_file_uploads_user` (`user_id`),
  KEY `idx_file_uploads_entity` (`entity_type`, `entity_id`),
  KEY `idx_file_uploads_type` (`file_type`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing columns to existing tables if they don't exist
SET @dbname = DATABASE();

-- Add discount_price to courses table if it doesn't exist
SET @table_name = 'courses';
SET @column_name = 'discount_price';
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @table_name 
    AND COLUMN_NAME = @column_name
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE courses ADD COLUMN discount_price DECIMAL(10,2) DEFAULT NULL AFTER price',
  'SELECT "Column discount_price already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add total_reviews to courses table if it doesn't exist  
SET @column_name = 'total_reviews';
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @table_name 
    AND COLUMN_NAME = @column_name
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE courses ADD COLUMN total_reviews INT DEFAULT 0',
  'SELECT "Column total_reviews already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_payment_transactions_date_range` 
  ON `payment_transactions` (`created_at`, `status`);

CREATE INDEX IF NOT EXISTS `idx_course_progress_active` 
  ON `course_progress` (`user_id`, `is_completed`, `progress_percentage`);

CREATE INDEX IF NOT EXISTS `idx_lesson_progress_recent` 
  ON `lesson_progress` (`user_id`, `last_watched_at`);

CREATE INDEX IF NOT EXISTS `idx_video_uploads_processing` 
  ON `video_uploads` (`processing_status`, `created_at`);

-- Insert sample data for testing (optional)
-- Uncomment the following lines if you want to add test data

/*
-- Sample payment transaction
INSERT INTO `payment_transactions` 
  (`user_id`, `course_id`, `transaction_id`, `payment_method`, `amount`, `status`) 
VALUES 
  (1, 1, 'MOCK-TEST-001', 'mock', 99.99, 'completed');

-- Sample course progress
INSERT INTO `course_progress` 
  (`user_id`, `course_id`, `enrollment_id`, `total_lessons`, `progress_percentage`) 
VALUES 
  (1, 1, 1, 10, 0.00);
*/

SELECT 'Missing tables and columns created successfully!' AS message;
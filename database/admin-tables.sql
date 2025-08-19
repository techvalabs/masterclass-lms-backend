-- Additional tables for Admin functionality
-- Real Estate Masterclass LMS - Admin Extension

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop additional tables if they exist
DROP TABLE IF EXISTS `payment_transactions`;
DROP TABLE IF EXISTS `refunds`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `coupon_usage`;
DROP TABLE IF EXISTS `file_uploads`;
DROP TABLE IF EXISTS `backup_logs`;

-- Payment Transactions Table
CREATE TABLE `payment_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NULL,
  `order_id` varchar(100) NOT NULL,
  `transaction_id` varchar(255) NOT NULL UNIQUE,
  `payment_method` enum('stripe','paypal','razorpay','manual') NOT NULL,
  `payment_provider_id` varchar(255) NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `fee_amount` decimal(10,2) DEFAULT 0.00,
  `net_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','completed','failed','cancelled','refunded','partially_refunded') DEFAULT 'pending',
  `payment_date` timestamp NULL,
  `description` text NULL,
  `metadata` json NULL,
  `gateway_response` json NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_transaction_id` (`transaction_id`),
  KEY `idx_transactions_user` (`user_id`),
  KEY `idx_transactions_course` (`course_id`),
  KEY `idx_transactions_order` (`order_id`),
  KEY `idx_transactions_status` (`status`),
  KEY `idx_transactions_payment_date` (`payment_date`),
  KEY `idx_transactions_amount` (`amount`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refunds Table
CREATE TABLE `refunds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` int NOT NULL,
  `user_id` int NOT NULL,
  `refund_transaction_id` varchar(255) NOT NULL UNIQUE,
  `amount` decimal(10,2) NOT NULL,
  `reason` enum('customer_request','fraud','duplicate','other') NOT NULL,
  `description` text NULL,
  `status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
  `processed_by` int NULL,
  `processed_at` timestamp NULL,
  `gateway_response` json NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_refund_transaction_id` (`refund_transaction_id`),
  KEY `idx_refunds_transaction` (`transaction_id`),
  KEY `idx_refunds_user` (`user_id`),
  KEY `idx_refunds_status` (`status`),
  KEY `idx_refunds_processed_by` (`processed_by`),
  FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coupons Table
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `description` text NULL,
  `type` enum('percentage','fixed_amount','free_shipping') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `minimum_amount` decimal(10,2) NULL,
  `maximum_discount` decimal(10,2) NULL,
  `usage_limit` int NULL,
  `usage_limit_per_user` int DEFAULT 1,
  `used_count` int DEFAULT 0,
  `applicable_courses` json NULL,
  `applicable_categories` json NULL,
  `exclude_courses` json NULL,
  `exclude_categories` json NULL,
  `starts_at` timestamp NULL,
  `expires_at` timestamp NULL,
  `is_active` boolean DEFAULT TRUE,
  `created_by` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_coupon_code` (`code`),
  KEY `idx_coupons_code` (`code`),
  KEY `idx_coupons_active` (`is_active`),
  KEY `idx_coupons_expires` (`expires_at`),
  KEY `idx_coupons_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coupon Usage Table
CREATE TABLE `coupon_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `coupon_id` int NOT NULL,
  `user_id` int NOT NULL,
  `transaction_id` int NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_coupon_usage_coupon` (`coupon_id`),
  KEY `idx_coupon_usage_user` (`user_id`),
  KEY `idx_coupon_usage_transaction` (`transaction_id`),
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File Uploads Table
CREATE TABLE `file_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL,
  `original_name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_type` enum('image','video','audio','document','archive','other') NOT NULL,
  `storage_driver` enum('local','s3','cloudinary') DEFAULT 'local',
  `entity_type` varchar(50) NULL,
  `entity_id` int NULL,
  `alt_text` varchar(255) NULL,
  `title` varchar(255) NULL,
  `description` text NULL,
  `dimensions` json NULL,
  `duration` int NULL,
  `is_processed` boolean DEFAULT FALSE,
  `processing_status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `thumbnail_path` varchar(500) NULL,
  `public_url` varchar(500) NULL,
  `metadata` json NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_uploads_user` (`user_id`),
  KEY `idx_uploads_entity` (`entity_type`, `entity_id`),
  KEY `idx_uploads_file_type` (`file_type`),
  KEY `idx_uploads_processed` (`is_processed`),
  KEY `idx_uploads_created` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backup Logs Table
CREATE TABLE `backup_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `backup_name` varchar(255) NOT NULL,
  `backup_type` enum('full','incremental','tables','files') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL,
  `compression` enum('none','gzip','zip') DEFAULT 'gzip',
  `status` enum('pending','running','completed','failed') DEFAULT 'pending',
  `started_at` timestamp NULL,
  `completed_at` timestamp NULL,
  `created_by` int NULL,
  `error_message` text NULL,
  `tables_included` json NULL,
  `metadata` json NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_backups_status` (`status`),
  KEY `idx_backups_type` (`backup_type`),
  KEY `idx_backups_created_by` (`created_by`),
  KEY `idx_backups_completed` (`completed_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing category table (if not exists from main schema)
CREATE TABLE IF NOT EXISTS `categories` (
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

-- Insert sample categories if empty
INSERT IGNORE INTO `categories` (`name`, `slug`, `description`, `color`, `icon`, `sort_order`) VALUES
('Real Estate Wholesaling', 'wholesaling', 'Learn the art of real estate wholesaling and contract assignment', '#10B981', 'home', 1),
('House Flipping', 'house-flipping', 'Master the complete house flipping process from purchase to sale', '#3B82F6', 'hammer', 2),
('Creative Financing', 'creative-financing', 'Discover alternative financing strategies for real estate investments', '#8B5CF6', 'credit-card', 3),
('Land Development', 'land-development', 'Learn land development from zoning to profitable projects', '#F59E0B', 'map', 4),
('Property Purchasing', 'property-purchasing', 'Master smart property acquisition strategies and techniques', '#EF4444', 'key', 5),
('Commercial Real Estate', 'commercial-real-estate', 'Advanced commercial real estate investment strategies', '#6B7280', 'building', 6);

-- Create triggers for automatic statistics updates

DELIMITER //

-- Trigger to update coupon usage count
CREATE TRIGGER `update_coupon_usage_count` 
  AFTER INSERT ON `coupon_usage`
  FOR EACH ROW
BEGIN
  UPDATE `coupons` 
  SET `used_count` = `used_count` + 1
  WHERE `id` = NEW.coupon_id;
END//

-- Trigger to update payment transaction status
CREATE TRIGGER `update_enrollment_payment_status` 
  AFTER UPDATE ON `payment_transactions`
  FOR EACH ROW
BEGIN
  IF OLD.status != NEW.status AND NEW.course_id IS NOT NULL THEN
    UPDATE `enrollments` 
    SET `payment_status` = CASE 
      WHEN NEW.status = 'completed' THEN 'completed'
      WHEN NEW.status = 'failed' THEN 'failed'
      WHEN NEW.status = 'refunded' THEN 'refunded'
      WHEN NEW.status = 'cancelled' THEN 'cancelled'
      ELSE 'pending'
    END,
    `payment_amount` = NEW.amount,
    `payment_transaction_id` = NEW.transaction_id
    WHERE `user_id` = NEW.user_id AND `course_id` = NEW.course_id;
  END IF;
END//

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- Add indexes for better performance
CREATE INDEX `idx_transactions_user_status` ON `payment_transactions` (`user_id`, `status`);
CREATE INDEX `idx_transactions_course_status` ON `payment_transactions` (`course_id`, `status`);
CREATE INDEX `idx_coupons_active_expires` ON `coupons` (`is_active`, `expires_at`);
CREATE INDEX `idx_uploads_entity_processed` ON `file_uploads` (`entity_type`, `entity_id`, `is_processed`);

-- End of admin tables schema
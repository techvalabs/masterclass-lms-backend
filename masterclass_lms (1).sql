-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 19, 2025 at 06:23 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `masterclass_lms`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points_required` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `name`, `description`, `icon`, `points_required`, `created_at`) VALUES
(1, 'Beginner', 'Start your learning journey', 'star', 0, '2025-08-17 00:54:57'),
(2, 'Intermediate', 'Earn 1000 points', 'star', 1000, '2025-08-17 00:54:57'),
(3, 'Advanced', 'Earn 5000 points', 'star', 5000, '2025-08-17 00:54:57'),
(4, 'Expert', 'Earn 10000 points', 'star', 10000, '2025-08-17 00:54:57'),
(5, 'Master', 'Earn 20000 points', 'crown', 20000, '2025-08-17 00:54:57');

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `metadata`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'user_deleted', 'user', 3, 'Deleted user: Test Student (test.student@example.com)', NULL, NULL, NULL, '2025-08-19 05:03:04'),
(2, 1, 'course_deleted', 'course', 1, 'Deleted course: Real Estate Investment Fundamentals', NULL, NULL, NULL, '2025-08-19 05:03:27'),
(3, 1, 'user_deleted', 'user', 2, 'Deleted user: Test Instructor (test.instructor@example.com)', NULL, NULL, NULL, '2025-08-19 05:03:43'),
(4, 1, 'course_created', 'course', 2, 'Created course: Test Course via API', NULL, NULL, NULL, '2025-08-19 05:20:03'),
(5, 1, 'course_deleted', 'course', 2, 'Deleted course: Test Course via API', NULL, NULL, NULL, '2025-08-19 05:21:12'),
(6, 1, 'user_deleted', 'user', 4, 'Deleted user: Test User (testuser@example.com)', NULL, NULL, NULL, '2025-08-19 05:21:18'),
(7, 1, 'course_created', 'course', 7, 'Created course: Test Course from API', NULL, NULL, NULL, '2025-08-19 05:25:35'),
(8, 1, 'course_created', 'course', 8, 'Created course: Test Course from API', NULL, NULL, NULL, '2025-08-19 05:25:40'),
(9, 1, 'course_created', 'course', 9, 'Created course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 05:26:46'),
(10, 1, 'course_created', 'course', 10, 'Created course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 05:26:47'),
(11, 1, 'course_created', 'course', 11, 'Created course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 05:26:49'),
(12, 1, 'course_created', 'course', 12, 'Created course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 05:26:52'),
(13, 1, 'course_created', 'course', 13, 'Created course: Test Course After Fix', NULL, NULL, NULL, '2025-08-19 05:33:21'),
(14, 1, 'course_created', 'course', 14, 'Created course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 05:34:35'),
(15, 1, 'course_created', 'course', 15, 'Created course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:44:37'),
(16, 1, 'course_created', 'course', 16, 'Created course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:44:40'),
(17, 1, 'course_created', 'course', 17, 'Created course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:51:51'),
(18, 1, 'course_created', 'course', 18, 'Created course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:51:56'),
(19, 1, 'course_created', 'course', 19, 'Created course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:52:31'),
(20, 1, 'course_updated', 'course', 18, 'Updated course: Updated Test Course', NULL, NULL, NULL, '2025-08-19 05:55:40'),
(21, 1, 'course_created', 'course', 20, 'Created course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:56:18'),
(22, 1, 'course_updated', 'course', 20, 'Updated course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:56:20'),
(23, 1, 'course_updated', 'course', 20, 'Updated course: sdsds', NULL, NULL, NULL, '2025-08-19 05:56:24'),
(24, 1, 'course_created', 'course', 21, 'Created course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:56:28'),
(25, 1, 'course_updated', 'course', 21, 'Updated course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:56:30'),
(26, 1, 'course_updated', 'course', 21, 'Updated course: gsadgfsdgdfdg', NULL, NULL, NULL, '2025-08-19 05:56:33'),
(27, 1, 'course_deleted', 'course', 21, 'Deleted course: gsadgfsdgdfdg', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(28, 1, 'course_deleted', 'course', 20, 'Deleted course: sdsds', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(29, 1, 'course_deleted', 'course', 19, 'Deleted course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(30, 1, 'course_deleted', 'course', 18, 'Deleted course: Updated Test Course', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(31, 1, 'course_deleted', 'course', 13, 'Deleted course: Test Course After Fix', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(32, 1, 'course_deleted', 'course', 17, 'Deleted course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(33, 1, 'course_deleted', 'course', 12, 'Deleted course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(34, 1, 'course_deleted', 'course', 16, 'Deleted course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(35, 1, 'course_deleted', 'course', 15, 'Deleted course: Test Course API', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(36, 1, 'course_deleted', 'course', 14, 'Deleted course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 05:56:52'),
(37, 1, 'course_deleted', 'course', 7, 'Deleted course: Test Course from API', NULL, NULL, NULL, '2025-08-19 05:57:01'),
(38, 1, 'course_deleted', 'course', 8, 'Deleted course: Test Course from API', NULL, NULL, NULL, '2025-08-19 05:57:01'),
(39, 1, 'course_deleted', 'course', 9, 'Deleted course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 06:18:17'),
(40, 1, 'course_deleted', 'course', 10, 'Deleted course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 06:18:17'),
(41, 1, 'course_deleted', 'course', 11, 'Deleted course: sdfasdfasdgasdf', NULL, NULL, NULL, '2025-08-19 06:18:17'),
(42, 1, 'course_created', 'course', 22, 'Created course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:19:08'),
(43, 1, 'course_created', 'course', 23, 'Created course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:19:09'),
(44, 1, 'course_created', 'course', 24, 'Created course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:19:11'),
(45, 1, 'course_created', 'course', 25, 'Created course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:19:14'),
(46, 1, 'course_created', 'course', 26, 'Created course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:19:34'),
(47, 1, 'course_created', 'course', 27, 'Created course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:19:35'),
(48, 1, 'course_created', 'course', 28, 'Created course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:19:37'),
(49, 1, 'course_created', 'course', 29, 'Created course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:19:40'),
(50, 1, 'course_deleted', 'course', 28, 'Deleted course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:20:13'),
(51, 1, 'course_deleted', 'course', 29, 'Deleted course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:20:13'),
(52, 1, 'course_deleted', 'course', 26, 'Deleted course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:20:13'),
(53, 1, 'course_deleted', 'course', 27, 'Deleted course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:20:13'),
(54, 1, 'course_deleted', 'course', 25, 'Deleted course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:20:13'),
(55, 1, 'course_deleted', 'course', 24, 'Deleted course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:20:13'),
(56, 1, 'course_deleted', 'course', 23, 'Deleted course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:20:13'),
(57, 1, 'course_deleted', 'course', 22, 'Deleted course: sadfasdgasdgasdfgasdf', NULL, NULL, NULL, '2025-08-19 06:20:13');

-- --------------------------------------------------------

--
-- Table structure for table `backup_settings`
--

CREATE TABLE `backup_settings` (
  `id` int NOT NULL,
  `enable_auto_backup` tinyint(1) DEFAULT '1',
  `backup_frequency` enum('daily','weekly','monthly') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'weekly',
  `backup_time` time DEFAULT '03:00:00',
  `backup_retention_days` int DEFAULT '30',
  `backup_storage_type` enum('local','s3','google_drive','dropbox') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'local',
  `backup_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '/backups',
  `s3_backup_bucket` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `s3_backup_region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enable_database_optimization` tinyint(1) DEFAULT '1',
  `optimization_frequency` enum('daily','weekly','monthly') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'weekly',
  `enable_cache_clearing` tinyint(1) DEFAULT '1',
  `cache_clear_frequency_hours` int DEFAULT '24',
  `enable_log_rotation` tinyint(1) DEFAULT '1',
  `log_retention_days` int DEFAULT '30',
  `enable_temp_file_cleanup` tinyint(1) DEFAULT '1',
  `temp_file_retention_hours` int DEFAULT '24',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `backup_settings`
--

INSERT INTO `backup_settings` (`id`, `enable_auto_backup`, `backup_frequency`, `backup_time`, `backup_retention_days`, `backup_storage_type`, `backup_path`, `s3_backup_bucket`, `s3_backup_region`, `enable_database_optimization`, `optimization_frequency`, `enable_cache_clearing`, `cache_clear_frequency_hours`, `enable_log_rotation`, `log_retention_days`, `enable_temp_file_cleanup`, `temp_file_retention_hours`, `created_at`, `updated_at`) VALUES
(1, 1, 'weekly', '03:00:00', 30, 'local', '/backups', NULL, NULL, 1, 'weekly', 1, 24, 1, 30, 1, 24, '2025-08-18 12:23:13', '2025-08-18 12:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `badges`
--

CREATE TABLE `badges` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points_required` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `badges`
--

INSERT INTO `badges` (`id`, `name`, `description`, `icon`, `points_required`, `created_at`) VALUES
(1, 'First Steps', 'Complete your first lesson', 'trophy', 10, '2025-08-17 00:54:57'),
(2, 'Quick Learner', 'Complete 5 lessons in one day', 'zap', 50, '2025-08-17 00:54:57'),
(3, 'Dedicated Student', 'Maintain a 7-day learning streak', 'flame', 100, '2025-08-17 00:54:57'),
(4, 'Course Master', 'Complete your first course', 'award', 200, '2025-08-17 00:54:57'),
(5, 'Knowledge Seeker', 'Enroll in 5 courses', 'book', 150, '2025-08-17 00:54:57');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrollment_id` int NOT NULL,
  `certificate_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_until` timestamp NULL DEFAULT NULL,
  `verification_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `instructor_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `discount_price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `thumbnail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preview_video` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` enum('beginner','intermediate','advanced','all') COLLATE utf8mb4_unicode_ci DEFAULT 'all',
  `duration_hours` decimal(5,2) DEFAULT '0.00',
  `language` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'English',
  `is_published` tinyint(1) DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `rating` decimal(3,2) DEFAULT NULL,
  `total_reviews` int DEFAULT '0',
  `total_students` int DEFAULT '0',
  `total_lessons` int DEFAULT '0',
  `requirements` json DEFAULT NULL,
  `objectives` json DEFAULT NULL,
  `target_audience` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_categories`
--

CREATE TABLE `course_categories` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_categories`
--

INSERT INTO `course_categories` (`id`, `name`, `slug`, `description`, `icon`, `parent_id`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Real Estate Investment', 'real-estate-investment', 'Learn about real estate investment strategies', 'home', NULL, 0, 1, '2025-08-19 05:00:43', '2025-08-19 05:00:43'),
(2, 'Property Management', 'property-management', 'Master property management techniques', 'building', NULL, 0, 1, '2025-08-19 05:00:43', '2025-08-19 05:00:43'),
(3, 'Wholesaling', 'wholesaling', 'Wholesale real estate deals', 'dollar-sign', NULL, 0, 1, '2025-08-19 05:00:43', '2025-08-19 05:00:43');

-- --------------------------------------------------------

--
-- Table structure for table `course_lessons`
--

CREATE TABLE `course_lessons` (
  `id` int NOT NULL,
  `course_id` int NOT NULL,
  `module_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `content` text COLLATE utf8mb4_unicode_ci,
  `content_type` enum('video','text','quiz','assignment') COLLATE utf8mb4_unicode_ci DEFAULT 'video',
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_duration` int DEFAULT '0',
  `duration_minutes` int DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `lesson_order` int DEFAULT '0',
  `is_free_preview` tinyint(1) DEFAULT '0',
  `is_published` tinyint(1) DEFAULT '1',
  `resources` json DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_modules`
--

CREATE TABLE `course_modules` (
  `id` int NOT NULL,
  `course_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0',
  `is_published` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_progress`
--

CREATE TABLE `course_progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrollment_id` int NOT NULL,
  `completed_lessons` int DEFAULT '0',
  `total_lessons` int DEFAULT '0',
  `completed_modules` int DEFAULT '0',
  `total_modules` int DEFAULT '0',
  `progress_percentage` decimal(5,2) DEFAULT '0.00',
  `total_watch_time_seconds` int DEFAULT '0',
  `last_accessed_lesson_id` int DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_reviews`
--

CREATE TABLE `course_reviews` (
  `id` int NOT NULL,
  `course_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_verified_purchase` tinyint(1) DEFAULT '0',
  `helpful_count` int DEFAULT '0',
  `reported_count` int DEFAULT '0',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'approved',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `course_settings`
--

CREATE TABLE `course_settings` (
  `id` int NOT NULL,
  `default_price` decimal(10,2) DEFAULT '0.00',
  `default_currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `auto_publish` tinyint(1) DEFAULT '0',
  `require_approval` tinyint(1) DEFAULT '1',
  `allow_free_courses` tinyint(1) DEFAULT '1',
  `max_upload_size_mb` int DEFAULT '500',
  `allowed_video_formats` json DEFAULT NULL,
  `allowed_doc_formats` json DEFAULT NULL,
  `allowed_image_formats` json DEFAULT NULL,
  `enable_certificates` tinyint(1) DEFAULT '1',
  `certificate_template` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'default',
  `completion_threshold` int DEFAULT '80',
  `enable_course_reviews` tinyint(1) DEFAULT '1',
  `review_moderation` tinyint(1) DEFAULT '0',
  `enable_course_preview` tinyint(1) DEFAULT '1',
  `preview_duration_minutes` int DEFAULT '5',
  `enable_drip_content` tinyint(1) DEFAULT '0',
  `enable_prerequisites` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_settings`
--

INSERT INTO `course_settings` (`id`, `default_price`, `default_currency`, `auto_publish`, `require_approval`, `allow_free_courses`, `max_upload_size_mb`, `allowed_video_formats`, `allowed_doc_formats`, `allowed_image_formats`, `enable_certificates`, `certificate_template`, `completion_threshold`, `enable_course_reviews`, `review_moderation`, `enable_course_preview`, `preview_duration_minutes`, `enable_drip_content`, `enable_prerequisites`, `created_at`, `updated_at`) VALUES
(1, 0.00, 'USD', 0, 1, 1, 500, NULL, NULL, NULL, 1, 'default', 80, 1, 0, 1, 5, 0, 1, '2025-08-18 12:23:13', '2025-08-18 12:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `from_user_id` int NOT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'sent',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `completion_percentage` decimal(5,2) DEFAULT '0.00',
  `completed_at` timestamp NULL DEFAULT NULL,
  `certificate_issued` tinyint(1) DEFAULT '0',
  `certificate_issued_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_uploads`
--

CREATE TABLE `file_uploads` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `dimensions` json DEFAULT NULL,
  `public_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cdn_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_processed` tinyint(1) DEFAULT '0',
  `processing_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

CREATE TABLE `instructors` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `expertise` text COLLATE utf8mb4_unicode_ci,
  `experience` text COLLATE utf8mb4_unicode_ci,
  `qualifications` json DEFAULT NULL,
  `specialties` json DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `total_reviews` int DEFAULT '0',
  `total_students` int DEFAULT '0',
  `total_courses` int DEFAULT '0',
  `status` enum('pending','approved','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` (`id`, `user_id`, `bio`, `expertise`, `experience`, `qualifications`, `specialties`, `rating`, `total_reviews`, `total_students`, `total_courses`, `status`, `approved_at`, `created_at`, `updated_at`) VALUES
(2, 1, NULL, NULL, 'System Administrator with LMS management experience', NULL, NULL, 0.00, 0, 0, 0, 'approved', NULL, '2025-08-19 05:10:29', '2025-08-19 05:10:29');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `video_progress` int DEFAULT '0',
  `is_completed` tinyint(1) DEFAULT '0',
  `time_spent` int DEFAULT '0',
  `completion_percentage` decimal(5,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `last_watched_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `checksum` varchar(64) DEFAULT NULL,
  `success` tinyint(1) DEFAULT '1',
  `execution_time_ms` int DEFAULT NULL,
  `error_message` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `filename`, `executed_at`, `checksum`, `success`, `execution_time_ms`, `error_message`) VALUES
(1, '001_create_initial_schema.sql', '2025-08-19 02:29:56', NULL, 0, 326, 'Table \'masterclass_lms.enrollments\' doesn\'t exist'),
(3, 'consolidated_migration.sql', '2025-08-19 02:30:13', '7301f2987b90fa477f2c8d29b0854dc6f56896ed56bf419f93fcc54a51bb9f2d', 1, 150, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `action_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `email_notifications` tinyint(1) DEFAULT '1',
  `push_notifications` tinyint(1) DEFAULT '1',
  `sms_notifications` tinyint(1) DEFAULT '0',
  `course_updates` tinyint(1) DEFAULT '1',
  `promotional_emails` tinyint(1) DEFAULT '1',
  `forum_notifications` tinyint(1) DEFAULT '1',
  `assignment_reminders` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `status` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT '0.00',
  `refunded_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `platform_config`
--

CREATE TABLE `platform_config` (
  `id` int NOT NULL,
  `site_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Masterclass LMS',
  `site_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `favicon_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `timezone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'UTC',
  `date_format` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'YYYY-MM-DD',
  `time_format` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '24h',
  `language` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'en',
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `maintenance_mode` tinyint(1) DEFAULT '0',
  `maintenance_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `footer_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `copyright_text` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platform_config`
--

INSERT INTO `platform_config` (`id`, `site_name`, `site_url`, `logo_url`, `favicon_url`, `admin_email`, `support_email`, `contact_phone`, `contact_address`, `timezone`, `date_format`, `time_format`, `language`, `currency`, `maintenance_mode`, `maintenance_message`, `footer_text`, `copyright_text`, `social_links`, `created_at`, `updated_at`) VALUES
(1, 'Masterclass LMS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'UTC', 'YYYY-MM-DD', '24h', 'en', 'USD', 0, NULL, NULL, NULL, NULL, '2025-08-18 12:23:13', '2025-08-18 12:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int NOT NULL,
  `course_id` int NOT NULL,
  `lesson_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `questions` json NOT NULL,
  `passing_score` int DEFAULT '70',
  `time_limit_minutes` int DEFAULT '0',
  `max_attempts` int DEFAULT '0',
  `shuffle_questions` tinyint(1) DEFAULT '0',
  `show_correct_answers` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `user_id` int NOT NULL,
  `attempt_number` int NOT NULL,
  `score_percentage` decimal(5,2) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT '0',
  `answers` json DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `registration_settings`
--

CREATE TABLE `registration_settings` (
  `id` int NOT NULL,
  `enable_registration` tinyint(1) DEFAULT '1',
  `registration_type` enum('open','invite_only','approval_required') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `require_email_verification` tinyint(1) DEFAULT '1',
  `email_verification_expire_hours` int DEFAULT '24',
  `default_user_role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'student',
  `enable_social_login` tinyint(1) DEFAULT '0',
  `google_client_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_client_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_app_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_app_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enable_instructor_registration` tinyint(1) DEFAULT '1',
  `instructor_approval_required` tinyint(1) DEFAULT '1',
  `instructor_commission_rate` decimal(5,2) DEFAULT '30.00',
  `enable_profile_completion` tinyint(1) DEFAULT '1',
  `required_profile_fields` json DEFAULT NULL,
  `enable_username` tinyint(1) DEFAULT '0',
  `username_min_length` int DEFAULT '3',
  `enable_avatar_upload` tinyint(1) DEFAULT '1',
  `max_avatar_size_mb` int DEFAULT '5',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registration_settings`
--

INSERT INTO `registration_settings` (`id`, `enable_registration`, `registration_type`, `require_email_verification`, `email_verification_expire_hours`, `default_user_role`, `enable_social_login`, `google_client_id`, `google_client_secret`, `facebook_app_id`, `facebook_app_secret`, `enable_instructor_registration`, `instructor_approval_required`, `instructor_commission_rate`, `enable_profile_completion`, `required_profile_fields`, `enable_username`, `username_min_length`, `enable_avatar_upload`, `max_avatar_size_mb`, `created_at`, `updated_at`) VALUES
(1, 1, 'open', 1, 24, 'student', 0, NULL, NULL, NULL, NULL, 1, 1, 30.00, 1, NULL, 0, 3, 1, 5, '2025-08-18 12:23:13', '2025-08-18 12:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `permissions`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'System administrator', '[\"*\"]', 1, '2025-08-19 04:43:09', '2025-08-19 04:43:09'),
(2, 'instructor', 'Course instructor', '[\"courses.*\", \"lessons.*\", \"students.view\"]', 1, '2025-08-19 04:43:09', '2025-08-19 04:43:09'),
(3, 'student', 'Regular student', '[\"courses.view\", \"lessons.view\", \"profile.*\"]', 1, '2025-08-19 04:43:09', '2025-08-19 04:43:09');

-- --------------------------------------------------------

--
-- Table structure for table `security_settings`
--

CREATE TABLE `security_settings` (
  `id` int NOT NULL,
  `password_min_length` int DEFAULT '8',
  `password_require_uppercase` tinyint(1) DEFAULT '1',
  `password_require_lowercase` tinyint(1) DEFAULT '1',
  `password_require_numbers` tinyint(1) DEFAULT '1',
  `password_require_special` tinyint(1) DEFAULT '1',
  `password_expiry_days` int DEFAULT '0',
  `session_timeout_minutes` int DEFAULT '60',
  `max_login_attempts` int DEFAULT '5',
  `lockout_duration_minutes` int DEFAULT '30',
  `enable_two_factor` tinyint(1) DEFAULT '0',
  `two_factor_required_for_admin` tinyint(1) DEFAULT '0',
  `enable_captcha` tinyint(1) DEFAULT '0',
  `captcha_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'recaptcha',
  `captcha_site_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `captcha_secret_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enable_ip_whitelist` tinyint(1) DEFAULT '0',
  `admin_ip_whitelist` json DEFAULT NULL,
  `enable_audit_log` tinyint(1) DEFAULT '1',
  `audit_log_retention_days` int DEFAULT '90',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `security_settings`
--

INSERT INTO `security_settings` (`id`, `password_min_length`, `password_require_uppercase`, `password_require_lowercase`, `password_require_numbers`, `password_require_special`, `password_expiry_days`, `session_timeout_minutes`, `max_login_attempts`, `lockout_duration_minutes`, `enable_two_factor`, `two_factor_required_for_admin`, `enable_captcha`, `captcha_type`, `captcha_site_key`, `captcha_secret_key`, `enable_ip_whitelist`, `admin_ip_whitelist`, `enable_audit_log`, `audit_log_retention_days`, `created_at`, `updated_at`) VALUES
(1, 8, 1, 1, 1, 1, 0, 60, 5, 30, 0, 0, 0, 'recaptcha', NULL, NULL, 0, NULL, 1, 90, '2025-08-18 12:23:13', '2025-08-18 12:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `seo_settings`
--

CREATE TABLE `seo_settings` (
  `id` int NOT NULL,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `meta_keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `og_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_card_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'summary_large_image',
  `twitter_handle` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_analytics_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_tag_manager_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_pixel_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hotjar_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enable_sitemap` tinyint(1) DEFAULT '1',
  `enable_robots_txt` tinyint(1) DEFAULT '1',
  `robots_txt_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `enable_schema_markup` tinyint(1) DEFAULT '1',
  `canonical_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enable_amp` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seo_settings`
--

INSERT INTO `seo_settings` (`id`, `meta_title`, `meta_description`, `meta_keywords`, `og_title`, `og_description`, `og_image`, `twitter_card_type`, `twitter_handle`, `google_analytics_id`, `google_tag_manager_id`, `facebook_pixel_id`, `hotjar_id`, `enable_sitemap`, `enable_robots_txt`, `robots_txt_content`, `enable_schema_markup`, `canonical_url`, `enable_amp`, `created_at`, `updated_at`) VALUES
(1, 'Masterclass LMS - Online Learning Platform', NULL, NULL, NULL, NULL, NULL, 'summary_large_image', NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, 1, NULL, 0, '2025-08-18 12:23:13', '2025-08-18 12:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `settings_history`
--

CREATE TABLE `settings_history` (
  `id` int NOT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `changed_by` int DEFAULT NULL,
  `change_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int NOT NULL,
  `setting_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `setting_type` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_public` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int NOT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `notification_preferences` json DEFAULT NULL,
  `privacy_settings` json DEFAULT NULL,
  `appearance_settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role_id`, `avatar`, `phone`, `bio`, `location`, `website`, `social_links`, `email_verified`, `email_verified_at`, `is_active`, `last_login`, `notification_preferences`, `privacy_settings`, `appearance_settings`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'jesrelagang94@gmail.com', '$2a$10$WyfLN6kSA83PyNkw.q4VdedPFR75Cpvm6EZZ5QJopoWsrR8jsjUGe', 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 1, '2025-08-19 06:23:09', NULL, NULL, NULL, '2025-08-19 04:43:09', '2025-08-19 06:23:09'),
(5, 'Gretchen F.', 'gretchen@economicmasonry.com', '$2a$12$HpDdzc8EzF9mfRjdMlN8TugcT8AZVhENut8RDHjkDbNSJD2y7TkjC', 1, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-08-19 05:21:29', '2025-08-19 05:21:29'),
(6, 'test jhon', 'teststudent@test.com', '$2a$12$nOLsIWX0pDVrsmGEnbf.SeoeD3bg7M6sdHYIpmg.YDUMq5rW.k3N.', 3, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 1, '2025-08-19 06:23:01', NULL, NULL, NULL, '2025-08-19 06:22:44', '2025-08-19 06:23:01');

-- --------------------------------------------------------

--
-- Table structure for table `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `badge_id` int NOT NULL,
  `earned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_favorites`
--

CREATE TABLE `user_favorites` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_points`
--

CREATE TABLE `user_points` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `points` int NOT NULL DEFAULT '0',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `video_uploads`
--

CREATE TABLE `video_uploads` (
  `id` int NOT NULL,
  `lesson_id` int DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `original_filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cdn_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hls_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_seconds` int DEFAULT '0',
  `resolution` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bitrate` int DEFAULT NULL,
  `codec` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `format` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processing_status` enum('pending','processing','completed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `processing_error` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `processed_at` timestamp NULL DEFAULT NULL,
  `transcoding_jobs` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `view_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `backup_settings`
--
ALTER TABLE `backup_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_badge_name` (`name`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `certificate_number` (`certificate_number`),
  ADD UNIQUE KEY `unique_certificate` (`user_id`,`course_id`),
  ADD KEY `enrollment_id` (`enrollment_id`),
  ADD KEY `idx_number` (`certificate_number`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_course` (`course_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `instructor_id` (`instructor_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `course_categories`
--
ALTER TABLE `course_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `course_lessons`
--
ALTER TABLE `course_lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_modules`
--
ALTER TABLE `course_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_sort` (`sort_order`);

--
-- Indexes for table `course_progress`
--
ALTER TABLE `course_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_course_progress` (`user_id`,`course_id`),
  ADD KEY `idx_course_progress_user` (`user_id`),
  ADD KEY `idx_course_progress_course` (`course_id`),
  ADD KEY `idx_course_progress_enrollment` (`enrollment_id`),
  ADD KEY `idx_course_progress_completed` (`is_completed`),
  ADD KEY `idx_course_progress_percentage` (`progress_percentage`);

--
-- Indexes for table `course_reviews`
--
ALTER TABLE `course_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review` (`course_id`,`user_id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `course_settings`
--
ALTER TABLE `course_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_from_user_id` (`from_user_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `file_uploads`
--
ALTER TABLE `file_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_type` (`file_type`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `instructors`
--
ALTER TABLE `instructors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_lesson_progress` (`user_id`,`lesson_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_lesson` (`lesson_id`),
  ADD KEY `idx_completed` (`is_completed`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `filename` (`filename`),
  ADD KEY `idx_filename` (`filename`),
  ADD KEY `idx_executed_at` (`executed_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `platform_config`
--
ALTER TABLE `platform_config`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_lesson` (`lesson_id`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_quiz_user` (`quiz_id`,`user_id`),
  ADD KEY `idx_attempt` (`attempt_number`);

--
-- Indexes for table `registration_settings`
--
ALTER TABLE `registration_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `security_settings`
--
ALTER TABLE `security_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `seo_settings`
--
ALTER TABLE `seo_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings_history`
--
ALTER TABLE `settings_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category_key` (`category`,`setting_key`),
  ADD KEY `idx_changed_by` (`changed_by`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`),
  ADD KEY `idx_public` (`is_public`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_badge` (`user_id`,`badge_id`),
  ADD KEY `idx_user_badges_user` (`user_id`),
  ADD KEY `badge_id` (`badge_id`);

--
-- Indexes for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_favorite` (`user_id`,`course_id`),
  ADD KEY `idx_user_favorites_user` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `user_points`
--
ALTER TABLE `user_points`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_points_user` (`user_id`),
  ADD KEY `idx_user_points_created` (`created_at`);

--
-- Indexes for table `video_uploads`
--
ALTER TABLE `video_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_video_uploads_course` (`course_id`),
  ADD KEY `idx_video_uploads_user` (`uploaded_by`),
  ADD KEY `idx_video_uploads_status` (`processing_status`),
  ADD KEY `idx_video_uploads_created` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `backup_settings`
--
ALTER TABLE `backup_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `course_categories`
--
ALTER TABLE `course_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `course_lessons`
--
ALTER TABLE `course_lessons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `course_modules`
--
ALTER TABLE `course_modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_progress`
--
ALTER TABLE `course_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `course_reviews`
--
ALTER TABLE `course_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_settings`
--
ALTER TABLE `course_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `file_uploads`
--
ALTER TABLE `file_uploads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `instructors`
--
ALTER TABLE `instructors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `platform_config`
--
ALTER TABLE `platform_config`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `registration_settings`
--
ALTER TABLE `registration_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `security_settings`
--
ALTER TABLE `security_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `seo_settings`
--
ALTER TABLE `seo_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `settings_history`
--
ALTER TABLE `settings_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_favorites`
--
ALTER TABLE `user_favorites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_points`
--
ALTER TABLE `user_points`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `video_uploads`
--
ALTER TABLE `video_uploads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `certificates_ibfk_3` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `course_categories`
--
ALTER TABLE `course_categories`
  ADD CONSTRAINT `course_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `course_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `course_lessons`
--
ALTER TABLE `course_lessons`
  ADD CONSTRAINT `course_lessons_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_modules`
--
ALTER TABLE `course_modules`
  ADD CONSTRAINT `course_modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_progress`
--
ALTER TABLE `course_progress`
  ADD CONSTRAINT `course_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_progress_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_progress_ibfk_3` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `course_reviews`
--
ALTER TABLE `course_reviews`
  ADD CONSTRAINT `course_reviews_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD CONSTRAINT `email_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `email_logs_ibfk_2` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `file_uploads`
--
ALTER TABLE `file_uploads`
  ADD CONSTRAINT `file_uploads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `instructors`
--
ALTER TABLE `instructors`
  ADD CONSTRAINT `instructors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `notification_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `settings_history`
--
ALTER TABLE `settings_history`
  ADD CONSTRAINT `settings_history_ibfk_1` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_favorites_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_points`
--
ALTER TABLE `user_points`
  ADD CONSTRAINT `user_points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `video_uploads`
--
ALTER TABLE `video_uploads`
  ADD CONSTRAINT `video_uploads_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `video_uploads_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

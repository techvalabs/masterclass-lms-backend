-- ===========================================
-- Database Reset and Clean Setup Script
-- ===========================================

-- Drop the database if it exists and recreate it
DROP DATABASE IF EXISTS masterclass_lms;
CREATE DATABASE masterclass_lms;
USE masterclass_lms;

-- Now apply the consolidated migration
SOURCE C:/laragon/www/masterclass-lms/backend/database/migrations/consolidated_migration.sql;
-- Add missing columns to courses table for Course Management Page
-- Run this script to add statistics and pricing columns

USE masterclass_lms;

-- Add discount_price column
ALTER TABLE courses 
ADD COLUMN discount_price DECIMAL(10,2) DEFAULT NULL AFTER price;

-- Add rating column
ALTER TABLE courses 
ADD COLUMN rating DECIMAL(3,2) DEFAULT NULL;

-- Add total_reviews column
ALTER TABLE courses 
ADD COLUMN total_reviews INT DEFAULT 0;

-- Add total_students column
ALTER TABLE courses 
ADD COLUMN total_students INT DEFAULT 0;

-- Add total_lessons column
ALTER TABLE courses 
ADD COLUMN total_lessons INT DEFAULT 0;

-- Add instructor_name for denormalized display
ALTER TABLE courses
ADD COLUMN instructor_name VARCHAR(255) DEFAULT NULL;

-- Add category_name for denormalized display
ALTER TABLE courses
ADD COLUMN category_name VARCHAR(255) DEFAULT NULL;

-- Update existing courses with instructor names
UPDATE courses c
JOIN instructors i ON c.instructor_id = i.id
SET c.instructor_name = i.name;

-- Update existing courses with category names
UPDATE courses c
JOIN course_categories cc ON c.category_id = cc.id
SET c.category_name = cc.name;

-- Update lesson counts
UPDATE courses c
SET c.total_lessons = (
    SELECT COUNT(*) 
    FROM course_lessons cl 
    WHERE cl.course_id = c.id
);

-- Update student counts
UPDATE courses c
SET c.total_students = (
    SELECT COUNT(DISTINCT user_id) 
    FROM enrollments e 
    WHERE e.course_id = c.id
);

-- Update review counts and ratings
UPDATE courses c
SET 
    c.total_reviews = (
        SELECT COUNT(*) 
        FROM course_reviews cr 
        WHERE cr.course_id = c.id AND cr.is_published = 1
    ),
    c.rating = (
        SELECT AVG(rating) 
        FROM course_reviews cr 
        WHERE cr.course_id = c.id AND cr.is_published = 1
    );

SELECT 'Course statistics columns added successfully!' as message;
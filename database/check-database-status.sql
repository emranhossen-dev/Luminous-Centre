-- Comprehensive Database Status Check
-- Run this in Supabase SQL Editor to check all tables and columns

-- Check courses table structure
SELECT 
    'courses' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Check course_enrollment_requests table structure
SELECT 
    'course_enrollment_requests' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_enrollment_requests' 
ORDER BY ordinal_position;

-- Check seminar_applications table structure
SELECT 
    'seminar_applications' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'seminar_applications' 
ORDER BY ordinal_position;

-- Check users table structure
SELECT 
    'users' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('courses', 'course_enrollment_requests', 'seminar_applications', 'users')
ORDER BY table_name;

-- Check current data counts
SELECT 
    'courses' as table_name,
    COUNT(*) as record_count
FROM courses
UNION ALL
SELECT 
    'course_enrollment_requests' as table_name,
    COUNT(*) as record_count
FROM course_enrollment_requests
UNION ALL
SELECT 
    'seminar_applications' as table_name,
    COUNT(*) as record_count
FROM seminar_applications
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users;

-- Fix course_enrollment_requests table structure
-- Add missing columns that are required by the enrollment API

-- Add missing user information columns
ALTER TABLE course_enrollment_requests 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add missing payment screenshot column
ALTER TABLE course_enrollment_requests 
ADD COLUMN IF NOT EXISTS payment_screenshot_url VARCHAR(500);

-- Add missing course information columns
ALTER TABLE course_enrollment_requests 
ADD COLUMN IF NOT EXISTS course_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS course_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS course_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS batch_name VARCHAR(100);

-- Update existing records to have default values if needed
UPDATE course_enrollment_requests 
SET 
    full_name = COALESCE(full_name, 'Unknown'),
    mobile_number = COALESCE(mobile_number, 'N/A'),
    email = COALESCE(email, 'N/A'),
    payment_screenshot_url = COALESCE(payment_screenshot_url, ''),
    course_title = COALESCE(course_title, 'Unknown Course'),
    course_category = COALESCE(course_category, 'General'),
    course_price = COALESCE(course_price, 0),
    batch_name = COALESCE(batch_name, 'Current Batch')
WHERE full_name IS NULL OR mobile_number IS NULL OR email IS NULL;

-- Verify the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'course_enrollment_requests' 
ORDER BY ordinal_position;

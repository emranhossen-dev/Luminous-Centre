-- Fix Missing Tables and Columns
-- Run this script in Supabase SQL Editor to fix all database issues

-- First, check if course_enrollment_requests table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'course_enrollment_requests'
    ) THEN
        CREATE TABLE course_enrollment_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
          
          -- User Information (collected from form)
          full_name VARCHAR(255) NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          
          -- Payment Information
          payment_method VARCHAR(20) NOT NULL DEFAULT 'manual',
          payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
          enrollment_status VARCHAR(20) NOT NULL DEFAULT 'applied',
          
          -- Payment Details
          amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
          currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
          transaction_id VARCHAR(100),
          payment_screenshot_url VARCHAR(500),
          
          -- Course Information (auto-populated from course)
          course_title VARCHAR(255),
          course_category VARCHAR(100),
          course_price DECIMAL(10, 2),
          batch_name VARCHAR(100),
          
          -- Admin Management
          admin_note TEXT,
          reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          reviewed_at TIMESTAMP,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes
        CREATE INDEX idx_enrollment_requests_user_id ON course_enrollment_requests(user_id);
        CREATE INDEX idx_enrollment_requests_course_id ON course_enrollment_requests(course_id);
        CREATE INDEX idx_enrollment_requests_status ON course_enrollment_requests(enrollment_status, payment_status);
        CREATE INDEX idx_enrollment_requests_created_at ON course_enrollment_requests(created_at);
        
        RAISE NOTICE 'Created course_enrollment_requests table';
    END IF;
END $$;

-- Check if seminar_applications table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'seminar_applications'
    ) THEN
        CREATE TABLE seminar_applications (
          id SERIAL PRIMARY KEY,
          
          -- Applicant Information
          full_name VARCHAR(255) NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          whatsapp_number VARCHAR(20),
          
          -- Application Details
          seminar_title VARCHAR(255) NOT NULL DEFAULT 'Free Skill Development Seminar',
          application_status VARCHAR(20) NOT NULL DEFAULT 'applied',
          
          -- Admin Management
          admin_note TEXT,
          reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          reviewed_at TIMESTAMP,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes
        CREATE INDEX idx_seminar_applications_status ON seminar_applications(application_status);
        CREATE INDEX idx_seminar_applications_created_at ON seminar_applications(created_at);
        
        RAISE NOTICE 'Created seminar_applications table';
    END IF;
END $$;

-- Check if users table exists and has required columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255),
          full_name VARCHAR(255),
          mobile_number VARCHAR(20),
          role VARCHAR(50) DEFAULT 'student',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Created users table';
    END IF;
END $$;

-- Add missing columns to courses table if needed
DO $$
BEGIN
    -- Check if course_outline_url exists in courses table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'course_outline_url'
    ) THEN
        ALTER TABLE courses ADD COLUMN course_outline_url TEXT;
        RAISE NOTICE 'Added course_outline_url column to courses table';
    END IF;
    
    -- Check if batch_name exists in courses table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'batch_name'
    ) THEN
        ALTER TABLE courses ADD COLUMN batch_name VARCHAR(100);
        RAISE NOTICE 'Added batch_name column to courses table';
    END IF;
END $$;

-- Create function to update updated_at timestamp if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        RAISE NOTICE 'Created update_updated_at_column function';
    END IF;
END $$;

-- Create triggers for updated_at if they don't exist
DO $$
BEGIN
    -- For course_enrollment_requests
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_course_enrollment_requests_updated_at'
    ) THEN
        CREATE TRIGGER update_course_enrollment_requests_updated_at 
            BEFORE UPDATE ON course_enrollment_requests 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'Created trigger for course_enrollment_requests';
    END IF;
    
    -- For seminar_applications
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_seminar_applications_updated_at'
    ) THEN
        CREATE TRIGGER update_seminar_applications_updated_at 
            BEFORE UPDATE ON seminar_applications 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'Created trigger for seminar_applications';
    END IF;
END $$;

-- Final verification
SELECT 
    'Database Fix Complete' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('courses', 'course_enrollment_requests', 'seminar_applications', 'users')) as tables_created,
    NOW() as completed_at;

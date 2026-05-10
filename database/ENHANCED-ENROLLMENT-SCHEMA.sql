-- Enhanced Enrollment Schema with Status Tracking and Image Upload
-- This schema supports the new enrollment system with payment verification and seminar applications

-- Course Enrollment Requests Table (Enhanced)
CREATE TABLE IF NOT EXISTS course_enrollment_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  
  -- User Information (collected from form)
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  -- Payment Information
  payment_method VARCHAR(20) NOT NULL DEFAULT 'manual', -- 'manual' or 'bkash'
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed'
  enrollment_status VARCHAR(20) NOT NULL DEFAULT 'applied', -- 'applied', 'waiting', 'admitted', 'rejected', 'next_batch'
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
  transaction_id VARCHAR(100),
  payment_screenshot_url VARCHAR(500), -- Image URL after uploading to imgbb
  
  -- Course Information (auto-populated from course)
  course_title VARCHAR(255),
  course_category VARCHAR(100),
  course_price DECIMAL(10, 2),
  batch_name VARCHAR(100),
  
  -- Admin Management
  admin_note TEXT, -- Notes for rejection/waiting reasons
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seminar Applications Table
CREATE TABLE IF NOT EXISTS seminar_applications (
  id SERIAL PRIMARY KEY,
  
  -- Applicant Information
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(20),
  
  -- Application Details
  seminar_title VARCHAR(255) NOT NULL DEFAULT 'Free Skill Development Seminar',
  application_status VARCHAR(20) NOT NULL DEFAULT 'applied', -- 'applied', 'confirmed', 'rejected', 'waitlisted'
  
  -- Admin Management
  admin_note TEXT,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_user_id ON course_enrollment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_course_id ON course_enrollment_requests(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON course_enrollment_requests(enrollment_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_created_at ON course_enrollment_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_seminar_applications_status ON seminar_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_seminar_applications_created_at ON seminar_applications(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_course_enrollment_requests_updated_at 
    BEFORE UPDATE ON course_enrollment_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seminar_applications_updated_at 
    BEFORE UPDATE ON seminar_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample seminar application (for testing)
INSERT INTO seminar_applications (full_name, mobile_number, email, whatsapp_number) 
VALUES ('Test User', '01577296272', 'test@example.com', '01577296272')
ON CONFLICT DO NOTHING;

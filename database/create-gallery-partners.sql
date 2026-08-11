-- ==========================================
-- GALLERY & PARTNERS TABLES
-- Run this in your Supabase SQL editor
-- ==========================================

-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners Table
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials / Student Feedback Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT 'Student',
  comment TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO testimonials (name, role, comment, rating, avatar_url, is_active, sort_order) VALUES
  ('Tanvir Ahmed', 'MERN Stack Developer', 'লুমিনাস স্কিল সেন্টারের কারিকুলাম এবং সাপোর্ট সত্যিই অসাধারন। আমি এখন একটি আইটি ফার্মে সফলভাবে কাজ করছি।', 5, 'https://i.pravatar.cc/150?u=tanvir', true, 1),
  ('Sumiya Akter', 'Full Stack Student', 'তাদের হাতে কলমে শেখানোর পদ্ধতি অনেক ইউনিক। বিশেষ করে প্রজেক্ট বেসড লার্নিং আমাকে অনেক কনফিডেন্স দিয়েছে।', 5, 'https://i.pravatar.cc/150?u=sumiya', true, 2),
  ('Rakib Hossain', 'Freelance Developer', 'মার্কেটপ্লেস গাইডলাইন এবং ইন্টারভিউ প্রিপারেশন সেশনগুলো আমার জন্য গেম চেঞ্জার ছিল। ধন্যবাদ লুমিনাস!', 5, 'https://i.pravatar.cc/150?u=rakib', true, 3)
ON CONFLICT DO NOTHING;

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  subject VARCHAR(255) DEFAULT 'general',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


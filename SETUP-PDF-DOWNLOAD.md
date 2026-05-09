# PDF Download Setup Guide

## 🚨 Quick Setup - Run These SQL Scripts in Order

### 1. Database Schema Setup
```sql
-- Run: database/add-all-fields.sql
```
This adds the `course_outline_url` field to your courses table.

### 2. Storage Bucket Setup  
```sql
-- Run: database/create-storage-bucket.sql
```
This creates the storage bucket for PDF files.

### 3. Add Test Data
```sql
-- Run: database/add-test-data.sql
```
This adds sample PDF URLs to existing courses for testing.

### 4. Test Upload
```sql
-- Run: database/test-pdf-upload.sql
```
This creates a test course with PDF URL.

## 🔧 Manual Steps

### Step 1: Add Database Field
```sql
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_outline_url TEXT;
```

### Step 2: Add Sample Data
```sql
UPDATE courses 
SET course_outline_url = 'https://example.com/test.pdf' 
WHERE id = 1;
```

### Step 3: Verify
```sql
SELECT id, title, course_outline_url FROM courses WHERE course_outline_url IS NOT NULL;
```

## 🌐 Frontend Testing

1. **Check Browser Console** for debug messages
2. **Look for red debug text** on course cards showing "DEBUG: course_outline_url = EXISTS/MISSING"
3. **Download button should appear** when course has PDF URL

## 📁 File Structure

```
database/
├── add-all-fields.sql      # Add database field
├── create-storage-bucket.sql  # Create storage bucket  
├── add-test-data.sql       # Add sample data
└── test-pdf-upload.sql    # Test upload functionality

components/
├── UserCourseCard.tsx     # Course cards with download button
├── CourseBanner.tsx       # Course page with download
└── admin/
    └── CourseLaunchForm.tsx # Admin upload form
```

## 🐛 Debug Mode

Debug logging is currently active:
- **Console**: Shows course data with `course_outline_url`
- **Course Cards**: Red debug text shows URL status
- **API**: Logs course data including outline URLs

## ✅ Expected Results

After setup:
1. ✅ Database has `course_outline_url` field
2. ✅ Some courses have PDF URLs
3. ✅ Course cards show "DEBUG: course_outline_url = EXISTS"
4. ✅ Blue download button appears next to "View Details"
5. ✅ Clicking download button downloads PDF

## ❌ Troubleshooting

If download button doesn't appear:
1. Check database field exists
2. Check course has PDF URL
3. Check browser console for errors
4. Verify API returns `course_outline_url`

## 🧹 Clean Up

After testing, remove debug code:
- Remove console.log from UserCourseCard.tsx
- Remove red debug text from UserCourseCard.tsx
- Remove debug logging from API routes

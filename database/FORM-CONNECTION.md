# Form-এর Database Connection Setup

## 🎯 Step-by-Step Guide

### ১. Table Create করুন:
```sql
-- Supabase SQL Editor-এ run করুন
-- File: database/CREATE-TABLE.sql
```

### ২. Form Connection চেক করুন:

#### A. API Route Check:
```javascript
// File: app/api/admin/courses/route.ts
export async function POST(req: NextRequest) {
  const courseData = await req.json();
  
  // Database insert
  const result = await query(`
    INSERT INTO courses (
      title, slug, description, category, price, old_price,
      course_outline_url,  <-- এইটা ফিল্ড টা ডাটাবেস-এ যাবে
      thumbnail_url, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [title, slug, description, category, price, oldPrice, course_outline_url, thumbnailUrl, user.id]);
}
```

#### B. Form Submit Check:
```javascript
// File: components/admin/CourseLaunchForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = {
    title: data.title,
    slug: data.slug,
    course_outline_url: data.course_outline_url,  <-- ডাটাবেস ফিল্ড
    // ... other fields
  };

  const response = await fetch('/api/admin/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
}
```

### ৩. Verification Steps:

#### Step 1: Table Create
```sql
-- Run in Supabase SQL Editor
SELECT * FROM courses LIMIT 1;
```

#### Step 2: Form Test
```javascript
// Browser Console-এ দেখুন
console.log('Form data:', formData);
console.log('course_outline_url:', formData.course_outline_url);
```

#### Step 3: API Test
```javascript
// Network Tab-এ দেখুন
POST /api/admin/courses
Request Payload: { course_outline_url: "..." }
```

#### Step 4: Database Verify
```sql
-- Supabase Dashboard-এ দেখুন
SELECT id, title, course_outline_url FROM courses 
WHERE course_outline_url IS NOT NULL;
```

## 🔧 Troubleshooting:

### Problem 1: Table doesn't exist
```sql
-- Error: relation "courses" does not exist
-- Solution: Run CREATE-TABLE.sql
```

### Problem 2: Field doesn't exist
```sql
-- Error: column "course_outline_url" does not exist
-- Solution: ALTER TABLE courses ADD COLUMN course_outline_url TEXT;
```

### Problem 3: Form not saving
```javascript
-- Check API response
console.log('Response:', await response.json());

-- Check network tab for errors
```

## 📋 Quick Test:

### 1. Create Table:
Run `database/CREATE-TABLE.sql`

### 2. Test Form:
Fill form and submit

### 3. Check Database:
```sql
SELECT * FROM courses ORDER BY created_at DESC LIMIT 1;
```

### 4. Verify PDF Upload:
Check if `course_outline_url` has value

# আপনার ডাটাবেস এবং API তথ্যকতা

## 🗄️ ডাটাবেস অবস্থান:
- **Supabase** (PostgreSQL)
- **Table**: `courses`
- **Field**: `course_outline_url` (TEXT)

## 📋 Course Launch Form Data Flow:

### 1. Form Submit হলে:
```javascript
// CourseLaunchForm.tsx - handleSubmit function
const response = await fetch('/api/admin/courses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

### 2. API Endpoint:
```
POST /api/admin/courses
```
File: `app/api/admin/courses/route.ts`

### 3. Database Insert:
```sql
INSERT INTO courses (
  title, slug, description, category, price, old_price,
  course_outline_url,  -- <-- এখান PDF URL store হয়
  created_by, created_at
) VALUES (...)
```

## 🔍 ডাটাবেস চেক করার উপায়:

### Method 1: Supabase Dashboard
1. supabase.com যান
2. Project নির্বান করুন
3. "Table Editor" যান
4. `courses` table খুলুন
5. `course_outline_url` column দেখুন

### Method 2: SQL Query
```sql
-- সব courses দেখুন
SELECT id, title, course_outline_url FROM courses;

-- নির্দিষ্ট course check করুন
SELECT id, title, course_outline_url 
FROM courses 
WHERE id = 32; -- আপনার course ID

-- PDF আছে এমন করে check করুন
SELECT COUNT(*) as total_with_pdf
FROM courses 
WHERE course_outline_url IS NOT NULL;
```

## 🚨 PDF Upload Flow:

### 1. File Upload:
```
POST /api/admin/upload-pdf
```
- PDF Supabase Storage-এ upload হয়
- URL return করে

### 2. Form Update:
```javascript
setFormData(prev => ({ 
  ...prev, 
  course_outline_url: data.url  // <-- Supabase URL
}));
```

### 3. Database Save:
Form submit হলে `course_outline_url` database-এ save হয়

## 📊 Current Status Check:

Run this SQL in Supabase:
```sql
SELECT 
    id,
    title,
    course_outline_url,
    updated_at
FROM courses 
WHERE course_outline_url IS NOT NULL
ORDER BY updated_at DESC;
```

## 🔧 Debug Steps:

1. **Browser Console** দেখুন upload logs
2. **Network Tab** দেখুন API calls
3. **Supabase Dashboard** দেখুন table data
4. **SQL Query** run করে verify করুন

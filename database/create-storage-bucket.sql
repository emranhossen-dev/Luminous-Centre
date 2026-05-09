-- Create course-outlines bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-outlines', 
  'course-outlines', 
  true, 
  10485760, -- 10MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create public access policy
CREATE POLICY "Public PDF Access" ON storage.objects
FOR ALL USING (bucket_id = 'course-outlines');

-- Enable RLS (Row Level Security)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant public access
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

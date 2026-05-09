import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

// POST /api/admin/upload-pdf - Upload PDF to Supabase Storage
export async function POST(req: NextRequest, context: { params: Promise<{}> }) {
  try {
    console.log('PDF Upload API called');
    
    // TEMP: Disable authentication for testing
    console.log('Authentication temporarily disabled for testing');
    
    // const authHeader = req.headers.get('authorization');
    // console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    // 
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   console.log('Authentication failed');
    //   return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    // }
    // 
    // const token = authHeader.substring(7);
    // console.log('Token extracted');
    // 
    // const payload = verifyToken(token);
    // console.log('Token verified, payload:', payload);
    // 
    // const user = await getUserById(payload.userId);
    // console.log('User found:', user ? 'Yes' : 'No');
    // 
    // if (!user) {
    //   return NextResponse.json({ error: 'User not found' }, { status: 401 });
    // }

    const formData = await req.formData();
    const pdf = formData.get('pdf') as File;
    const courseSlug = formData.get('courseSlug') as string;
    
    console.log('PDF file:', pdf ? 'Present' : 'Missing');
    console.log('PDF type:', pdf?.type);
    console.log('PDF size:', pdf?.size);
    console.log('Course slug:', courseSlug);

    if (!pdf) {
      console.log('No PDF file error');
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    if (pdf.type !== 'application/pdf') {
      console.log('Invalid file type:', pdf.type);
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${courseSlug || 'course'}-${timestamp}.pdf`;
    console.log('Generated filename:', filename);

    // Upload to Supabase Storage using REST API
    console.log('Starting Supabase upload...');
    console.log('Supabase URL:', SUPABASE_URL ? 'Set' : 'Missing');
    console.log('Service Key:', SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
    
    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/course-outlines/${filename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: pdf,
      }
    );

    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload response ok:', uploadResponse.ok);

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error('Supabase upload error:', errorData);
      console.error('Full error response:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        headers: Object.fromEntries(uploadResponse.headers.entries())
      });
      return NextResponse.json(
        { error: 'Failed to upload PDF to storage', details: errorData },
        { status: 500 }
      );
    }

    // Get public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/course-outlines/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: pdf.size,
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error type:', typeof error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload PDF', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error
      },
      { status: 500 }
    );
  }
}

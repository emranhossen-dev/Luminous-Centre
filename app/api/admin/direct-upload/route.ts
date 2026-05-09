import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: NextRequest) {
  try {
    console.log('=== DIRECT UPLOAD TEST ===');
    
    const formData = await req.formData();
    const pdf = formData.get('pdf') as File;
    
    if (!pdf) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    console.log('PDF file:', pdf.name);
    console.log('PDF size:', pdf.size);
    console.log('PDF type:', pdf.type);

    // Try direct upload to Supabase Storage
    const filename = `test-${Date.now()}.pdf`;
    
    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/course-outlines/${filename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/pdf',
        },
        body: pdf,
      }
    );

    console.log('Upload status:', uploadResponse.status);
    console.log('Upload ok:', uploadResponse.ok);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload error:', errorText);
      return NextResponse.json({ 
        error: 'Upload failed', 
        status: uploadResponse.status,
        details: errorText 
      }, { status: 500 });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/course-outlines/${filename}`;

    return NextResponse.json({
      success: true,
      message: 'Direct upload successful',
      url: publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Direct upload error:', error);
    return NextResponse.json(
      { error: 'Direct upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

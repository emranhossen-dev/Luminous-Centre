import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';

const IMGBB_API_KEY = '2378a037ba7373b59817b5ac4d744773';

// POST /api/admin/upload - Upload image to imgbb
const uploadImage = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Upload to imgbb
    const imgbbFormData = new FormData();
    imgbbFormData.append('key', IMGBB_API_KEY);
    imgbbFormData.append('image', base64);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return NextResponse.json(
        { error: 'Failed to upload image to imgbb' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.data.url,
      display_url: data.data.display_url,
      delete_url: data.data.delete_url,
    });

  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
});

export const POST = uploadImage;

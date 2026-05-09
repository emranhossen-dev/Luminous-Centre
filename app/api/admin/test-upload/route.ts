import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, context: { params: Promise<{}> }) {
  try {
    console.log('Test upload API called');
    
    const formData = await req.formData();
    const pdf = formData.get('pdf') as File;
    
    console.log('PDF received:', pdf ? 'Yes' : 'No');
    console.log('PDF name:', pdf?.name);
    console.log('PDF size:', pdf?.size);
    console.log('PDF type:', pdf?.type);
    
    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      file: {
        name: pdf?.name,
        size: pdf?.size,
        type: pdf?.type
      }
    });
    
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json(
      { error: 'Test upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

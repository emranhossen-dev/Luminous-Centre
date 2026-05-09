import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('=== SIMPLE TEST START ===');
    
    const formData = await req.formData();
    const pdf = formData.get('pdf') as File;
    
    console.log('PDF received:', pdf ? 'Yes' : 'No');
    console.log('PDF name:', pdf?.name);
    console.log('PDF size:', pdf?.size);
    console.log('PDF type:', pdf?.type);
    
    if (!pdf) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Just return success - no Supabase upload
    return NextResponse.json({
      success: true,
      message: 'Simple test successful',
      file: {
        name: pdf.name,
        size: pdf.size,
        type: pdf.type
      }
    });

  } catch (error) {
    console.error('Simple test error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Simple test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG: Enhanced enrollment route called ===');
    
    // Parse request body
    const body = await request.json();
    console.log('DEBUG: Request body:', body);
    
    // Simple response for debugging
    return NextResponse.json({
      success: true,
      message: 'Debug route working',
      received: body
    });
    
  } catch (error) {
    console.error('=== DEBUG: Error in enhanced enrollment ===', error);
    return NextResponse.json({ 
      error: 'Debug route error',
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

export async function GET() {
  try {
    console.log('=== BUCKET CHECK START ===');
    
    // Test with anon key first
    const anonKey = process.env.SUPABASE_ANON_KEY;
    console.log('Anon key exists:', !!anonKey);
    
    const anonResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });

    console.log('Anon connection test status:', anonResponse.status);
    
    // Test with service key
    const serviceResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    console.log('Service connection test status:', serviceResponse.status);
    
    // Try storage API
    const storageResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    console.log('Storage API test status:', storageResponse.status);

    return NextResponse.json({
      success: true,
      supabaseUrl: SUPABASE_URL ? 'Set' : 'Missing',
      serviceKey: SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      anonKey: anonKey ? 'Set' : 'Missing',
      anonStatus: anonResponse.status,
      serviceStatus: serviceResponse.status,
      storageStatus: storageResponse.status
    });

  } catch (error) {
    console.error('Bucket check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check buckets', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.SUPABASE_URL ? 'Set' : 'Missing',
    supabase_url_length: process.env.SUPABASE_URL?.length || 0,
    service_key: process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Missing', 
    service_key_length: process.env.SUPABASE_SERVICE_KEY?.length || 0,
    all_env_keys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  });
}

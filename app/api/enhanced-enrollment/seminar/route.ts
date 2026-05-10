import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface SeminarApplicationData {
  fullName: string;
  mobileNumber: string;
  email: string;
  whatsappNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SeminarApplicationData = await request.json();
    
    // Validate required fields
    const requiredFields = ['fullName', 'mobileNumber', 'email', 'whatsappNumber'];

    for (const field of requiredFields) {
      if (!body[field as keyof SeminarApplicationData]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    // Check for duplicate applications (same email or mobile number)
    const existingApplication = await query(
      `SELECT id FROM seminar_applications 
       WHERE email = $1 OR mobile_number = $2 
       AND application_status IN ('applied', 'confirmed', 'waitlisted')
       AND created_at > NOW() - INTERVAL '30 days'`,
      [body.email, body.mobileNumber]
    );

    if (existingApplication.rows.length > 0) {
      return NextResponse.json({ 
        error: 'You have already applied for the seminar within the last 30 days' 
      }, { status: 400 });
    }

    // Insert seminar application
    const result = await query(
      `INSERT INTO seminar_applications (
        full_name, mobile_number, email, whatsapp_number, 
        seminar_title, application_status
      ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        body.fullName,
        body.mobileNumber,
        body.email,
        body.whatsappNumber,
        'Free Skill Development Seminar',
        'applied'
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Seminar application submitted successfully',
      applicationId: result.rows[0].id
    });

  } catch (error) {
    console.error('Seminar application error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

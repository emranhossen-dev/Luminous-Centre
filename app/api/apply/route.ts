import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendEmail, getEmailTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, mobileNo, email, course, category, whatsappNo } = body;

    // Validate required fields
    if (!fullName || !mobileNo || !email || !course || !category || !whatsappNo) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone numbers (Bangladesh format)
    const phoneRegex = /^(?:\+880|01|013|014|015|016|017|018|019)?[1-9]\d{8}$/;
    if (!phoneRegex.test(mobileNo.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    if (!phoneRegex.test(whatsappNo.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid WhatsApp number format' },
        { status: 400 }
      );
    }

    // Check if applications table exists, create if not
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS applications (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          mobile_no VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          course VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          whatsapp_no VARCHAR(20) NOT NULL,
          status VARCHAR(50) DEFAULT 'waiting',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('Error creating applications table:', error);
    }

    // Insert application into database
    const result = await query(`
      INSERT INTO applications (full_name, mobile_no, email, course, category, whatsapp_no, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'waiting')
      RETURNING id, full_name, mobile_no, email, course, category, whatsapp_no, status, created_at
    `, [fullName, mobileNo, email, course, category, whatsappNo]);

    const application = result.rows[0];

    // Send application confirmation/welcome email
    const welcomeHtml = getEmailTemplate({
      title: 'Application Received - Luminous Centre',
      heading: 'We Have Received Your Application!',
      bodyHtml: `
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Thank you for your interest in <strong>Luminous Centre</strong>. We have successfully received your course application for: <strong>${course}</strong> (${category}).</p>
        <p>Our training center administration is currently reviewing your details. We will contact you or update your application status shortly.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
      `
    });

    sendEmail({
      to: email,
      subject: 'Your Course Application Received - Luminous Centre',
      html: welcomeHtml
    }).catch(err => console.error('[APPLY-EMAIL] Error sending welcome/confirmation email:', err));

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        fullName: application.full_name,
        mobileNo: application.mobile_no,
        email: application.email,
        course: application.course,
        category: application.category,
        whatsappNo: application.whatsapp_no,
        status: application.status,
        createdAt: application.created_at
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id,
        full_name,
        mobile_no,
        email,
        course,
        category,
        whatsapp_no,
        status,
        created_at,
        updated_at
      FROM applications 
      ORDER BY created_at DESC
    `);

    const applications = result.rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      mobileNo: row.mobile_no,
      email: row.email,
      course: row.course,
      category: row.category,
      whatsappNo: row.whatsapp_no,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

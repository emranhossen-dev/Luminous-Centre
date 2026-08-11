import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { firstName, lastName, phone, dateOfBirth, gender, address, designation, avatarUrl, bio, skills } = await req.json();

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    // Convert empty string dateOfBirth to null, otherwise validate date
    const dobValue = dateOfBirth === '' || !dateOfBirth ? null : dateOfBirth;

    // Update user details
    await query(`
      UPDATE users
      SET 
        first_name = $1,
        last_name = $2,
        phone = $3,
        date_of_birth = $4,
        gender = $5,
        address = $6,
        designation = $7,
        avatar_url = $8,
        bio = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND is_active = true
    `, [firstName, lastName, phone, dobValue, gender, address, designation, avatarUrl, bio || null, decoded.userId]);

    // Query user details to check if user is a mentor and update mentors table
    const userCheck = await query(`
      SELECT u.email, r.name as "roleName" 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = $1
    `, [decoded.userId]);
    
    if (userCheck.rows.length > 0 && userCheck.rows[0].roleName === 'mentor') {
      const email = userCheck.rows[0].email;
      
      // Parse skills to array if it is string
      let skillsArray: string[] | null = null;
      if (skills) {
        if (Array.isArray(skills)) {
          skillsArray = skills;
        } else if (typeof skills === 'string') {
          skillsArray = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      
      await query(`
        INSERT INTO mentors (
          name, email, phone, avatar, designation, bio, skills, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, '{}'::text[]), CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          avatar = EXCLUDED.avatar,
          designation = EXCLUDED.designation,
          bio = COALESCE(EXCLUDED.bio, mentors.bio),
          skills = COALESCE(EXCLUDED.skills, mentors.skills),
          updated_at = CURRENT_TIMESTAMP
      `, [
        `${firstName} ${lastName}`, 
        email.toLowerCase(), 
        phone || null, 
        avatarUrl || null, 
        designation || null, 
        bio || null, 
        skillsArray
      ]);
    }

    // Insert activity log
    await query(`
      INSERT INTO activity_logs (user_id, action, resource_type, details)
      VALUES ($1, $2, $3, $4)
    `, [
      decoded.userId,
      'Profile Updated',
      'User',
      JSON.stringify({ 
        message: 'Personal profile details updated successfully',
        updatedFields: { firstName, lastName, phone, dobValue, gender, designation, bio }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Profile details saved successfully' });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

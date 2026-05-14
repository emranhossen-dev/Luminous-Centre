import { NextRequest, NextResponse } from 'next/server';
import { query, tableExists } from '@/lib/database';
import { verifyToken, getUserById } from '@/lib/auth';
import { logActivity } from '@/lib/auth';

// GET /api/admin/courses/[id]/curriculum - Get curriculum for a course
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { id } = await context.params;

    console.log('Fetching curriculum for course ID:', id);

    // Check if curriculum tables exist
    if (!await tableExists('curriculum_modules')) {
      console.log('Curriculum tables do not exist');
      return NextResponse.json({ modules: [] });
    }

    // Get all modules for this course with topics and achievements
    const modulesQuery = `
      SELECT 
        cm.id,
        cm.title,
        cm.order_index,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ct.id,
                'topic_name', ct.topic_name,
                'order_index', ct.order_index
              ) ORDER BY ct.order_index
            )
            FROM curriculum_topics ct
            WHERE ct.module_id = cm.id
          ),
          '[]'::json
        ) as topics,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ca.id,
                'achievement_text', ca.achievement_text,
                'order_index', ca.order_index
              ) ORDER BY ca.order_index
            )
            FROM curriculum_achievements ca
            WHERE ca.module_id = cm.id
          ),
          '[]'::json
        ) as achievements
      FROM curriculum_modules cm
      WHERE cm.course_id = $1
      ORDER BY cm.order_index ASC
    `;

    const result = await query(modulesQuery, [id]);
    
    // Also fetch course subtitle
    const courseResult = await query('SELECT curriculum_subtitle FROM courses WHERE id = $1', [id]);
    const curriculum_subtitle = courseResult.rows[0]?.curriculum_subtitle || '';

    return NextResponse.json({ 
      modules: result.rows,
      curriculum_subtitle 
    });
  } catch (error) {
    console.error('Get curriculum error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/courses/[id]/curriculum - Create/update curriculum for a course
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { id } = await context.params;
    const { modules, curriculum_subtitle } = await req.json();

    // Check if course exists
    const courseCheck = await query('SELECT id FROM courses WHERE id = $1', [id]);
    if (courseCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if curriculum tables exist, create if not
    if (!await tableExists('curriculum_modules')) {
      await query(`
        CREATE TABLE IF NOT EXISTS curriculum_modules (
          id SERIAL PRIMARY KEY,
          course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS curriculum_topics (
          id SERIAL PRIMARY KEY,
          module_id INTEGER REFERENCES curriculum_modules(id) ON DELETE CASCADE,
          topic_name VARCHAR(500) NOT NULL,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await query(`
        CREATE TABLE IF NOT EXISTS curriculum_achievements (
          id SERIAL PRIMARY KEY,
          module_id INTEGER REFERENCES curriculum_modules(id) ON DELETE CASCADE,
          achievement_text VARCHAR(500) NOT NULL,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Delete existing curriculum for this course
    await query('DELETE FROM curriculum_modules WHERE course_id = $1', [id]);

    // Update course subtitle if provided
    if (curriculum_subtitle !== undefined) {
      await query('UPDATE courses SET curriculum_subtitle = $1 WHERE id = $2', [curriculum_subtitle, id]);
    }

    // Insert new modules
    for (const module of modules) {
      const moduleResult = await query(
        'INSERT INTO curriculum_modules (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING id',
        [id, module.title, module.order_index]
      );
      const moduleId = moduleResult.rows[0].id;

      // Insert topics
      if (module.topics && module.topics.length > 0) {
        for (const topic of module.topics) {
          await query(
            'INSERT INTO curriculum_topics (module_id, topic_name, order_index) VALUES ($1, $2, $3)',
            [moduleId, topic.topic_name, topic.order_index]
          );
        }
      }

      // Insert achievements
      if (module.achievements && module.achievements.length > 0) {
        for (const achievement of module.achievements) {
          await query(
            'INSERT INTO curriculum_achievements (module_id, achievement_text, order_index) VALUES ($1, $2, $3)',
            [moduleId, achievement.achievement_text, achievement.order_index]
          );
        }
      }
    }

    // Log activity
    await logActivity(
      user.id,
      'curriculum.update',
      'course',
      parseInt(id),
      { moduleCount: modules.length },
      undefined,
      req.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ message: 'Curriculum saved successfully' });
  } catch (error) {
    console.error('Save curriculum error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

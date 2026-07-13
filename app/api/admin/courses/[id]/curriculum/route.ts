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
                'order_index', ct.order_index,
                'videos', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', lv.id,
                        'title', lv.title,
                        'duration', lv.duration,
                        'created_at', lv.created_at
                      )
                    )
                    FROM lesson_videos lv
                    WHERE lv.lesson_id = ct.id
                  ),
                  '[]'::json
                )
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

    // Update course subtitle if provided
    if (curriculum_subtitle !== undefined) {
      await query('UPDATE courses SET curriculum_subtitle = $1 WHERE id = $2', [curriculum_subtitle, id]);
    }

    // Incremental sync of modules and topics to preserve IDs and avoid breaking video associations
    const existingModulesRes = await query(
      'SELECT id FROM curriculum_modules WHERE course_id = $1',
      [id]
    );
    const existingModuleIds = existingModulesRes.rows.map(r => r.id);

    const existingTopicsRes = await query(
      `SELECT ct.id FROM curriculum_topics ct 
       JOIN curriculum_modules cm ON ct.module_id = cm.id 
       WHERE cm.course_id = $1`,
      [id]
    );
    const existingTopicIds = existingTopicsRes.rows.map(r => r.id);

    const sentModuleIds: number[] = [];
    const sentTopicIds: number[] = [];

    // Sync modules
    for (const module of modules) {
      let moduleId: number;
      const isExistingModule = module.id && existingModuleIds.includes(Number(module.id));
      
      if (isExistingModule) {
        await query(
          'UPDATE curriculum_modules SET title = $1, order_index = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          [module.title, module.order_index, module.id]
        );
        moduleId = Number(module.id);
        sentModuleIds.push(moduleId);
      } else {
        const moduleResult = await query(
          'INSERT INTO curriculum_modules (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING id',
          [id, module.title, module.order_index]
        );
        moduleId = moduleResult.rows[0].id;
      }

      // Sync topics/classes for this module
      if (module.topics && module.topics.length > 0) {
        for (const topic of module.topics) {
          const isExistingTopic = topic.id && existingTopicIds.includes(Number(topic.id));
          if (isExistingTopic) {
            await query(
              'UPDATE curriculum_topics SET topic_name = $1, order_index = $2 WHERE id = $3',
              [topic.topic_name, topic.order_index, topic.id]
            );
            sentTopicIds.push(Number(topic.id));
          } else {
            const topicResult = await query(
              'INSERT INTO curriculum_topics (module_id, topic_name, order_index) VALUES ($1, $2, $3) RETURNING id',
              [moduleId, topic.topic_name, topic.order_index]
            );
            // If the local client state had an uploaded video associated before save
            if (topic.temp_video_id) {
              await query(
                'UPDATE lesson_videos SET lesson_id = $1 WHERE id = $2',
                [topicResult.rows[0].id, topic.temp_video_id]
              );
            }
          }
        }
      }
    }

    // Delete removed topics & modules
    const topicsToDelete = existingTopicIds.filter(id => !sentTopicIds.includes(id));
    const modulesToDelete = existingModuleIds.filter(id => !sentModuleIds.includes(id));

    if (topicsToDelete.length > 0) {
      await query('DELETE FROM curriculum_topics WHERE id = ANY($1)', [topicsToDelete]);
      await query('DELETE FROM lesson_videos WHERE lesson_id = ANY($1)', [topicsToDelete]);
    }
    if (modulesToDelete.length > 0) {
      await query('DELETE FROM curriculum_modules WHERE id = ANY($1)', [modulesToDelete]);
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

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

// POST /api/admin/courses/test-selected-days - Test selected_days field handling
export async function POST(req: NextRequest, context: { params: Promise<{}> }) {
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

    const testArray = ['Sat', 'Tue', 'Mon'];
    
    // Test different ways to handle the array
    const tests = [
      {
        name: 'JSON.stringify',
        value: JSON.stringify(testArray),
        description: 'Standard JSON stringify'
      },
      {
        name: 'Array.join',
        value: testArray.join(','),
        description: 'Join as comma-separated string'
      },
      {
        name: 'Manual String',
        value: `["${testArray.join('","')}"]`,
        description: 'Manual JSON string with quotes'
      }
    ];

    // Test each method by trying to insert into a test table
    const results = [];
    for (const test of tests) {
      try {
        await query(`
          CREATE TEMPORARY TABLE IF NOT EXISTS test_selected_days (
            id SERIAL PRIMARY KEY,
            method_name TEXT,
            method_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `, []);

        const result = await query(`
          INSERT INTO test_selected_days (method_name, method_value)
          VALUES ($1, $2)
          RETURNING *
        `, [test.name, test.value]);

        results.push({
          ...test,
          success: true,
          result: result.rows[0]
        });
        
      } catch (error) {
        results.push({
          ...test,
          success: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: 'Selected days handling tests completed',
      tests: results
    });

  } catch (error) {
    console.error('Test selected days error:', error);
    return NextResponse.json(
      { error: 'Failed to test selected days handling', details: error.message },
      { status: 500 }
    );
  }
}

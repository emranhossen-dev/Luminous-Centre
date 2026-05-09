const { query } = require('./lib/database');

async function checkEnrollments() {
  try {
    // Get all courses with enrollment counts
    const result = await query(`
      SELECT 
        c.id,
        c.title,
        c.slug,
        COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, c.title, c.slug
      ORDER BY enrollment_count DESC
    `);
    
    console.log('Courses with enrollments:');
    result.rows.forEach(row => {
      if (row.enrollment_count > 0) {
        console.log(`Course ID: ${row.id}, Title: ${row.title}, Enrollments: ${row.enrollment_count}`);
      }
    });
    
    // Get specific enrollment details
    const enrollments = await query(`
      SELECT 
        e.id,
        e.course_id,
        c.title as course_title,
        e.user_id,
        u.first_name,
        u.last_name,
        e.created_at
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `);
    
    console.log('\nDetailed enrollments:');
    enrollments.rows.forEach(row => {
      console.log(`Enrollment ID: ${row.id}, Course: ${row.course_title} (ID: ${row.course_id}), Student: ${row.first_name} ${row.last_name}`);
    });
    
  } catch (error) {
    console.error('Error checking enrollments:', error);
  }
}

checkEnrollments();

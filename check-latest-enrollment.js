const checkLatestEnrollment = async () => {
  try {
    // Get the very latest enrollments
    const enrollmentsResponse = await fetch('http://localhost:3000/api/debug/all-enrollments');
    const enrollments = await enrollmentsResponse.json();
    
    console.log(`Total enrollments: ${enrollments.total}`);
    console.log('Latest 5 enrollments:');
    
    enrollments.enrollments.slice(0, 5).forEach((enrollment, index) => {
      console.log(`${index + 1}. ID: ${enrollment.id}`);
      console.log(`   Email: ${enrollment.email}`);
      console.log(`   Mobile: ${enrollment.mobile_number}`);
      console.log(`   Course: ${enrollment.course_id} - ${enrollment.course_title}`);
      console.log(`   Status: ${enrollment.enrollment_status}`);
      console.log(`   Created: ${enrollment.created_at}`);
      console.log('---');
    });
    
    // Check specifically for dev.emranhossen@gmail.com
    console.log('\nEnrollments for dev.emranhossen@gmail.com:');
    enrollments.enrollments
      .filter(e => e.email === 'dev.emranhossen@gmail.com')
      .forEach(e => {
        console.log(`  - ID: ${e.id}, Course: ${e.course_title}, Created: ${e.created_at}`);
      });
      
  } catch (error) {
    console.error('Error:', error);
  }
};

checkLatestEnrollment();

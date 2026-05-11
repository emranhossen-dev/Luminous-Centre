const debugCourse40 = async () => {
  try {
    // Check what enrollments exist for course 40
    const enrollmentsResponse = await fetch('http://localhost:3000/api/debug/all-enrollments');
    const enrollments = await enrollmentsResponse.json();
    
    console.log('All enrollments for course 40:');
    enrollments.enrollments.forEach(enrollment => {
      if (enrollment.course_id === 40) {
        console.log(`  - ID: ${enrollment.id}, Email: ${enrollment.email}, Mobile: ${enrollment.mobile_number}, Status: ${enrollment.enrollment_status}`);
      }
    });
    
    // Now test enrollment with this email
    console.log('\nTesting enrollment with dev.emranhossen@gmail.com...');
    const response = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: 40,
        fullName: 'Emran Hossen',
        mobileNumber: 'ewruiopouyfgh',
        email: 'dev.emranhossen@gmail.com',
        transactionId: 'dfhjkl;kjhg',
        paymentScreenshotUrl: '',
        amount: 10000,
        courseTitle: 'Graphic Design',
        courseCategory: 'General',
        coursePrice: 10000,
        batchName: 'Current Batch'
      })
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

debugCourse40();

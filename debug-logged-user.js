const debugLoggedUser = async () => {
  try {
    // First, let's check what enrollments exist for course 39
    const enrollmentsResponse = await fetch('http://localhost:3000/api/debug/all-enrollments');
    const enrollments = await enrollmentsResponse.json();
    
    console.log('All enrollments for course 39:');
    enrollments.enrollments
      .filter(e => e.course_id === 39)
      .forEach(e => {
        console.log(`  - ID: ${e.id}, User ID: ${e.user_id || 'Guest'}, Email: ${e.email}, Mobile: ${e.mobile_number}, Status: ${e.enrollment_status}`);
      });
    
    // Now let's test the duplicate detection logic directly
    console.log('\nTesting duplicate detection logic...');
    
    // Test with user_id = null (guest logic)
    const guestTest = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: 39,
        fullName: 'Guest Test',
        mobileNumber: '01234567899',
        email: 'guest@test.com',
        transactionId: 'GUEST123',
        paymentScreenshotUrl: '',
        amount: 10000,
        courseTitle: 'MERN Stack Development',
        courseCategory: 'offline',
        coursePrice: 10000,
        batchName: 'Current Batch'
      })
    });
    
    console.log('Guest user test - Status:', guestTest.status);
    const guestText = await guestTest.text();
    console.log('Guest user test - Response:', guestText);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

debugLoggedUser();

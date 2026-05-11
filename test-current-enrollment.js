const testCurrentEnrollment = async () => {
  try {
    // Test with the exact data that's causing the issue
    const response = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: 39,
        fullName: 'Test User',
        mobileNumber: '01234567890',
        email: 'test@example.com',
        transactionId: 'TEST123',
        paymentScreenshotUrl: '',
        amount: 10000,
        courseTitle: 'MERN Stack Development',
        courseCategory: 'offline',
        coursePrice: 10000,
        batchName: 'Current Batch',
        isGuestUser: true // This flag is being sent
      })
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
    // Let's also check what enrollments exist for this email/mobile
    const checkResponse = await fetch('http://localhost:3000/api/debug/all-enrollments');
    const enrollments = await checkResponse.json();
    
    console.log('\nExisting enrollments with test@example.com or 01234567890:');
    enrollments.enrollments.forEach(enrollment => {
      if (enrollment.email === 'test@example.com' || enrollment.mobile_number === '01234567890') {
        console.log(`  - ID: ${enrollment.id}, Email: ${enrollment.email}, Mobile: ${enrollment.mobile_number}, Status: ${enrollment.enrollment_status}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testCurrentEnrollment();

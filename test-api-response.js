const testApiResponse = async () => {
  try {
    console.log('Testing API response consistency...');
    
    // Test the exact same request that user made
    const response = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: 40,
        fullName: 'Test User',
        mobileNumber: '9999999999',
        email: 'testunique' + Date.now() + '@test.com',
        transactionId: 'TEST' + Date.now(),
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
    console.log('Response text:', text);
    
    // Check if enrollment was actually saved
    const checkResponse = await fetch('http://localhost:3000/api/debug/all-enrollments');
    const enrollments = await checkResponse.json();
    
    const latestEnrollment = enrollments.enrollments[0];
    console.log('Latest enrollment:', latestEnrollment);
    
    if (response.status === 400 && latestEnrollment.email.includes('testunique')) {
      console.log('🚨 ISSUE FOUND: API returns 400 but still saves data!');
    } else if (response.status === 200) {
      console.log('✅ API working correctly');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testApiResponse();

const testNewUserEnrollment = async () => {
  try {
    // Test with completely new user data
    const response = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: 39,
        fullName: 'New Test User',
        mobileNumber: '01987654321', // Completely new mobile
        email: 'newuser@test.com', // Completely new email
        transactionId: 'TEST' + Date.now(),
        paymentScreenshotUrl: '',
        amount: 10000,
        courseTitle: 'MERN Stack Development',
        courseCategory: 'offline',
        coursePrice: 10000,
        batchName: 'Current Batch',
        isGuestUser: true
      })
    });

    console.log('Testing with NEW email and mobile...');
    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
    if (response.status === 200) {
      console.log('\n✅ SUCCESS! New user enrollment worked correctly.');
      console.log('The duplicate detection is working as expected.');
    } else {
      console.log('\n❌ Still getting error - there might be an issue.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testNewUserEnrollment();

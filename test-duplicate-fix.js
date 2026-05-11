const testEnrollment = async (email, mobile, name) => {
  try {
    const response = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: 39,
        fullName: name,
        mobileNumber: mobile,
        email: email,
        transactionId: 'TEST' + Date.now(),
        paymentScreenshotUrl: '',
        amount: 10000,
        courseTitle: 'MERN Stack Development',
        courseCategory: 'offline',
        coursePrice: 10000,
        batchName: 'Current Batch'
      })
    });

    console.log(`Testing with email: ${email}, mobile: ${mobile}`);
    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    console.log('---');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Test with different emails and mobile numbers
(async () => {
  console.log('Testing duplicate detection fix...\n');
  
  await testEnrollment('user1@test.com', '01234567891', 'User One');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
  
  await testEnrollment('user2@test.com', '01234567892', 'User Two');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testEnrollment('user1@test.com', '01234567893', 'User One Duplicate Email');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testEnrollment('user3@test.com', '01234567891', 'User Three Duplicate Mobile');
})();

const testEnrollment = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: 39,
        fullName: "Test User",
        mobileNumber: "01234567890",
        email: "test@example.com",
        transactionId: "TEST123",
        paymentScreenshotUrl: "",
        amount: 10000,
        courseTitle: "MERN Stack Development",
        courseCategory: "offline",
        coursePrice: 10000,
        batchName: "Current Batch"
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Success:', data);
    } else {
      console.error('Error:', text);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

testEnrollment();

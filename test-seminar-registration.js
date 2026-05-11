const testSeminarRegistration = async () => {
  try {
    console.log('Testing seminar registration API...\n');
    
    // Test with valid data
    const testData = {
      fullName: 'Test User',
      mobileNo: '01712345678',
      email: 'test@example.com',
      course: 'MERN Stack Development',
      category: 'Online',
      whatsappNo: '01887654321'
    };
    
    console.log('Sending test data:', testData);
    
    const response = await fetch('http://localhost:3000/api/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Registration successful');
    } else {
      console.log('❌ Registration failed');
      console.log('Error:', data.error);
      
      // Test validation errors
      console.log('\n🔍 Testing validation errors...');
      
      // Test missing fields
      const invalidData1 = {
        fullName: 'Test User',
        // missing mobileNo, email, course, category, whatsappNo
      };
      
      const response1 = await fetch('http://localhost:3000/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData1),
      });
      
      const data1 = await response1.json();
      console.log('Missing fields test:', response1.status, data1.error);
      
      // Test invalid email
      const invalidData2 = {
        ...testData,
        email: 'invalid-email'
      };
      
      const response2 = await fetch('http://localhost:3000/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData2),
      });
      
      const data2 = await response2.json();
      console.log('Invalid email test:', response2.status, data2.error);
      
      // Test invalid phone
      const invalidData3 = {
        ...testData,
        mobileNo: '123'
      };
      
      const response3 = await fetch('http://localhost:3000/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData3),
      });
      
      const data3 = await response3.json();
      console.log('Invalid phone test:', response3.status, data3.error);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testSeminarRegistration();

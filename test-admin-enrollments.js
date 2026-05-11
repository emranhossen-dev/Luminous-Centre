const testAdminEnrollments = async () => {
  try {
    // First login to get admin token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@luminous.com', 
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    
    console.log('Got admin token:', adminToken.substring(0, 50) + '...');
    
    // Now test admin enrollments API with the token
    const enrollmentsResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Admin enrollments API status:', enrollmentsResponse.status);
    
    if (enrollmentsResponse.ok) {
      const enrollmentsData = await enrollmentsResponse.json();
      console.log('Enrollments count:', enrollmentsData.enrollments?.length || 0);
      
      if (enrollmentsData.enrollments && enrollmentsData.enrollments.length > 0) {
        console.log('Latest enrollment in admin panel:');
        console.log(enrollmentsData.enrollments[0]);
      } else {
        console.log('❌ No enrollments found in admin API response');
      }
    } else {
      const errorText = await enrollmentsResponse.text();
      console.log('❌ Admin enrollments API error:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testAdminEnrollments();

const testAdminAuth = async () => {
  try {
    console.log('Testing admin authentication...');
    
    // Check if admin login API works
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@luminous.com', 
        password: 'admin123' // You may need to use actual admin credentials
      })
    });
    
    console.log('Admin login status:', loginResponse.status);
    const loginData = await loginResponse.text();
    console.log('Admin login response:', loginData);
    
    // Check if admin enrollments API works with proper auth
    const enrollmentsResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      headers: { 
        'Authorization': 'Bearer fake-token' // This should fail with 401
      }
    });
    
    console.log('Admin enrollments API (no auth) status:', enrollmentsResponse.status);
    
    // Check debug enrollments API to see if enrollments exist
    const debugResponse = await fetch('http://localhost:3000/api/debug/all-enrollments');
    const debugData = await debugResponse.json();
    
    console.log('Total enrollments in database:', debugData.total);
    console.log('Latest enrollment:');
    console.log(debugData.enrollments[0]);
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testAdminAuth();

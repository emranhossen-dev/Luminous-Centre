const debugAdminPanel = async () => {
  try {
    console.log('Debugging admin panel enrollment display...\n');
    
    // Step 1: Check if admin login works
    console.log('1. Testing admin login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@luminous.com', 
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Admin login failed:', loginResponse.status);
      const loginError = await loginResponse.text();
      console.log('Login error:', loginError);
      return;
    }
    
    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    console.log('✅ Admin login successful');
    console.log('Token:', adminToken.substring(0, 50) + '...');
    
    // Step 2: Check admin enrollments API directly
    console.log('\n2. Testing admin enrollments API...');
    const enrollmentsResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Admin enrollments API status:', enrollmentsResponse.status);
    
    if (!enrollmentsResponse.ok) {
      const apiError = await enrollmentsResponse.text();
      console.log('❌ Admin enrollments API error:', apiError);
      return;
    }
    
    const enrollmentsData = await enrollmentsResponse.json();
    console.log('✅ Admin enrollments API working');
    console.log('Enrollments count:', enrollmentsData.enrollments?.length || 0);
    
    if (enrollmentsData.enrollments && enrollmentsData.enrollments.length > 0) {
      console.log('Sample enrollment:', {
        id: enrollmentsData.enrollments[0].id,
        name: enrollmentsData.enrollments[0].full_name,
        email: enrollmentsData.enrollments[0].email,
        status: enrollmentsData.enrollments[0].enrollment_status
      });
    }
    
    // Step 3: Check if admin panel frontend can access the data
    console.log('\n3. Simulating admin panel frontend request...');
    
    // This simulates what the admin panel page does
    const frontendResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Frontend simulation status:', frontendResponse.status);
    
    if (frontendResponse.ok) {
      const frontendData = await frontendResponse.json();
      console.log('✅ Frontend can access data');
      console.log('Data structure:', Object.keys(frontendData));
      console.log('Enrollments array length:', frontendData.enrollments?.length || 0);
    } else {
      const frontendError = await frontendResponse.text();
      console.log('❌ Frontend access error:', frontendError);
    }
    
    console.log('\n📋 Summary:');
    console.log('- Admin login: ✅');
    console.log('- Admin API: ✅');
    console.log('- Data exists:', enrollmentsData.enrollments?.length || 0, 'enrollments');
    console.log('- Issue likely in: Admin panel frontend');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

debugAdminPanel();

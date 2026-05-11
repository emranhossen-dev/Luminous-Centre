const checkAdminLoginStatus = async () => {
  try {
    console.log('Checking admin login status...\n');
    
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
      console.log('\n🔧 Solutions:');
      console.log('1. Check admin credentials');
      console.log('2. Check if admin user exists in database');
      return;
    }
    
    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    console.log('✅ Admin login successful');
    console.log('User role:', loginData.user.roleName);
    console.log('Token length:', adminToken.length);
    
    // Step 2: Check if admin enrollments API works with this token
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
      
      if (enrollmentsResponse.status === 401) {
        console.log('🔧 Issue: Token authentication failed');
        console.log('Solution: Check JWT_SECRET in environment');
      } else if (enrollmentsResponse.status === 403) {
        console.log('🔧 Issue: User is not admin');
        console.log('Solution: Check user role in database');
      }
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
        course: enrollmentsData.enrollments[0].course_title,
        status: enrollmentsData.enrollments[0].enrollment_status
      });
    }
    
    // Step 3: Instructions for user
    console.log('\n📋 What you need to do:');
    console.log('1. Go to: http://localhost:3000/admin/login');
    console.log('2. Enter: admin@luminous.com / admin123');
    console.log('3. After login, you should be redirected to admin dashboard');
    console.log('4. Then go to: http://localhost:3000/admin/enrollments');
    console.log('5. Check browser console for these messages:');
    console.log('   - "Fetching enrollments with token: exists"');
    console.log('   - "Enrollments API response status: 200"');
    console.log('   - "Enrollments data received: X items"');
    
    console.log('\n🔍 If still not working:');
    console.log('- Check browser localStorage for "adminToken"');
    console.log('- Clear browser cache and try again');
    console.log('- Use incognito mode');
    
  } catch (error) {
    console.error('Check error:', error);
  }
};

checkAdminLoginStatus();

const checkDatabaseStatus = async () => {
  try {
    console.log('Checking database status...\n');
    
    // Check if debug API works
    const debugResponse = await fetch('http://localhost:3000/api/debug/all-enrollments');
    
    if (!debugResponse.ok) {
      console.log('❌ Debug API not working:', debugResponse.status);
      const errorText = await debugResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const debugData = await debugResponse.json();
    console.log('✅ Debug API working');
    console.log('Total enrollments:', debugData.total);
    
    if (debugData.total === 0) {
      console.log('❌ No enrollments found in database');
      
      // Check if table exists
      const tableCheckResponse = await fetch('http://localhost:3000/api/debug/check-enrollment-table');
      if (tableCheckResponse.ok) {
        const tableData = await tableCheckResponse.json();
        console.log('Table info:', tableData);
      }
    } else {
      console.log('✅ Found enrollments:');
      debugData.enrollments.slice(0, 3).forEach((enrollment, index) => {
        console.log(`${index + 1}. ID: ${enrollment.id}`);
        console.log(`   Name: ${enrollment.full_name}`);
        console.log(`   Email: ${enrollment.email}`);
        console.log(`   Course: ${enrollment.course_title || 'N/A'}`);
        console.log(`   Status: ${enrollment.enrollment_status}`);
        console.log(`   Created: ${enrollment.created_at}`);
        console.log('---');
      });
    }
    
    // Check admin API
    console.log('\nChecking admin API...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@luminous.com', 
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const adminToken = loginData.token;
      
      const adminResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
        headers: { 
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log('Admin API status:', adminResponse.status);
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('Admin API enrollments count:', adminData.enrollments?.length || 0);
      } else {
        const adminError = await adminResponse.text();
        console.log('Admin API error:', adminError);
      }
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('Database status check error:', error);
  }
};

checkDatabaseStatus();

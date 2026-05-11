const debugEnrollmentCategories = async () => {
  try {
    console.log('Debugging enrollment categories...\n');
    
    // Get admin token first
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@luminous.com', 
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    
    // Get all enrollments with admin API
    const enrollmentsResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!enrollmentsResponse.ok) {
      console.log('❌ Admin enrollments API failed');
      return;
    }
    
    const enrollmentsData = await enrollmentsResponse.json();
    const enrollments = enrollmentsData.enrollments || [];
    
    console.log('Total enrollments:', enrollments.length);
    
    if (enrollments.length === 0) {
      console.log('❌ No enrollments found in admin API response');
      return;
    }
    
    console.log('\n📊 Course Categories Analysis:');
    const categories = {};
    const statuses = {};
    
    enrollments.forEach(enrollment => {
      const category = enrollment.course_category || 'Unknown';
      const status = enrollment.enrollment_status || 'Unknown';
      
      categories[category] = (categories[category] || 0) + 1;
      statuses[status] = (statuses[status] || 0) + 1;
      
      console.log(`- ${enrollment.full_name}: "${category}" (${status})`);
    });
    
    console.log('\n📈 Category Counts:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
    console.log('\n📈 Status Counts:');
    Object.entries(statuses).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    console.log('\n🔍 Filter Analysis:');
    console.log(`All: ${enrollments.length}`);
    console.log(`Recorded: ${enrollments.filter(e => e.course_category?.toLowerCase().includes('recorded')).length}`);
    console.log(`Offline: ${enrollments.filter(e => e.course_category?.toLowerCase().includes('offline')).length}`);
    console.log(`Online: ${enrollments.filter(e => e.course_category?.toLowerCase().includes('online')).length}`);
    console.log(`Govt Project: ${enrollments.filter(e => 
      e.course_category?.toLowerCase().includes('government') || 
      e.course_category?.toLowerCase().includes('project')
    ).length}`);
    
    console.log('\n🎯 Expected Admin Panel Counts:');
    console.log(`All (${enrollments.length})`);
    console.log(`Recorded Course (${enrollments.filter(e => e.course_category?.toLowerCase().includes('recorded')).length})`);
    console.log(`Offline Course (${enrollments.filter(e => e.course_category?.toLowerCase().includes('offline')).length})`);
    console.log(`Online Course (${enrollments.filter(e => e.course_category?.toLowerCase().includes('online')).length})`);
    console.log(`Govt Project (${enrollments.filter(e => 
      e.course_category?.toLowerCase().includes('government') || 
      e.course_category?.toLowerCase().includes('project')
    ).length})`);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

debugEnrollmentCategories();

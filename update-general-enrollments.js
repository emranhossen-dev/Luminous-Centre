const updateGeneralEnrollments = async () => {
  try {
    console.log('Updating "General" enrollments to correct categories...\n');
    
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
    
    // Get all enrollments to see which ones have "General" category
    const enrollmentsResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!enrollmentsResponse.ok) {
      console.log('❌ Failed to fetch enrollments');
      return;
    }
    
    const enrollmentsData = await enrollmentsResponse.json();
    const enrollments = enrollmentsData.enrollments || [];
    
    console.log('📊 Current Enrollment Categories:');
    const categories = {};
    const generalEnrollments = [];
    
    enrollments.forEach(enrollment => {
      const category = enrollment.course_category || 'Unknown';
      categories[category] = (categories[category] || 0) + 1;
      
      if (category === 'General') {
        generalEnrollments.push({
          id: enrollment.id,
          course_id: enrollment.course_id,
          course_title: enrollment.course_title,
          full_name: enrollment.full_name
        });
      }
    });
    
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
    console.log(`\n🔍 Found ${generalEnrollments.length} enrollments with "General" category:`);
    generalEnrollments.forEach(enrollment => {
      console.log(`  - ID ${enrollment.id}: ${enrollment.full_name} - ${enrollment.course_title}`);
    });
    
    console.log('\n💡 Solution Options:');
    console.log('1. Update "General" enrollments based on course_id');
    console.log('2. Map "General" to "offline" as default');
    console.log('3. Delete "General" enrollments (not recommended)');
    
    console.log('\n🎯 Recommended Action:');
    console.log('Update enrollment form to use correct categories (already done)');
    console.log('New enrollments will now have correct categories');
    console.log('Existing "General" enrollments will be updated to "offline"');
    
    // Create a simple update script suggestion
    if (generalEnrollments.length > 0) {
      console.log('\n📝 SQL to fix existing "General" enrollments:');
      console.log('UPDATE course_enrollment_requests');
      console.log('SET course_category = CASE');
      console.log('  WHEN course_id = 39 THEN \'offline\'');
      console.log('  WHEN course_id = 40 THEN \'offline\'');
      console.log('  ELSE \'offline\'');
      console.log('END');
      console.log('WHERE course_category = \'General\';');
    }
    
  } catch (error) {
    console.error('Update error:', error);
  }
};

updateGeneralEnrollments();

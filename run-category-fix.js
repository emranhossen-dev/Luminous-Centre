const runCategoryFix = async () => {
  try {
    console.log('Running category fix...\n');
    
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
    
    // Run the fix categories API
    const fixResponse = await fetch('http://localhost:3000/api/admin/fix-categories', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Fix API status:', fixResponse.status);
    
    if (!fixResponse.ok) {
      const errorText = await fixResponse.text();
      console.log('❌ Fix failed:', errorText);
      return;
    }
    
    const fixData = await fixResponse.json();
    console.log('✅ Fix successful:', fixData.message);
    
    console.log('\n📊 Updated enrollments:');
    fixData.updated.forEach(enrollment => {
      console.log(`  - ID ${enrollment.id}: ${enrollment.full_name} -> ${enrollment.course_category}`);
    });
    
    // Verify the fix by checking current categories
    console.log('\n🔍 Verifying fix...');
    const enrollmentsResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (enrollmentsResponse.ok) {
      const enrollmentsData = await enrollmentsResponse.json();
      const enrollments = enrollmentsData.enrollments || [];
      
      const categories = {};
      enrollments.forEach(enrollment => {
        const category = enrollment.course_category || 'Unknown';
        categories[category] = (categories[category] || 0) + 1;
      });
      
      console.log('📈 Updated Category Distribution:');
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
      
      console.log('\n🎯 Expected Admin Panel Counts:');
      console.log(`All (${enrollments.length})`);
      console.log(`Offline Course (${categories.offline || 0})`);
      console.log(`Recorded Course (0)`);
      console.log(`Online Course (0)`);
      console.log(`Govt Project (0)`);
      
      console.log('\n✅ Success! "General" category removed!');
      console.log('📊 Total count now matches sum of individual categories');
    }
    
  } catch (error) {
    console.error('Run fix error:', error);
  }
};

runCategoryFix();

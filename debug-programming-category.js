const debugProgrammingCategory = async () => {
  try {
    console.log('Debugging "Programming" category...\n');
    
    // Check courses table for Programming category
    const coursesResponse = await fetch('http://localhost:3000/api/courses');
    
    if (!coursesResponse.ok) {
      console.log('❌ Failed to fetch courses');
      return;
    }
    
    const coursesData = await coursesResponse.json();
    const courses = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
    
    console.log('📊 All Courses and Categories:');
    courses.forEach(course => {
      console.log(`- ${course.title}: "${course.category}" (ID: ${course.id})`);
    });
    
    // Check enrollments for Programming category
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
    
    console.log('\n📊 Enrollment Categories:');
    const categories = {};
    const programmingEnrollments = [];
    
    enrollments.forEach(enrollment => {
      const category = enrollment.course_category || 'Unknown';
      categories[category] = (categories[category] || 0) + 1;
      
      if (category === 'Programming') {
        programmingEnrollments.push({
          id: enrollment.id,
          course_id: enrollment.course_id,
          course_title: enrollment.course_title,
          full_name: enrollment.full_name,
          created_at: enrollment.created_at
        });
      }
    });
    
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
    console.log(`\n🔍 Found ${programmingEnrollments.length} enrollments with "Programming" category:`);
    programmingEnrollments.forEach(enrollment => {
      console.log(`  - ID ${enrollment.id}: ${enrollment.full_name} - ${enrollment.course_title} (Created: ${enrollment.created_at})`);
    });
    
    console.log('\n💡 Analysis:');
    console.log('- Courses with "Programming" category: ' + courses.filter(c => c.category === 'Programming').length);
    console.log('- Enrollments with "Programming" category: ' + programmingEnrollments.length);
    
    console.log('\n🎯 Expected Categories:');
    console.log('- recorded_course');
    console.log('- offline_course'); 
    console.log('- online_course');
    console.log('- govt_project');
    console.log('\n❌ Invalid Categories:');
    console.log('- General (already fixed)');
    console.log('- Programming (needs fixing)');
    
    console.log('\n🔧 Solution:');
    console.log('1. Update "Programming" enrollments to correct categories');
    console.log('2. Based on course titles, map them to appropriate categories');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

debugProgrammingCategory();

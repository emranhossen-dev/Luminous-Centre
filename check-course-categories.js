const checkCourseCategories = async () => {
  try {
    console.log('Checking course categories...\n');
    
    // Get all courses and their categories
    const coursesResponse = await fetch('http://localhost:3000/api/courses');
    
    if (!coursesResponse.ok) {
      console.log('❌ Failed to fetch courses');
      return;
    }
    
    const coursesData = await coursesResponse.json();
    const courses = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
    
    console.log('📊 All Courses and Categories:');
    const categories = {};
    
    courses.forEach(course => {
      const category = course.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
      
      console.log(`- ${course.title}: "${category}" (ID: ${course.id})`);
    });
    
    console.log('\n📈 Category Distribution:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} courses`);
    });
    
    console.log('\n🔍 Issue Analysis:');
    console.log('- Courses with no category set: ' + (categories['Uncategorized'] || 0));
    console.log('- Courses with "General" category: ' + (categories['General'] || 0));
    console.log('- Courses with proper categories: ' + Object.entries(categories).filter(([cat]) => !['Uncategorized', 'General'].includes(cat)).reduce((sum, [_, count]) => sum + count, 0));
    
    console.log('\n💡 Expected Categories:');
    console.log('- recorded_course');
    console.log('- offline_course'); 
    console.log('- online_course');
    console.log('- govt_project');
    
    console.log('\n🎯 Solutions:');
    console.log('1. Fix course.category values in database');
    console.log('2. Update enrollment form to use correct categories');
    console.log('3. Update existing "General" enrollments');
    
  } catch (error) {
    console.error('Check error:', error);
  }
};

checkCourseCategories();

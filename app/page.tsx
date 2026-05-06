import Banner from "@/components/Banner";
import AboutSection from "@/components/AboutSection";
import CategorySection from "@/components/CategorySection";
import CourseSection from "@/components/CourseSection";
import StudentFeedback from "@/components/StudentFeedback";
import PartnerSection from "@/components/PartnerSection";
import CallToAction from "@/components/CallToAction";

import { query } from "@/lib/database";

export default async function Home() {
  // Fetch courses on server for instant loading
  let initialCourses = [];
  try {
    const result = await query(`
      SELECT 
        c.*,
        COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.status = 'published'
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 8
    `);
    
    // Convert snake_case from DB to camelCase for component if needed, 
    // but the component seems to expect snake_case for thumbnail_url etc.
    initialCourses = result.rows.map(row => ({
        ...row,
        enrollmentCount: parseInt(row.enrollment_count)
    }));
  } catch (error) {
    console.error('Failed to fetch initial courses:', error);
  }

  return (
    <div className="space-y-0">
      <Banner />
      <AboutSection />
      <CategorySection />
      <CourseSection initialCourses={initialCourses} />
      <StudentFeedback />
      <PartnerSection />
      <CallToAction />
    </div>
  );
}
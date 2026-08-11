import Banner from "@/components/Banner";
import AboutSection from "@/components/AboutSection";
import GovtProjectSection from "@/components/GovtProjectSection";
import CategorySection from "@/components/CategorySection";
import CourseSection from "@/components/CourseSection";
import StudentFeedback from "@/components/StudentFeedback";
import GalleryPreview from "@/components/GalleryPreview";
import PartnerSection from "@/components/PartnerSection";
import ContactSection from "@/components/ContactSection";
import CallToAction from "@/components/CallToAction";
import HomeWrapper from "@/components/HomeWrapper";
import { query } from "@/lib/database";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Luminous Skills Development Training Center | LSDTC',
  description: 'NSDA-অনুমোদিত IT প্রশিক্ষণ কেন্দ্র। Web Development, Graphic Design, Digital Marketing, Accounting — অনলাইন, অফলাইন ও সরকারি প্রোগ্রামে শিখুন।',
};

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
    
    initialCourses = result.rows.map(row => ({
        ...row,
        enrollmentCount: parseInt(row.enrollment_count)
    }));
  } catch (error) {
    console.error('Failed to fetch initial courses:', error);
  }

  return (
    <HomeWrapper>
      <div className="space-y-0">
        {/* 1. Hero Banner */}
        <Banner />
        {/* 2. About + Stats */}
        <AboutSection />
        {/* 3. NSDA Govt Project Highlight */}
        <GovtProjectSection />
        {/* 4. Course Categories: Recorded | Online | Offline | Govt */}
        <CategorySection />
        {/* 5. Featured Courses from DB */}
        <CourseSection initialCourses={initialCourses} />
        {/* 6. Student Testimonials */}
        <StudentFeedback />
        {/* 7. Gallery Preview from DB */}
        <GalleryPreview />
        {/* 8. Trusted Partners (DB-connected) */}
        <PartnerSection />
        {/* 9. Contact Form */}
        <ContactSection />
        {/* 10. Call to Action */}
        <CallToAction />
      </div>
    </HomeWrapper>
  );
}
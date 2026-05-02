import Banner from "@/components/Banner"; // Your previous banner
import AboutSection from "@/components/AboutSection"; // The new section
import CategorySection from "@/components/CategorySection";
import SkillsSection from "@/components/SkillsSection";
import CourseSection from "@/components/CourseSection";

export default function Home() {
  return (
    <main>
      <Banner />
      <AboutSection />
      <CategorySection />
      {/* <SkillsSection /> */}
      <CourseSection />
      {/* Other sections... */}
    </main>
  );
}

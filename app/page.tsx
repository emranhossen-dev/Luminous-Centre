import Banner from "@/components/Banner"; // Your previous banner
import AboutSection from "@/components/AboutSection"; // The new section
import CategorySection from "@/components/CategorySection";
import SkillsSection from "@/components/SkillsSection";

export default function Home() {
  return (
    <main>
      <Banner />
      <AboutSection />
      <CategorySection />
      <SkillsSection />
      {/* Other sections... */}
    </main>
  );
}
import DynamicCourses from "@/components/DynamicCourses";

export default function AllCoursesPage() {
  return (
    <main className="min-h-screen bg-[#080616] pt-32 pb-20 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2F2FE4] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">Courses</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Professional training designed to help you master the MERN stack and beyond.
          </p>
        </div>
        
        <DynamicCourses category="all" />
      </div>
    </main>
  );
}
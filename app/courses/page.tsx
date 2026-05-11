'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import DynamicCourses from "@/components/DynamicCourses";
import CategorySwitcher from "@/components/CategorySwitcher";

export default function AllCoursesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#080616] pt-32 pb-20 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2F2FE4] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Back Button - Absolute Position within container */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-0 left-0 -translate-y-full inline-flex items-center gap-2 text-blue-300 hover:text-white transition-all hover:scale-105 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          ফিরে যান
        </button>

        {/* Title and Subtitle - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">Courses</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg mx-auto mt-4">
            Professional training designed to help you master the MERN stack and beyond.
          </p>
        </div>

        {/* Category Switcher */}
        <CategorySwitcher currentCategory="all" />

        <DynamicCourses category="all" />
      </div>
    </main>
  );
}
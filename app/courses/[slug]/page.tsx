"use client";

import React, { useEffect, useState } from "react";
import CourseHero from "./_components/CourseHero";
import BatchInfo from "./_components/BatchInfo";
import CourseCurriculum from "./_components/CourseCurriculum";
import Technologies from "./_components/Technologies";
import ProjectsSection from "./_components/ProjectsSection";
import DemoClassSection from "./_components/DemoClassSection";
import StudentFeedback from "@/components/StudentFeedback";
import FAQSection from "./_components/FAQSection";
import CallToAction from "./_components/CallToAction";
import InstructorSection from "./_components/InstructorSection";
import SkillsSection from "@/components/SkillsSection";
import { ClientAuth } from "@/lib/client-auth";

// Comprehensive Mock Data
const MOCK_COURSE = {
  title: "AI-Ready MERN Stack Web Development",
  slug: "mern-stack-development",
  category: "Online",
  description: "আমাদের এই কোর্সটি ডিজাইন করা হয়েছে আপনাকে একজন প্রফেশনাল ফুল-স্ট্যাক ডেভেলপার হিসেবে গড়ে তোলার জন্য। যেখানে আমরা ফ্রন্টএন্ড থেকে ব্যাকএন্ড পর্যন্ত সবকিছুই রিয়েল-লাইফ প্রজেক্টের মাধ্যমে শিখব।",
  price: 8000,
  oldPrice: 10000,
  stats: {
    classes: 60,
    projects: 12,
    daysRemaining: 15,
  },
  batchDetails: {
    startDate: "May 25, 2026",
    startTime: "Sunday & Wednesday",
    completionCategory: "Professional Course",
    classTime: "09:00 PM - 11:00 PM",
    activeBatch: "Batch-13",
    enrollmentStatus: "Admission Ongoing",
  },
  curriculum: {
    title: "কোর্স কারিকুলাম",
    description: "আপনার লার্নিং জার্নিকে ১০টি মাইলস্টোনে ভাগ করা হয়েছে যাতে আপনি ধাপে ধাপে শিখতে পারেন।",
    milestones: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      title: `মাইলস্টোন ${i + 1}: ${getMilestoneTitle(i + 1)}`,
      topics: getMilestoneTopics(i + 1),
      learnAndBuild: getMilestoneOutcome(i + 1),
    })),
  },
  skills: [
    { title: "React Architecture", level: "Expert" },
    { title: "Node.js Backend", level: "Advanced" },
    { title: "Database Modeling", level: "Expert" },
    { title: "AI Integration", level: "Advanced" },
  ]
};

function getMilestoneTitle(id: number) {
  const titles = [
    "ওয়েব ডেভেলপমেন্টের হাতেখড়ি",
    "অ্যাডভান্সড জাভাস্ক্রিপ্ট মাস্টারক্লাস",
    "রিয়েক্ট কোর ফান্ডামেন্টালস",
    "স্টেট ম্যানেজমেন্ট ও হুকস",
    "ব্যাকএন্ড ফান্ডামেন্টালস (Node & Express)",
    "ডেটাবেস আর্কিটেকচার (MongoDB)",
    "অথেন্টিকেশন ও সিকিউরিটি",
    "ফুল-স্ট্যাক প্রজেক্ট ডেভেলপমেন্ট",
    "ডেপ্লয়মেন্ট ও অপ্টিমাইজেশন",
    "ইন্টারভিউ প্রিপারেশন ও পোর্টফোলিও",
  ];
  return titles[id - 1] || "অ্যাডভান্সড টপিক";
}

function getMilestoneTopics(id: number) {
  return [
    "HTML5 Semantic Tags",
    "Modern CSS3 with Flexbox",
    "Responsive Grid Layout",
    "Animations & Transitions",
    "DOM Manipulation",
    "ES6+ Features",
  ];
}

function getMilestoneOutcome(id: number) {
  return `এই মাইলস্টোনে আমরা একটি পূর্ণাঙ্গ রেসপন্সিভ প্রজেক্ট তৈরি করব এবং মডার্ন টুলসগুলো ব্যবহার করা শিখব। যা আপনাকে পরবর্তী লেভেলের জন্য প্রস্তুত করবে।`;
}

export default function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      // Resolve params first to get correct slug for redirect
      const resolvedParams = await params;
      if (!mounted) return;

      // Check authentication
      if (!ClientAuth.isAuthenticated()) {
        window.location.href = `/auth/login?redirect=course&course=${resolvedParams.slug}`;
        return;
      }

      setSlug(resolvedParams.slug);
      setLoading(false);
    };

    initializePage();
    return () => { mounted = false; };
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080616] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // In a real app, you would fetch course data by slug here
  // const course = await getCourseBySlug(slug);
  const course = MOCK_COURSE;

  return (
    <main className="min-h-screen bg-[#080616] selection:bg-[#2F2FE4] selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#2F2FE4] opacity-5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#2F2FE4] opacity-5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        {/* Sections */}
        <CourseHero course={course} />
        
        <BatchInfo batchDetails={course.batchDetails} />
        
        <div className="container mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>

        <SkillsSection skills={course.skills} />

        <CourseCurriculum curriculum={course.curriculum} />
        
        <Technologies />
        
        <ProjectsSection />
        
        <DemoClassSection />
        
        <InstructorSection />
        
        <StudentFeedback />
        
        <FAQSection />
        
        <CallToAction />
      </div>
    </main>
  );
}
"use client";

import React from "react";
import Link from "next/link";
import { 
  Video, Users, MonitorPlay, MapPin, Landmark, 
  Calendar, Clock, ArrowRight, PlayCircle 
} from "lucide-react";

const CATEGORIES = [
  {
    title: "Recorded Courses",
    desc: "Learn at your own pace with our premium pre-recorded video lessons.",
    students: "2,500+",
    duration: "Lifetime Access",
    batch: "24/7 Available",
    ends: "N/A",
    videos: "30+",
    icon: Video,
    color: "#2F2FE4",
    isGovt: false,
    route: "/courses/recorded",
  },
  {
    title: "Online Batches",
    desc: "Join interactive live classes directly with expert industry mentors.",
    students: "1,800+",
    duration: "3-6 Months",
    batch: "Batch 14",
    ends: "May 10, 2026",
    videos: "50+",
    icon: MonitorPlay,
    color: "#60a5fa",
    isGovt: false,
    route: "/courses/online",
  },
  {
    title: "Offline Batches",
    desc: "Hands-on project-based learning in our physical high-tech labs.",
    students: "1,200+",
    duration: "4 Months",
    batch: "Batch 08",
    ends: "May 15, 2026",
    videos: "20+",
    icon: MapPin,
    color: "#006a4e",
    isGovt: false,
    route: "/courses/offline",
  },
  {
    title: "Govt Projects",
    desc: "Special IT training programs fully funded by government initiatives.",
    students: "800+",
    duration: "6 Months",
    batch: "Batch 03",
    ends: "May 05, 2026",
    videos: "40+",
    icon: Landmark,
    color: "#f42a41",
    isGovt: true,
    route: "/courses/govt",
  }
];

export default function CategorySection() {
  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      
      {/* Mixed Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c17] via-[#080616] to-[#05060f] z-0"></div>
      
      {/* Middle Glow Effects */}
      <div className="absolute top-1/2 left-0 w-full h-full overflow-hidden z-0 pointer-events-none -translate-y-1/2">
        {/* Middle Left Glow */}
        <div className="absolute top-1/2 left-[-5%] w-[30%] h-[30%] bg-blue-600/12 rounded-full blur-[100px] animate-blob"></div>
        {/* Middle Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[25%] h-[25%] bg-purple-600/10 rounded-full blur-[90px] animate-blob animation-delay-2000"></div>
        {/* Middle Right Glow */}
        <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-indigo-600/12 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Area */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">Categories</span>
          </h2>
          <p className="text-gray-400 font-medium text-base md:text-lg">Choose the right path to build your professional career</p>
        </div>

        {/* Categories Grid - Responsive breakpoints: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((item, idx) => (
            <div key={idx} className="group rounded-[2rem] p-8 border border-white/5 bg-white/[0.02] flex flex-col transition-all duration-300 hover:-translate-y-2 hover:border-white/10 hover:bg-white/[0.04]">
              
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
              >
                <item.icon style={{ color: item.color }} size={28} />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-grow">
                {item.desc}
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, label: "Students", value: item.students },
                  { icon: Clock, label: "Duration", value: item.duration },
                  { icon: Calendar, label: "Current Batch", value: item.batch }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-gray-500 uppercase font-bold tracking-wider">
                      <feat.icon size={14} /> {feat.label}
                    </span>
                    <span className="text-gray-300 font-bold">{feat.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#f42a41] uppercase font-bold tracking-wider">Deadline</span>
                  <span className="text-white font-bold">{item.ends}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mb-8 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                <PlayCircle size={14} className="text-[#60a5fa]" />
                {item.videos} Video Lessons
              </div>

              <Link 
                href={item.isGovt ? "https://www.luminouscentree.com/apply" : item.route}
                target={item.isGovt ? "_blank" : "_self"}
                rel={item.isGovt ? "noopener noreferrer" : ""}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-center
                ${item.isGovt 
                  ? "bg-[#f42a41] text-white hover:bg-[#d9263a] shadow-[0_10px_20px_rgba(244,42,65,0.2)]" 
                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
              >
                {item.isGovt ? "Apply Now" : "View Details"} <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

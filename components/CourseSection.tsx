"use client";

import React from "react";
import Image from "next/image";
import { Star, Users, Radio, MoveRight } from "lucide-react";

const COURSES = [
  {
    title: "AI-Ready MERN Stack Web Development Career Path",
    thumbnail: "https://i.ibb.co.com/35332p83/preview.png",
    batch: "Batch-6",
    rating: 4.8,
    reviews: 80,
    type: "Live",
    students: "248+",
    price: 8000,
    originalPrice: 10000,
    discount: "20% Off",
    tag: "Online"
  },
  {
    title: "Advanced Digital Marketing for Freelancing",
    thumbnail: "https://i.ibb.co.com/35332p83/preview.png",
    batch: "Batch-12",
    rating: 4.9,
    reviews: 124,
    type: "Live",
    students: "500+",
    price: 6000,
    originalPrice: 8000,
    discount: "25% Off",
    tag: "Online"
  },
  {
    title: "Graphic Design & Creative Branding for Freelancing",
    thumbnail: "https://i.ibb.co.com/35332p83/preview.png",
    batch: "Batch-9",
    rating: 4.7,
    reviews: 95,
    type: "Offline",
    students: "150+",
    price: 7000,
    originalPrice: 9000,
    discount: "22% Off",
    tag: "Offline"
  },
  {
    title: "Professional Accounting & Bookkeeping for Freelancing",
    thumbnail: "https://i.ibb.co.com/35332p83/preview.png",
    batch: "Batch-4",
    rating: 4.8,
    reviews: 45,
    type: "Live",
    students: "120+",
    price: 5000,
    originalPrice: 7500,
    discount: "33% Off",
    tag: "Online"
  }
];

export default function CourseSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#080616] py-16 lg:py-24">
      
      {/* GLOW 4: RIGHT MIDDLE - To alternate again */}
      <div className="absolute top-1/2 -translate-y-1/2 -right-40 w-[500px] h-[500px] bg-[#162E93] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse delay-700"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">Courses</span>
          </h2>
          <p className="text-gray-500 font-medium text-base md:text-lg">Invest in yourself with our most in-demand programs</p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {COURSES.map((course, idx) => (
            <div key={idx} className="group bg-[#0c0e1f] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 shadow-2xl flex flex-col">
              
              {/* Thumbnail Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image 
                  src={course.thumbnail} 
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-4 py-1.5 bg-[#8b5cf6] text-white text-[11px] font-bold rounded-lg shadow-lg">
                  {course.tag}
                </div>
              </div>

              {/* Course Body */}
              <div className="p-6 flex flex-col flex-grow space-y-4">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 bg-[#006a4e]/20 border border-[#006a4e]/30 rounded-md">
                    <span className="text-[#22c55e] text-[10px] font-black uppercase tracking-tighter italic">
                      {course.batch}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-white text-xs font-bold">{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-[15px] font-bold text-gray-100 leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Radio size={14} className="text-pink-500 animate-pulse" />
                    {course.type}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Users size={14} />
                    {course.students}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">{course.price} TK</span>
                    <span className="text-xs text-gray-500 line-through">{course.originalPrice}</span>
                  </div>
                  <div className="px-2 py-1 bg-[#f42a41]/10 rounded-md">
                    <span className="text-[#f42a41] text-[10px] font-bold">{course.discount}</span>
                  </div>
                </div>

                <button className="w-full py-3.5 bg-[#006a4e] text-white rounded-xl text-sm font-bold hover:bg-[#005a42] transition-all transform active:scale-95 shadow-[0_5px_15px_rgba(0,106,78,0.2)]">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="flex justify-center">
          <button className="group flex items-center gap-3 px-10 py-4 border border-white/10 bg-white/5 text-white rounded-2xl text-base font-bold hover:bg-[#2F2FE4] hover:border-[#2F2FE4] transition-all shadow-xl">
            View All Courses
            <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
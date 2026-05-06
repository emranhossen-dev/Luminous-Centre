'use client';

import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { label: "Available Courses", value: "12+", color: "text-[#eab308]" },
  { label: "Total Students", value: "1500+", color: "text-[#22c55e]" },
  { label: "Learning Materials", value: "150+", color: "text-[#a855f7]" },
  { label: "Satisfaction Rate", value: "93%", color: "text-[#2F2FE4]" },
];

const AboutSection = () => {
  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden py-16 lg:py-24">
      {/* Gradient overlay for smooth transition from Banner */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#080616] to-[#0b0c17] z-0"></div>
      
      {/* Middle Glow Effects */}
      <div className="absolute top-1/2 left-0 w-full h-full overflow-hidden z-0 pointer-events-none -translate-y-1/2">
        {/* Middle Left Glow */}
        <div className="absolute top-1/2 left-[-5%] w-[30%] h-[30%] bg-blue-600/12 rounded-full blur-[100px] animate-blob"></div>
        {/* Middle Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[25%] h-[25%] bg-purple-600/10 rounded-full blur-[90px] animate-blob animation-delay-2000"></div>
        {/* Middle Right Glow */}
        <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-indigo-600/12 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        
        {/* LEFT SIDE: Image Container */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-[#2F2FE4]/10 rounded-[2rem] blur opacity-20"></div>
          <div className="relative aspect-[16/11] w-full rounded-[2rem] overflow-hidden border border-white/10 bg-[#0c0e1f] shadow-2xl">
            <img 
              src="https://i.ibb.co.com/tTr3XKDw/classroom.png" 
              alt="Luminous Skills Classroom"
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080616]/40 via-transparent to-transparent"></div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Content Section */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col space-y-8"
        >
          <div className="space-y-5 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white leading-[1.2] tracking-tight">
              We Offer Both <br className="hidden xl:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
                Online & Offline
              </span> Courses
            </h2>
            <p className="max-w-xl text-gray-400 text-sm md:text-base leading-relaxed mx-auto lg:mx-0">
              বাংলাদেশের শীর্ষস্থানীয় আইটি কোর্সের মাধ্যমে আপনার ক্যারিয়ারকে এগিয়ে নিন। আমরা দক্ষ মেন্টরদের তত্ত্বাবধানে মানসম্মত শিক্ষা নিশ্চিত করি।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 w-full">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#2F2FE4]/30 transition-all text-left">
              <h5 className="text-white font-bold text-sm mb-1.5">অনলাইন কোর্স</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">দেশের যেকোনো প্রান্ত থেকে ঘরে বসেই শিখুন আধুনিক সব প্রযুক্তি।</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#2F2FE4]/30 transition-all text-left">
              <h5 className="text-white font-bold text-sm mb-1.5">অফলাইন কোর্স</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">আমাদের ল্যাবে সরাসরি বসে মেন্টরদের উপস্থিতিতে হাতে-কলমে শিখুন।</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 bg-[#0c0e1f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {STATS.map((stat, idx) => (
              <div 
                key={idx} 
                className={`p-5 flex flex-col items-center justify-center text-center hover:bg-white/[0.03] transition-colors
                  ${idx !== STATS.length - 1 ? "border-r border-white/5" : ""} 
                  ${idx % 2 === 0 ? "border-r md:border-r-0 lg:border-r" : ""}`}
              >
                <span className={`text-xl md:text-2xl font-black mb-1 tracking-tight ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;

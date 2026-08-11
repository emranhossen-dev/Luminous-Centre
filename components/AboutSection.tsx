"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Award, Laptop, Sparkles, CheckCircle2 
} from "lucide-react";

const AboutSection = () => {
  const STATS = [
    { label: "সফল শিক্ষার্থী", value: "২০০+", color: "text-blue-400" },
    { label: "সাকসেস রেট", value: "৯৮%", color: "text-indigo-400" },
    { label: "অভিজ্ঞ মেন্টর", value: "১০+", color: "text-[#60a5fa]" },
    { label: "সক্রিয় কোর্স", value: "১২+", color: "text-purple-400" }
  ];


  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden py-10 lg:py-14">
      {/* Gradient overlay for smooth transition from Banner */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#080616] to-[#0b0c17] z-0"></div>

      {/* Middle Glow Effects */}
      <div className="absolute top-1/2 left-0 w-full h-full overflow-hidden z-0 pointer-events-none -translate-y-1/2">
        <div className="absolute top-1/2 left-[-5%] w-[30%] h-[30%] bg-blue-600/12 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[25%] h-[25%] bg-purple-600/10 rounded-full blur-[90px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-indigo-600/12 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        
        {/* LEFT SIDE: Image Container with Aspect 16/10 & Overflow Hidden */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-[#2F2FE4]/10 rounded-[2rem] blur opacity-20"></div>
          <div className="relative aspect-[16/10] w-full rounded-[2rem] overflow-hidden border border-white/10 bg-[#0c0e1f] shadow-2xl">
            <img 
              src="https://i.ibb.co.com/Hpf7XXB0/f96d276e-1936-43f5-823a-3beebdd836be.jpg" 
              alt="Luminous Skills Campus & Lab"
              className="w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080616]/40 via-transparent to-transparent"></div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Content Section */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-6"
        >
          <div className="space-y-3.5 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white leading-[1.2] tracking-tight">
              We Offer Both <br className="hidden xl:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
                Online & Offline
              </span> Courses
            </h2>
            <p className="max-w-xl text-gray-400 text-sm md:text-base leading-relaxed mx-auto lg:mx-0" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
              বাংলাদেশের শীর্ষস্থানীয় আইটি কোর্সের মাধ্যমে আপনার ক্যারিয়ারকে এগিয়ে নিন। আমরা দক্ষ মেন্টরদের তত্ত্বাবধানে মানসম্মত শিক্ষা নিশ্চিত করি।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#2F2FE4]/30 transition-all text-left">
              <h3 className="text-white font-bold text-sm mb-1" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>অনলাইন কোর্স</h3>
              <p className="text-xs text-gray-400 leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>দেশের যেকোনো প্রান্ত থেকে ঘরে বসেই শিখুন আধুনিক সব প্রযুক্তি।</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#2F2FE4]/30 transition-all text-left">
              <h3 className="text-white font-bold text-sm mb-1" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>অফলাইন কোর্স</h3>
              <p className="text-xs text-gray-400 leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>আমাদের ল্যাবে সরাসরি বসে মেন্টরদের উপস্থিতিতে হাতে-কলমে শিখুন।</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 bg-[#0c0e1f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {STATS.map((stat, idx) => (
              <div 
                key={idx} 
                className={`p-4 flex flex-col items-center justify-center text-center hover:bg-white/[0.03] transition-colors
                  ${idx !== STATS.length - 1 ? "border-r border-white/5" : ""} 
                  ${idx % 2 === 0 ? "border-r md:border-r-0 lg:border-r" : ""}`}
              >
                <span className={`text-xl md:text-2xl font-black mb-0.5 tracking-tight ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
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

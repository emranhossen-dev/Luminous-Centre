"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

const TECH_ICONS = [
  { name: "React", color: "#61DAFB", top: "15%", left: "10%" },
  { name: "Next", color: "#FFFFFF", top: "50%", left: "5%" },
  { name: "Node", color: "#339933", top: "80%", left: "12%" },
  { name: "Mongo", color: "#47A248", top: "15%", right: "10%" },
  { name: "Express", color: "#ffffff", top: "50%", right: "5%" },
  { name: "Tailwind", color: "#06B6D4", top: "80%", right: "12%" },
];

export default function Banner() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-[#0b0c17]">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('https://i.ibb.co/sp2vGsP9/Gemini-Generated-Image-62pq3q62pq3q62pq.png')" }}
      />
      
      {/* Floating Tech Icons - Rounded & Animated */}
      {TECH_ICONS.map((skill, idx) => (
        <div 
          key={idx}
          className="absolute z-20 hidden lg:flex w-16 h-16 rounded-full glass border-white/20 items-center justify-center animate-float shadow-xl"
          style={{ 
            top: skill.top, 
            left: skill.left, 
            right: skill.right,
            animationDelay: `${idx * 0.5}s`,
            boxShadow: `0 10px 20px -5px ${skill.color}30`
          }}
        >
          <span style={{ color: skill.color }} className="text-[10px] font-black uppercase">
            {skill.name}
          </span>
        </div>
      ))}

      <div className="max-w-4xl mx-auto px-4 w-full relative z-10 text-center flex flex-col items-center">
        
        {/* Badge - Previous Style */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-white/10 bg-[#2e31e1]/10 backdrop-blur-xl">
          <Zap size={14} className="text-[#2e31e1] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.2em] text-[#60a5fa] uppercase">Luminous Skill Dev</span>
        </div>

        {/* Heading - Clean & Standard Bangla Font */}
        <h1 className="text-6xl md:text-8xl font-black leading-[1.1] text-white tracking-tighter mb-8">
          আপনার দক্ষতা <br />
          <span className="text-gradient">বৃদ্ধি করুন</span>
        </h1>

        {/* Description - Standard Weight */}
        <p className="text-xl text-white/50 max-w-2xl leading-relaxed font-medium mb-10">
          আধুনিক কোর্সের সাথে নতুন শেখার যাত্রা শুরু করুন। দেশসেরা মেন্টরদের তত্ত্বাবধানে নিজেকে গড়ে তুলুন।
        </p>

        {/* Features Ribbon - Single Row */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[13px] font-bold text-white/80 mb-12">
          <span>24/7 Support</span>
          <div className="w-1 h-1 rounded-full bg-[#2e31e1]" />
          <span>Projectwise Curriculum</span>
          <div className="w-1 h-1 rounded-full bg-[#2e31e1]" />
          <span className="flex items-center gap-2">
            10+ Real Life Projects <Sparkles size={14} className="text-yellow-400" />
          </span>
        </div>

        {/* CTA Buttons - Previous Logic */}
        <div className="flex flex-row gap-5">
          <Link href="/enroll" className="group relative px-10 py-5 rounded-2xl bg-[#2e31e1] text-white font-bold overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(46,49,225,0.5)]">
            <span className="relative z-10 flex items-center gap-2">
              এখনই ভর্তি হোন <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Link>

          <Link href="/courses" className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5 text-white font-bold backdrop-blur-md hover:bg-white/10 transition-all">
            কোর্সসমূহ দেখুন
          </Link>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2e31e1]/10 blur-[150px] -z-10 rounded-full" />
      </div>
    </section>
  );
}
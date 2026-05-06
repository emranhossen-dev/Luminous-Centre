"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Calendar, 
  Layers, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Infinity,
  ArrowRight,
  Play,
  Award,
  Users,
  TrendingUp
} from "lucide-react";

interface CourseHeroProps {
  course: {
    title: string;
    description: string;
    category: string;
    price: number;
    oldPrice: number;
    stats: {
      classes: number;
      projects: number;
      daysRemaining: number;
    };
    perks?: string[];
  };
}

export default function CourseHero({ course }: CourseHeroProps) {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                  !document.documentElement.classList.contains("light");
    setTheme(isDark ? "dark" : "light");
  }, []);

  return (
    <section className={`relative pt-20 pb-16 lg:pt-24 lg:pb-24 overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0b0c17]' : 'bg-white'
    }`}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-stretch min-h-[600px]">
          
          {/* Left Side: Content */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <div className="space-y-8">
              {/* Course Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' 
                    ? 'bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#60a5fa]' 
                    : 'bg-blue-100 border border-blue-200 text-blue-600'
                }`}
              >
                <Zap size={14} className={theme === 'dark' ? "fill-[#60a5fa]" : "fill-blue-600"} />
                {course.category} Course
              </motion.div>

              {/* Course Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`text-4xl md:text-6xl font-black leading-[1.1] tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {course.title}
              </motion.h1>

              {/* Course Description in Bangla */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`text-xl md:text-2xl leading-relaxed font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
                style={{ fontFamily: "var(--font-bangla)" }}
              >
                {course.description}
              </motion.p>
            </div>

            {/* Enroll Button with Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              <button className={`px-8 py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center gap-3 group shadow-lg ${
                theme === 'dark' 
                  ? 'bg-[#2F2FE4] hover:bg-[#162E93] text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                Enroll Course
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex flex-col">
                <span className={`text-3xl font-black italic ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{course.price} TK</span>
                <span className={`text-sm line-through font-bold ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>Regular Price {course.oldPrice} TK</span>
              </div>
            </motion.div>

            {/* Course Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { label: "Classes", value: `${course.stats.classes}+`, icon: Layers },
                { label: "Projects", value: `${course.stats.projects}+`, icon: CheckCircle2 },
                { label: "Days Left", value: course.stats.daysRemaining, icon: Clock },
              ].map((stat, idx) => (
                <div key={idx} className={`p-4 rounded-2xl flex flex-col items-center text-center space-y-1 transition-colors ${
                  theme === 'dark' 
                    ? 'glass border border-white/5 hover:border-[#2F2FE4]/50' 
                    : 'bg-gray-50 border border-gray-200 hover:border-blue-300'
                }`}>
                  <stat.icon size={20} className={theme === 'dark' ? 'text-[#60a5fa] mb-1' : 'text-blue-600 mb-1'} />
                  <span className={`text-xl font-black italic ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Side: Video Banner with Course Benefits */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="relative group h-full flex flex-col">
              {/* Background Glow */}
              <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}></div>
              
              <div className={`relative rounded-[2.5rem] overflow-hidden flex flex-col h-full border ${
                theme === 'dark' 
                  ? 'bg-[#0c0e1f] border-white/5' 
                  : 'bg-white border-gray-200'
              }`}>
                {/* Video Banner */}
                <div className={`relative aspect-video flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-[#2F2FE4]/20 to-[#60a5fa]/20' 
                    : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                }`}>
                  <div className="absolute inset-0 bg-gray-900/10"></div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg group ${
                      theme === 'dark' ? 'bg-[#2F2FE4]' : 'bg-blue-600'
                    }`}
                  >
                    <Play size={32} className="fill-white ml-1" />
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
                      theme === 'dark' ? 'bg-[#2F2FE4]' : 'bg-blue-600'
                    }`}></div>
                  </motion.button>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                    }`}>Course Preview Video</p>
                  </div>
                </div>

                {/* Course Benefits */}
                <div className="p-8 space-y-6 flex-1">
                  <h3 className={`text-xl font-black flex items-center gap-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Award className={theme === 'dark' ? 'text-[#60a5fa]' : 'text-blue-600'} />
                    কোর্স থেকে যা শিখবেন
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { title: "প্রফেশনাল স্কিল", desc: "ইন্ডাস্ট্রি স্ট্যান্ডার্ড", icon: TrendingUp },
                      { title: "রিয়েল প্রজেক্ট", desc: "১২+ প্রজেক্ট তৈরি", icon: CheckCircle2 },
                      { title: "জব প্লেসমেন্ট", desc: "ক্যারিয়ার গাইডলাইন", icon: Users },
                      { title: "সার্টিফিকেট", desc: "ভেরিফাইড সার্টিফিকেট", icon: Award },
                    ].map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="text-center space-y-2"
                      >
                        <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${
                          theme === 'dark' 
                            ? 'bg-[#2F2FE4]/20 text-[#60a5fa]' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <benefit.icon size={20} />
                        </div>
                        <h4 className={`font-bold text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{benefit.title}</h4>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{benefit.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MoveRight, Zap, Video, MonitorPlay, Users, BookOpenCheck, 
  Clock3, LayoutGrid, BookOpen, CodeXml, Megaphone, Layers, Calculator 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Banner = () => {
  const { user, openModal } = useAuth();

  const handleEnrollmentClick = () => {
    console.log('Banner enrollment button clicked!');
    
    if (!user) {
      console.log('Redirecting to login page...');
      // Redirect to login page
      window.location.href = '/auth/login?redirect=enroll';
      return;
    }
    
    console.log('Redirecting to courses...');
    // If authenticated, redirect to courses page
    window.location.href = '/courses';
  };

  const completionTypes = [
    { name: "প্রি-রেকর্ডেড", icon: Video },
    { name: "অনলাইন লাইভ", icon: MonitorPlay },
    { name: "অফলাইন কোর্স", icon: Users },
    { name: "সরকারি প্রজেক্ট", icon: BookOpenCheck },
  ];

  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-[#05060f] pt-28 lg:pt-20">
      
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {/* Top Left Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-blob"></div>
        {/* Top Right Glow */}
        <div className="absolute top-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-600/15 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        {/* Middle Smaller Glow */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[20%] h-[20%] bg-purple-600/10 rounded-full blur-[80px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT SIDE: Typography */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em]">
              Elevate Your Potential
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-5 leading-[1.2] tracking-tight">
            <span className="block text-gray-300 font-medium text-xl md:text-2xl mb-1">দক্ষতা বৃদ্ধি করুন,</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
              Luminous Skills Development <br className="hidden xl:block" /> Training Center
            </span>
            <span className="text-xl md:text-2xl font-normal text-gray-400"> - এর সাথে</span>
          </h1>

          <p className="max-w-lg text-gray-500 text-base md:text-lg mb-10 leading-relaxed">
            আধুনিক প্রযুক্তির সাথে তাল মিলিয়ে নিজেকে দক্ষ করে তুলুন। প্রফেশনাল মেন্টরদের সাথে শিখুন ওয়েব ডেভেলপমেন্ট, ডিজাইন এবং আরও অনেক কিছু।
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12 w-full max-w-lg lg:max-w-none">
            {completionTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm group hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300">
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span className="text-gray-400 group-hover:text-white transition-colors text-[11px] font-medium text-center tracking-wide">
                    {type.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={handleEnrollmentClick}
              className="group flex items-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#2F2FE4] text-white rounded-xl text-sm font-bold hover:bg-[#162E93] transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              কোর্সগুলো দেখুন
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Floating Visuals */}
        <div className="relative flex justify-center items-center h-full mb-16 lg:mb-0">
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 -left-4 lg:-left-16 z-20 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md hidden sm:block"
          >
            <CodeXml className="w-6 h-6 text-blue-400" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute -top-6 right-10 lg:right-0 z-20 p-3 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-md hidden sm:block"
          >
            <Megaphone className="w-6 h-6 text-green-400" />
          </motion.div>

          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-1/2 -right-6 lg:-right-12 z-20 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-md hidden sm:block"
          >
            <Layers className="w-6 h-6 text-purple-400" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 left-12 lg:-left-4 z-20 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md hidden sm:block"
          >
            <Calculator className="w-6 h-6 text-amber-400" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-[500px] rounded-[2rem] border border-white/10 bg-[#0c0e1f] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-blue-500/30 transition-all duration-500"
          >
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-8 border border-white/5">
              <Image 
                src="https://i.ibb.co.com/35332p83/preview.png" 
                alt="Dashboard Preview"
                fill
                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e1f] via-transparent to-transparent"></div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-10">
              {[
                { name: "Digital Marketing", icon: "📢" },
                { name: "Graphic Design", icon: "🎨" },
                { name: "Web Design", icon: "💻" },
                { name: "Accounting", icon: "📊" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-blue-500/20 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold uppercase text-center tracking-tight">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              {[
                { text: "24/7 Support", icon: Clock3 },
                { text: "1:1 Mentor Support", icon: Users },
                { text: "Project Based Curriculum", icon: LayoutGrid },
                { text: "Govt. Certificate", icon: BookOpen }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="text-gray-300 text-sm font-medium leading-tight">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Banner;

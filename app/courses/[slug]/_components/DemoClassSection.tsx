"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PlayCircle, Lock, Unlock, Play, ArrowRight } from "lucide-react";

export default function DemoClassSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#2F2FE4]/5 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="glass rounded-[3rem] p-8 md:p-16 border-white/5 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-white italic leading-tight">
                  Experience Our <span className="text-gradient-blue">Demo Class</span>
                </h2>
                <p className="text-gray-400 text-lg font-medium" style={{ fontFamily: "var(--font-bangla)" }}>
                  এনরোল করার আগেই আমাদের কোয়ালিটি চেক করুন। স্টুডেন্ট ড্যাশবোর্ড থেকে প্রথম ৩টি মডিউল একদম ফ্রিতে দেখুন এবং আমাদের লার্নিং মেথডোলজি বুঝুন।
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "১০টি মাইলস্টোন ও ১০০+ মডিউল", icon: Unlock },
                  { title: "প্রথম ৩টি মডিউল একদম ফ্রি", icon: PlayCircle },
                  { title: "স্টুডেন্ট ড্যাশবোর্ড এক্সেস", icon: PlayCircle },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <item.icon size={18} />
                    </div>
                    <span className="text-gray-300 font-bold" style={{ fontFamily: "var(--font-bangla)" }}>{item.title}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/demo"
                className="inline-flex items-center gap-3 px-8 py-5 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-2xl font-black text-lg transition-all transform active:scale-95 group shadow-[0_0_30px_rgba(47,47,228,0.3)]"
              >
                View Demo Class
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Visual Dashboard Mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#2F2FE4] to-transparent rounded-[3rem] blur-2xl opacity-20"></div>
              
              <div className="relative glass bg-[#080616]/80 rounded-[2.5rem] border-white/10 p-6 space-y-4 shadow-2xl">
                {/* Header Mockup */}
                <div className="h-4 w-1/3 bg-white/5 rounded-full mb-8"></div>
                
                <div className="space-y-3">
                  {[
                    { title: "Module 01: Getting Started", free: true },
                    { title: "Module 02: Core Fundamentals", free: true },
                    { title: "Module 03: Advanced Hooks", free: true },
                    { title: "Module 04: Project Architecture", free: false },
                    { title: "Module 05: State Management", free: false },
                  ].map((mod, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${mod.free ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mod.free ? 'bg-[#2F2FE4]/20 text-[#60a5fa]' : 'bg-white/5 text-gray-500'}`}>
                          {mod.free ? <Play size={14} fill="currentColor" /> : <Lock size={14} />}
                        </div>
                        <span className="text-xs font-bold text-gray-300 italic">{mod.title}</span>
                      </div>
                      {mod.free && <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Free</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Unlock Prompt */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -right-6 glass p-6 rounded-3xl border-[#2F2FE4]/30 shadow-2xl z-20 hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#2F2FE4] flex items-center justify-center text-white shadow-lg">
                    <Unlock size={24} />
                  </div>
                  <div className="pr-4">
                    <p className="text-white font-black text-sm italic">Unlock All Modules</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Enrolled Students Only</p>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

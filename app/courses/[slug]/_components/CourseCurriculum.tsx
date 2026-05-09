"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, BookOpen, Target, ArrowRight } from "lucide-react";

interface Milestone {
  id: number;
  title: string;
  topics: string[];
  learnAndBuild: string;
}

interface CourseCurriculumProps {
  curriculum: {
    title: string;
    description: string;
    milestones: Milestone[];
  };
}

export default function CourseCurriculum({ curriculum }: CourseCurriculumProps) {
  const [activeMilestone, setActiveMilestone] = useState(1);
  const currentMilestone = curriculum.milestones.find(m => m.id === activeMilestone) || curriculum.milestones[0];

  return (
    <section className="py-24 bg-[#080616]/50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-bangla)" }}
          >
            {curriculum.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg font-medium"
            style={{ fontFamily: "var(--font-bangla)" }}
          >
            {curriculum.description}
          </motion.p>
        </div>

        {/* Milestone Pagination */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {curriculum.milestones.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMilestone(m.id)}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl font-black text-lg transition-all transform active:scale-90 flex items-center justify-center border ${
                activeMilestone === m.id
                  ? "bg-[#2F2FE4] text-white border-[#2F2FE4] shadow-[0_0_20px_rgba(47,47,228,0.4)] scale-110 z-10"
                  : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {String(m.id).padStart(2, '0')}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMilestone}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-2 gap-8 items-start"
          >
            {/* Left: Topics Covered */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/20 flex items-center justify-center text-[#60a5fa]">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-bangla)" }}>
                  {currentMilestone.title}
                </h3>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-300" style={{ fontFamily: "var(--font-bangla)" }}>
                  যে বিষয়গুলো কভার করা হবে:
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {currentMilestone.topics.map((topic, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass p-5 rounded-2xl border-white/5 flex items-start gap-3 group hover:border-[#2F2FE4]/30 transition-colors"
                    >
                      <CheckCircle size={18} className="text-[#60a5fa] shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 font-medium leading-snug" style={{ fontFamily: "var(--font-bangla)" }}>
                        {topic}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: What We Learn and Build */}
            <div className="lg:sticky lg:top-32">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa] rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative glass p-8 rounded-[2rem] border-white/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Target size={20} />
                    </div>
                    <h4 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-bangla)" }}>
                      এই মাইলস্টোনে আমরা যা শিখব ও তৈরি করব
                    </h4>
                  </div>
                  
                  <motion.p 
                    className="text-gray-400 text-lg leading-relaxed font-medium"
                    style={{ fontFamily: "var(--font-bangla)" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentMilestone.learnAndBuild}
                  </motion.p>

                  {/* Animated Learning Points */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-[#60a5fa]" style={{ fontFamily: "var(--font-bangla)" }}>
                      এই মাইলস্টোনে আপনি যা শিখবেন:
                    </h4>
                    {[
                      "মডার্ন ওয়েব ডেভেলপমেন্ট কনসেপ্ট",
                      "রিয়েল-লাইফ প্রজেক্ট বেসড লার্নিং",
                      "ইন্ডাস্ট্রি স্ট্যান্ডার্ড কোডিং প্র্যাকটিস",
                      "প্রফেশনাল পোর্টফোলিও তৈরি"
                    ].map((point, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#60a5fa]"></div>
                        <span className="text-gray-300 font-medium" style={{ fontFamily: "var(--font-bangla)" }}>
                          {point}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button 
                    className="flex items-center gap-2 text-[#60a5fa] font-black uppercase tracking-wider text-sm hover:gap-3 transition-all group/btn mt-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore Details
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

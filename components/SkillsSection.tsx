"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Star } from "lucide-react";

interface Skill {
  title: string;
  level: string;
}

interface SkillsSectionProps {
  skills?: Skill[];
}

const DEFAULT_SKILLS: Skill[] = [
  { title: "Frontend Mastery", level: "Expert" },
  { title: "Backend Architecture", level: "Advanced" },
  { title: "Database Management", level: "Expert" },
  { title: "API Development", level: "Advanced" },
];

export default function SkillsSection({ skills = DEFAULT_SKILLS }: SkillsSectionProps) {
  return (
    <section className="py-24 bg-[#0c0e1f]/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white italic">
            Skills <span className="text-[#60a5fa]">You'll Acquire</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium" style={{ fontFamily: "var(--font-bangla)" }}>
            এই কোর্সটি সম্পন্ন করার পর আপনি যে সকল গুরুত্বপূর্ণ স্কিল অর্জন করবেন যা আপনাকে একজন প্রফেশনাল হিসেবে গড়ে তুলবে।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-[#2F2FE4]/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2F2FE4]/10 flex items-center justify-center text-[#60a5fa] mb-6 border border-[#2F2FE4]/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 italic">{skill.title}</h3>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-gray-500 text-xs font-black uppercase tracking-widest">{skill.level}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

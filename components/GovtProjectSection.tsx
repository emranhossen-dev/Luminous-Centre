"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Landmark, Award, CheckCircle2, ArrowRight, BookOpenCheck, 
  Users, FileCheck
} from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Award, label: "সরকারি সনদপত্র", value: "১০০%", color: "text-[#00a651]" },
  { icon: Users, label: "বিনামূল্যে প্রশিক্ষণ", value: "১০০%", color: "text-blue-500 dark:text-blue-400" },
  { icon: BookOpenCheck, label: "কোর্স সময়কাল", value: "৩ মাস", color: "text-purple-600 dark:text-purple-400" },
  { icon: FileCheck, label: "জব প্লেসমেন্ট সহায়তা", value: "প্রদেয়", color: "text-amber-500 dark:text-amber-400" },
];

const FEATURES = [
  "National Skills Development Authority (NSDA) স্বীকৃত কারিকুলাম",
  "ASSETS প্রকল্পের আওতায় সম্পূর্ণ সরকারি অর্থায়নে কোর্স",
  "প্রফেশনাল আইটি মেন্টরদের সাথে সরাসরি প্র্যাকটিক্যাল ল্যাব ক্লাস",
  "কোর্স শেষে সরকারি সনদপত্র ও ফ্রিল্যান্সিং ক্যারিয়ার মেকিং দিকনির্দেশনা"
];

export default function GovtProjectSection() {
  return (
    <section className="relative w-full overflow-hidden py-10 lg:py-14 bg-slate-50 dark:bg-[#05060f] transition-colors duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-[#080616] dark:via-[#05060f] dark:to-[#080616] z-0" />
      
      {/* Bangladesh Flag Accent Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#006a4e]/10 rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#006a4e]/15 border border-[#006a4e]/30 text-[#00a651] text-xs font-black uppercase tracking-[0.2em] mb-3">
            <Landmark size={14} /> Govt Approved Skill Project
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006a4e] via-[#00a651] to-emerald-400">
              NSDA & ASSETS Project
            </span>
            <br />
            সরকারি IT প্রশিক্ষণ প্রকল্প
          </h2>
          <p className="text-slate-600 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            National Skills Development Authority (NSDA) এবং ASSETS Project-এর অধীনে আমরা দেশের তরুণ জনগোষ্ঠীকে সম্পূর্ণ বিনামূল্যে আইটি দক্ষতা উন্নয়ন প্রশিক্ষণ প্রদান করে আসছি।
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left: Stats + Features (2 Rows Layout) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-between space-y-6"
          >
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {HIGHLIGHTS.map((h, idx) => {
                  const Icon = h.icon;
                  return (
                    <div key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-[#00a651]/40 shadow-sm dark:shadow-none transition-all group overflow-visible">
                      <Icon size={22} className={`${h.color} mb-1.5 group-hover:scale-110 transition-transform`} />
                      <div 
                        className={`text-2xl md:text-3xl font-black leading-relaxed pt-1 pb-0.5 ${h.color}`} 
                        style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                      >
                        {h.value}
                      </div>
                      <div className="text-slate-600 dark:text-gray-300 text-xs font-semibold" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                        {h.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feature list in 2 Rows x 2 Columns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <CheckCircle2 size={16} className="text-[#00a651] shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-gray-200 text-xs font-medium leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <Link
                href="https://www.luminouscentree.com/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#006a4e] to-[#00a651] hover:from-[#005a40] hover:to-[#009345] text-white rounded-2xl font-black text-sm transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-green-900/30 cursor-pointer w-full sm:w-auto"
                style={{ fontFamily: 'var(--font-hind-siliguri)' }}
              >
                সরকারি প্রোগ্রামে আবেদন করুন <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Right: Govt Project Card - LIGHT background in Light Theme, DARK green in Dark Theme */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative rounded-[2rem] overflow-hidden border border-[#00a651]/30 bg-emerald-50/90 dark:bg-[#07130c] p-6 sm:p-8 shadow-xl text-slate-900 dark:text-white transition-colors duration-300">

              {/* BD flag color accent strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#006a4e] via-[#f42a41] to-[#006a4e]" />
              
              {/* Govt Badge */}
              <div className="flex items-center gap-3.5 mb-6 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-[#006a4e]/10 dark:bg-[#006a4e]/40 border border-[#00a651]/40 flex items-center justify-center shrink-0">
                  <Landmark size={26} className="text-[#006a4e] dark:text-[#00a651]" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-black text-base md:text-lg leading-tight" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                  </h3>
                  <p className="text-[#006a4e] dark:text-emerald-400 text-xs mt-0.5 font-bold">
                    People's Republic of Bangladesh
                  </p>
                </div>
              </div>

              {/* Project Details with Light Mode & Dark Mode Styling */}
              <div className="space-y-3.5">
                {[
                  { label: "কর্তৃপক্ষ", value: "NSDA — National Skills Development Authority", accent: "text-[#006a4e] dark:text-emerald-300" },
                  { label: "প্রকল্পের নাম", value: "ASSETS — Accelerating and Strengthening Skills for Economic Transformation", accent: "text-blue-700 dark:text-sky-300" },
                  { label: "মন্ত্রণালয়", value: "শিক্ষা মন্ত্রণালয় / Ministry of Education", accent: "text-purple-700 dark:text-purple-300" },
                  { label: "লক্ষ্যমাত্রা", value: "তরুণ বেকার ও দরিদ্র জনগোষ্ঠীর IT দক্ষতা উন্নয়ন (মেয়াদ: ৩ মাস)", accent: "text-amber-700 dark:text-amber-300" },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-[#00a651]/20 dark:border-white/10 space-y-1 shadow-sm dark:shadow-none"
                  >
                    <div className="text-slate-500 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className={`text-xs md:text-sm font-bold leading-relaxed ${item.accent}`} style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <div className="mt-6 p-3.5 rounded-xl bg-[#006a4e]/10 dark:bg-[#006a4e]/30 border border-[#00a651]/30">
                <p className="text-[#006a4e] dark:text-emerald-200 text-xs font-bold leading-relaxed text-center" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                  ✅ এই প্রোগ্রামে সফল অংশগ্রহণকারীরা সরকারিভাবে স্বীকৃতিপত্র (Certificate) ও ক্যারিয়ার সাপোর্ট পাবেন।
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

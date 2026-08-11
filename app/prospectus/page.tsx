"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Calendar, ShieldAlert, Award,
  MapPin, CheckCircle2, Download, Users,
  Landmark, Monitor, Wifi, Clock, Star, GraduationCap,
  Code2, Palette, Megaphone, Calculator, ChevronDown, ChevronUp,
  Phone, Mail, Globe, Building2, Target, Zap
} from "lucide-react";

const COURSES = [
  {
    tag: "Web Development",
    tagColor: "#2F2FE4",
    title: "Web Application Development (MERN Stack)",
    description: "HTML5, CSS3, Tailwind CSS, JavaScript ES6+, React.js, Next.js, Node.js, Express.js, PostgreSQL/MongoDB",
    duration: "৫ মাস",
    classes: "সপ্তাহে ৩ দিন",
    totalHours: "৭৫+ ঘন্টা",
    fee: "পেইড কোর্স",
    feeColor: "text-blue-400",
    icon: Code2,
    modules: [
      "HTML5 & CSS3 Fundamentals + Responsive Design",
      "JavaScript ES6+ & DOM Manipulation",
      "React.js & Next.js Framework",
      "Node.js, Express.js & REST API",
      "Database: PostgreSQL & MongoDB",
      "Deployment & Freelancing Guide"
    ]
  },
  {
    tag: "Graphic Design",
    tagColor: "#00a651",
    title: "Creative Graphic & UI/UX Design",
    description: "Adobe Photoshop, Adobe Illustrator, Figma, Brand Identity, Logo Design, Typography, UI Layout",
    duration: "৪ মাস",
    classes: "সপ্তাহে ২ দিন",
    totalHours: "৪৮+ ঘন্টা",
    fee: "পেইড কোর্স",
    feeColor: "text-green-400",
    icon: Palette,
    modules: [
      "Adobe Photoshop — Photo Editing & Retouching",
      "Adobe Illustrator — Vector & Logo Design",
      "Figma — UI/UX Design & Prototyping",
      "Brand Identity & Typography Mastery",
      "Social Media Content Creation",
      "Freelancing on Fiverr & Upwork"
    ]
  },
  {
    tag: "Digital Marketing",
    tagColor: "#a855f7",
    title: "Digital Marketing & Social Media Strategy",
    description: "SEO, Facebook & Google Ads, Copywriting, Social Media Branding, Web Analytics, Freelance Guide",
    duration: "৩ মাস",
    classes: "সপ্তাহে ২ দিন",
    totalHours: "৩৬+ ঘন্টা",
    fee: "পেইড কোর্স",
    feeColor: "text-purple-400",
    icon: Megaphone,
    modules: [
      "Search Engine Optimization (SEO)",
      "Facebook Ads & Meta Business Manager",
      "Google Ads & Analytics",
      "Content Writing & Copywriting",
      "Social Media Brand Strategy",
      "Affiliate & Freelance Marketing"
    ]
  },
  {
    tag: "Accounting",
    tagColor: "#eab308",
    title: "Professional Computerized Accounting",
    description: "Microsoft Excel, Tally Prime ERP, VAT & Tax, Ledger Bookkeeping, Financial Reporting",
    duration: "৩ মাস",
    classes: "সপ্তাহে ২ দিন",
    totalHours: "৩৬+ ঘন্টা",
    fee: "পেইড কোর্স",
    feeColor: "text-yellow-400",
    icon: Calculator,
    modules: [
      "Microsoft Excel — Advanced Formulas & Pivot Tables",
      "Tally Prime ERP Software",
      "VAT & Tax Calculations (BD Govt Standard)",
      "Ledger Bookkeeping & Trial Balance",
      "Payroll Management",
      "Financial Statement Preparation"
    ]
  },
  {
    tag: "সরকারি প্রকল্প",
    tagColor: "#f42a41",
    title: "NSDA / ASSETS IT Skills Training (সম্পূর্ণ বিনামূল্যে)",
    description: "NSDA-অনুমোদিত সরকারি IT দক্ষতা উন্নয়ন প্রোগ্রাম — Web Development, Graphic Design ও Digital Marketing",
    duration: "৩ মাস",
    classes: "সপ্তাহে ৩ দিন",
    totalHours: "৪৫+ ঘন্টা",
    fee: "সম্পূর্ণ বিনামূল্যে",
    feeColor: "text-red-400",
    icon: Landmark,
    modules: [
      "IT Fundamentals & Computer Basics",
      "Web Development — HTML, CSS, JavaScript",
      "Graphic Design with Photoshop & Canva",
      "Digital Marketing — SEO & Social Media",
      "Freelancing & Employment Guidance",
      "Government Certificate & Job Placement"
    ]
  }
];

const RULES = [
  { icon: ShieldAlert, color: "text-red-400", title: "উপস্থিতি (Attendance)", desc: "ল্যাবে নিয়মিত ক্লাসে ন্যূনতম ৮০% উপস্থিতি বাধ্যতামূলক। অনুপস্থিতির কারণ পূর্বে মেন্টরকে জানাতে হবে।" },
  { icon: CheckCircle2, color: "text-blue-400", title: "প্রজেক্ট সাবমিশন", desc: "প্রতিটি মডিউল শেষে নির্ধারিত সময়ের মধ্যে এসাইনমেন্ট ও প্রজেক্ট জমা দিতে হবে। এর উপর সার্টিফিকেট নির্ভর করে।" },
  { icon: Users, color: "text-purple-400", title: "ল্যাব শৃঙ্খলা", desc: "ল্যাব ব্যবহারের সময় শান্ত পরিবেশ বজায় রাখতে হবে। অন্যের পিসিতে মেন্টর অনুমতি ছাড়া হস্তক্ষেপ করা যাবে না।" },
  { icon: Calendar, color: "text-yellow-400", title: "পরীক্ষা ও মূল্যায়ন", desc: "কোর্স শেষে চূড়ান্ত ব্যবহারিক পরীক্ষা হবে। কুইজ, প্রজেক্ট ও উপস্থিতির সমষ্টিগত ফলের ওপর গ্রেড নির্ধারণ।" },
  { icon: Monitor, color: "text-green-400", title: "কম্পিউটার ব্যবহার নীতি", desc: "ল্যাবের কম্পিউটারে প্রশিক্ষণ-সংক্রান্ত কাজ ছাড়া অন্য কাজ করা নিষিদ্ধ। ব্যক্তিগত USB ব্যবহারে আগে অনুমতি নিতে হবে।" },
  { icon: Award, color: "text-orange-400", title: "সার্টিফিকেট শর্ত", desc: "চূড়ান্ত পরীক্ষায় ন্যূনতম ৬০% নম্বর এবং ৮০% উপস্থিতি থাকলে সার্টিফিকেট প্রদান করা হবে।" },
];

const FACILITIES = [
  { icon: Monitor, title: "হাই-পারফরম্যান্স ল্যাব", desc: "প্রতিটি শিক্ষার্থীর জন্য আলাদা ডেডিকেটেড কম্পিউটার ডেস্ক ও ডুয়েল মনিটর সেটআপ।" },
  { icon: Wifi, title: "হাই-স্পিড ইন্টারনেট", desc: "ফাইবার অপটিক হাই-স্পিড ইন্টারনেট সংযোগ — প্র্যাকটিস ও রিসার্চের জন্য সর্বদা উন্মুক্ত।" },
  { icon: Zap, title: "IPS ব্যাকআপ পাওয়ার", desc: "নিরবচ্ছিন্ন বিদ্যুৎ সরবরাহের জন্য সর্বাধুনিক IPS সিস্টেম — লোডশেডিংয়ে ক্লাস বন্ধ হবে না।" },
  { icon: Target, title: "১:১ মেন্টর সাপোর্ট", desc: "ক্লাসের বাইরেও ব্যক্তিগত সমস্যা সমাধানের জন্য মেন্টরদের সরাসরি সাপোর্ট।" },
  { icon: GraduationCap, title: "ক্যারিয়ার সেল", desc: "কোর্স শেষে ফ্রিল্যান্সিং, ইন্টার্নশিপ ও চাকরির সুযোগ পেতে ডেডিকেটেড ক্যারিয়ার গাইডেন্স সেল।" },
  { icon: Star, title: "প্রজেক্ট প্রেজেন্টেশন", desc: "প্রতি ব্যাচ শেষে রিয়েল ক্লায়েন্ট ও নিয়োগকর্তাদের সামনে প্রজেক্ট শোকেস ইভেন্ট।" },
];

export default function ProspectusPage() {
  const [expandedCourse, setExpandedCourse] = useState<number | null>(0);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#05060f] text-white" id="prospectus-root">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 print:hidden">
        <div className="absolute top-[5%] left-[-10%] w-[40%] h-[40%] bg-blue-600/8 rounded-full blur-[130px] animate-blob" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-purple-600/5 rounded-full blur-[130px] animate-blob animation-delay-2000" />
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10 space-y-16">

        {/* ─── 1. HEADER ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f42a41]/10 border border-[#f42a41]/30 text-[#f42a41] text-xs font-black uppercase tracking-[0.25em]">
              <Landmark size={12} /> NSDA-অনুমোদিত প্রতিষ্ঠান
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#60a5fa] text-xs font-black uppercase tracking-[0.2em]">
              LSDTC Official Prospectus — ২০২৬
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Luminous Skills Development<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
              Training Center
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            আধুনিক আইটি প্রশিক্ষণের মাধ্যমে তরুণ সমাজকে দক্ষ ও স্বাবলম্বী করে তোলার লক্ষ্যে প্রতিষ্ঠিত বাংলাদেশের একটি নির্ভরযোগ্য দক্ষতা উন্নয়ন কেন্দ্র।
          </p>

          {/* Quick Info Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: MapPin, label: "অবস্থান", value: "মোহাম্মদপুর, ঢাকা" },
              { icon: Building2, label: "প্রতিষ্ঠা সাল", value: "২০২৪" },
              { icon: Users, label: "মোট শিক্ষার্থী", value: "১৫০০+" },
              { icon: Award, label: "সাফল্যের হার", value: "৯৩%" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 text-center">
                  <Icon size={18} className="text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-black text-sm" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{item.value}</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mt-0.5">{item.label}</div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-7 py-3.5 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Download size={16} /> প্রসপেক্টাস প্রিন্ট / ডাউনলোড
            </button>
            <a
              href="https://www.luminouscentree.com/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 bg-[#00a651] hover:bg-[#008f45] text-white rounded-xl font-bold text-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <GraduationCap size={16} /> ভর্তির জন্য আবেদন করুন
            </a>
          </div>
        </motion.div>

        {/* ─── 2. MISSION / VISION / CERTIFICATION ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen, color: "blue", title: "আমাদের লক্ষ্য (Mission)",
              desc: "প্রফেশনাল আইটি ও ডিজাইন প্রশিক্ষণের মাধ্যমে তরুণ সমাজকে স্বাবলম্বী করে তোলা এবং আন্তর্জাতিক মানের দক্ষ জনশক্তি তৈরি করা।"
            },
            {
              icon: Target, color: "purple", title: "আমাদের ভিশন (Vision)",
              desc: "বাংলাদেশের সেরা NSDA-অনুমোদিত আইটি স্কিল সেন্টার হিসেবে প্রতিষ্ঠা লাভ করা, যেখানে প্র্যাকটিক্যাল শিক্ষাকে সর্বোচ্চ প্রাধান্য দেওয়া হয়।"
            },
            {
              icon: Award, color: "green", title: "সার্টিফিকেশন",
              desc: "সফলভাবে কোর্স সমাপ্তির পর প্রতিষ্ঠান সার্টিফিকেট প্রদান করা হবে। NSDA প্রকল্পের শিক্ষার্থীরা সরকারি সার্টিফিকেট পাবেন।"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-5`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ─── 3. SECTION 1: ALL COURSES (FULL LISTING) ─── */}
        <section className="bg-[#0c0e1f] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <BookOpen size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                ১. আমাদের কোর্সসমূহ (Course Syllabus & Details)
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">সব কোর্সের বিস্তারিত ও মডিউল নিচে দেওয়া হলো</p>
            </div>
          </div>

          <div className="space-y-4">
            {COURSES.map((course, idx) => {
              const Icon = course.icon;
              const isOpen = expandedCourse === idx;
              return (
                <div key={idx}
                  className="rounded-2xl bg-white/[0.02] border border-white/8 overflow-hidden hover:border-white/15 transition-all">
                  <button
                    onClick={() => setExpandedCourse(isOpen ? null : idx)}
                    className="w-full flex items-center gap-4 p-6 text-left cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${course.tagColor}20`, border: `1px solid ${course.tagColor}40` }}>
                      <Icon size={22} style={{ color: course.tagColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 text-white rounded text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: course.tagColor }}>
                          {course.tag}
                        </span>
                        <span className={`text-xs font-bold ${course.feeColor}`}>{course.fee}</span>
                      </div>
                      <h3 className="font-bold text-white text-sm md:text-base">{course.title}</h3>
                      <p className="text-gray-400 text-xs mt-1 hidden md:block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{course.description}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{course.duration}</div>
                        <div className="text-gray-500 text-[10px]">{course.totalHours}</div>
                      </div>
                      {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 border-t border-white/5 pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        {[
                          { label: "মেয়াদ", value: course.duration, icon: Clock },
                          { label: "ক্লাস", value: course.classes, icon: Calendar },
                          { label: "মোট ঘন্টা", value: course.totalHours, icon: Star },
                        ].map((info, i) => {
                          const InfoIcon = info.icon;
                          return (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                              <InfoIcon size={16} className="text-blue-400" />
                              <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{info.label}</div>
                                <div className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{info.value}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <h4 className="text-white font-bold text-sm mb-3">সিলেবাস ও মডিউল:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.modules.map((mod, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{mod}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 4. SECTION 2: RULES (নিয়মাবলী) ─── */}
        <section className="bg-[#0c0e1f] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <ShieldAlert size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                ২. শিক্ষার্থীদের নিয়মাবলী ও নির্দেশনা
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">ল্যাবে ও ক্লাসে শৃঙ্খলা বজায় রাখার নীতি</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            {RULES.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className={`shrink-0 mt-1 ${rule.color}`}><Icon size={20} /></div>
                  <div>
                    <h3 className="font-bold text-white mb-1.5 text-sm">{rule.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 5. SECTION 3: FACILITIES (সুযোগ-সুবিধা) ─── */}
        <section className="bg-[#0c0e1f] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Monitor size={20} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                ৩. প্রশিক্ষণ কেন্দ্রের সুযোগ-সুবিধাসমূহ
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">আমাদের অত্যাধুনিক ল্যাব ও সাপোর্ট সুবিধা</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            {FACILITIES.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={22} className="text-blue-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2 text-sm">{fac.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{fac.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 6. SECTION 4: ADMISSION PROCESS & QUALIFICATIONS ─── */}
        <section className="bg-[#0c0e1f] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <GraduationCap size={20} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                ৪. ভর্তি প্রক্রিয়া ও প্রয়োজনীয় যোগ্যতা
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">ভর্তির ধাপ ও শর্তসমূহ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            
            {/* Steps */}
            <div>
              <h3 className="text-white font-bold mb-5 text-base">ভর্তির ৪টি ধাপ</h3>
              <div className="space-y-4">
                {[
                  { step: "01", title: "অনলাইনে আবেদন করুন", desc: "আমাদের ওয়েবসাইটের Apply link বা অফিসে এসে আবেদন ফরম পূরণ করুন।" },
                  { step: "02", title: "কাগজপত্র জমা দিন", desc: "এসএসসি/সমমান সার্টিফিকেট, জাতীয় পরিচয়পত্র/জন্মনিবন্ধন ও ২ কপি ছবি।" },
                  { step: "03", title: "ভর্তি নিশ্চিতকরণ", desc: "আবেদন গৃহীত হলে মেসেজে জানানো হবে এবং ব্যাচের তারিখ নির্ধারণ হবে।" },
                  { step: "04", title: "ফি পরিশোধ ও ক্লাস শুরু", desc: "পেইড কোর্সের প্রথম কিস্তি পরিশোধ করুন। সরকারি প্রোগ্রামে কোনো ফি নেই।" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2F2FE4] text-white flex items-center justify-center font-black text-sm shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{s.title}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements + Contact */}
            <div className="space-y-8">
              <div>
                <h3 className="text-white font-bold mb-4 text-base">ভর্তির যোগ্যতা</h3>
                <div className="space-y-2.5">
                  {[
                    "এসএসসি বা সমমান পাশ (যেকোনো বিভাগ)",
                    "বয়স: ১৮ থেকে ৩৫ বছর (সরকারি প্রজেক্টের ক্ষেত্রে)",
                    "কম্পিউটার ব্যবহারের প্রাথমিক ধারণা",
                    "স্মার্টফোন বা পিসি (অনলাইন ব্যাচের ক্ষেত্রে)",
                    "ইন্টারনেট সংযোগ (অনলাইন ক্লাসের জন্য)",
                  ].map((req, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-xs">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f1729] border border-blue-500/20">
                <h3 className="text-white font-bold mb-4 text-base flex items-center gap-2">
                  <Phone size={16} className="text-blue-400" /> যোগাযোগ করুন
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: MapPin, label: "ঠিকানা", value: "মোহাম্মদপুর, ঢাকা-১২০৭, বাংলাদেশ" },
                    { icon: Globe, label: "ওয়েবসাইট", value: "luminouscentre.org" },
                    { icon: Mail, label: "ইমেইল", value: "info@luminouscentre.org" },
                  ].map((contact, i) => {
                    const ContactIcon = contact.icon;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <ContactIcon size={14} className="text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">{contact.label}</div>
                          <div className="text-gray-300 text-xs font-medium">{contact.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. BOTTOM CTA ─── */}
        <div className="glass rounded-[3rem] p-10 md:p-14 border-white/5 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white italic" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
              আজই আপনার আইটি ক্যারিয়ার শুরু করুন!
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
              পরবর্তী ব্যাচের তারিখ ও ভর্তির নিয়ম জানতে এখনই অনলাইনে আবেদন করুন অথবা সরাসরি আমাদের অফিসে আসুন।
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://www.luminouscentree.com/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap size={16} /> অনলাইনে আবেদন করুন
              </a>
              <a href="/contact"
                className="px-8 py-4 border border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-black text-sm transition-all cursor-pointer">
                যোগাযোগের তথ্য
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

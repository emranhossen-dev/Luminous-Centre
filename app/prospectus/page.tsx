"use client";

import React, { useState } from 'react';
import { 
  BookOpen, Calendar, ShieldAlert, Award, 
  MapPin, CheckCircle2, Download, Printer, Users, HelpCircle 
} from "lucide-react";

export default function ProspectusPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'syllabus' | 'facilities'>('rules');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Standard mock download action
    alert("Downloading LSDTC Official Prospectus PDF... (Mock Action)");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#05060f] text-white transition-colors duration-300">
      {/* Background blobs for dark mode (hidden in light mode via global CSS rules) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-purple-600/5 rounded-full blur-[130px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#60a5fa] text-xs font-bold uppercase tracking-[0.25em]">
            LSDTC Official Document
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Luminous Skill Development <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
              Training Prospectus
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
            আমাদের প্রশিক্ষণ পদ্ধতি, নিয়মাবলী, সুযোগ-সুবিধা এবং ভবিষ্যৎ ক্যারিয়ার গাইডলাইনের বিস্তারিত বিবরণী।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <Download size={16} />
              Download Prospectus PDF
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-sm transition-all transform active:scale-95"
            >
              <Printer size={16} />
              Print Page
            </button>
          </div>
        </div>

        {/* Mission, Vision & Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">আমাদের লক্ষ্য (Mission)</h3>
            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
              প্রফেশনাল আইটি ও ডিজাইন প্রশিক্ষণের মাধ্যমে তরুণ সমাজকে স্বাবলম্বী করে তোলা এবং আন্তর্জাতিক মানের দক্ষ জনশক্তিতে রূপান্তর করা।
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">আমাদের ভিশন (Vision)</h3>
            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
              বাংলাদেশের সেরা ও নির্ভরযোগ্য আইটি স্কিল সেন্টার হিসেবে প্রতিষ্ঠা লাভ করা, যেখানে প্র্যাকটিক্যাল প্রজেক্ট ও মেন্টরিং-কে সর্বোচ্চ প্রাধান্য দেওয়া হয়।
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-green-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-6">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">সার্টিফিকেশন (Certifications)</h3>
            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
              সফলভাবে কোর্স সমাপ্তির পর আমাদের একাডেমি সার্টিফিকেট প্রদান করা হবে, যা লোকাল ও আন্তর্জাতিক ক্যারিয়ার গঠনে সহায়ক।
            </p>
          </div>
        </div>

        {/* Tabbed Interactive Section */}
        <div className="bg-[#0c0e1f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
          {/* Tab Headers */}
          <div className="flex border-b border-white/10 bg-white/5 overflow-x-auto">
            {[
              { id: 'rules', label: 'নিয়ম ও আচরণবিধি' },
              { id: 'syllabus', label: 'সিলেবাস ও কোর্সসমূহ' },
              { id: 'facilities', label: 'ল্যাব ও সুযোগ-সুবিধা' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[150px] py-5 px-6 font-bold text-sm transition-all focus:outline-none cursor-pointer text-center ${
                  activeTab === tab.id 
                    ? 'bg-[#2F2FE4] text-white border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
                style={{ fontFamily: 'var(--font-bangla)' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12">
            {activeTab === 'rules' && (
              <div className="space-y-8" style={{ fontFamily: 'var(--font-bangla)' }}>
                <h3 className="text-2xl font-black text-white italic">শিক্ষার্থীদের অনুসরণীয় নিয়মাবলী</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="text-red-500 mt-1 shrink-0"><ShieldAlert size={20} /></div>
                      <div>
                        <h4 className="font-bold text-white mb-1">উপস্থিতি (Attendance)</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          ল্যাবে নিয়মিত প্র্যাকটিক্যাল ক্লাসে ৮০% উপস্থিতি বাধ্যতামূলক। কোনো কারণে উপস্থিত হতে না পারলে পূর্বে মেন্টরকে জানাতে হবে।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-blue-500 mt-1 shrink-0"><CheckCircle2 size={20} /></div>
                      <div>
                        <h4 className="font-bold text-white mb-1">প্রজেক্ট সাবমিশন (Project Submission)</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          প্রতিটি মডিউল শেষে নির্ধারিত সময়ের মধ্যে এসাইনমেন্ট এবং প্রজেক্ট সাবমিট করতে হবে। এর উপর সার্টিফিকেটের মূল্যায়ন নির্ভর করে।
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="text-[#a100c1] mt-1 shrink-0"><Users size={20} /></div>
                      <div>
                        <h4 className="font-bold text-white mb-1">ল্যাব ব্যবহার ও শৃঙ্খলতা</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          ল্যাব ব্যবহারের সময় শান্ত পরিবেশ বজায় রাখতে হবে এবং মেন্টরের অনুমতি ছাড়া ক্লাসের অন্য কারো পিসিতে হস্তক্ষেপ করা যাবে না।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-yellow-500 mt-1 shrink-0"><Calendar size={20} /></div>
                      <div>
                        <h4 className="font-bold text-white mb-1">পরীক্ষা ও মূল্যায়ন</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          কোর্স শেষে চূড়ান্ত ব্যবহারিক পরীক্ষা অনুষ্ঠিত হবে। কুইজ ও প্রজেক্টের সমষ্টিক ফলের ওপর গ্রেড নির্ধারণ করা হবে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div className="space-y-8" style={{ fontFamily: 'var(--font-bangla)' }}>
                <h3 className="text-2xl font-black text-white italic">আমাদের বিশেষায়িত ক্যারিয়ার ট্র্যাকস</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">Web Development</span>
                    <h4 className="font-bold text-lg text-white mb-2">Web Application Development (MERN Stack)</h4>
                    <p className="text-gray-400 text-sm mb-4">HTML5, CSS3, Tailwind CSS, Javascript ES6, React.js, Next.js, Node.js, Express, and PostgreSQL/MongoDB.</p>
                    <ul className="text-xs text-gray-500 space-y-2">
                      <li>• মেয়াদ: ৫ মাস (সপ্তাহে ৩ দিন)</li>
                      <li>• মোট ক্লাস: ৬০+ ঘন্টা</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <span className="px-3 py-1 bg-[#00a651] text-white rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">Graphic Design</span>
                    <h4 className="font-bold text-lg text-white mb-2">Creative Graphic & UI/UX Design</h4>
                    <p className="text-gray-400 text-sm mb-4">Adobe Photoshop, Adobe Illustrator, Figma, Brand Identity Design, UI elements layout, Typography, and Logo design.</p>
                    <ul className="text-xs text-gray-500 space-y-2">
                      <li>• মেয়াদ: ৪ মাস (সপ্তাহে ২ দিন)</li>
                      <li>• মোট ক্লাস: ৪৮+ ঘন্টা</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <span className="px-3 py-1 bg-[#a100c1] text-white rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">Digital Marketing</span>
                    <h4 className="font-bold text-lg text-white mb-2">Digital Marketing & Social Media Strategy</h4>
                    <p className="text-gray-400 text-sm mb-4">SEO Optimization, Facebook & Google Ads Campaigns, Copywriting, Social Media Branding, Web Analytics and Freelance Guide.</p>
                    <ul className="text-xs text-gray-500 space-y-2">
                      <li>• মেয়াদ: ৩ মাস (সপ্তাহে ২ দিন)</li>
                      <li>• মোট ক্লাস: ৩৬+ ঘন্টা</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <span className="px-3 py-1 bg-yellow-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">Finance & Accounting</span>
                    <h4 className="font-bold text-lg text-white mb-2">Professional Computerized Accounting</h4>
                    <p className="text-gray-400 text-sm mb-4">Microsoft Excel Mastery, Tally Prime ERP, Accounting Principles, VAT & Tax Calculations, and Ledger Bookkeeping.</p>
                    <ul className="text-xs text-gray-500 space-y-2">
                      <li>• মেয়াদ: ৩ মাস (সপ্তাহে ২ দিন)</li>
                      <li>• মোট ক্লাস: ৩৬+ ঘন্টা</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="space-y-8" style={{ fontFamily: 'var(--font-bangla)' }}>
                <h3 className="text-2xl font-black text-white italic">প্রশিক্ষণ কেন্দ্রের অত্যাধুনিক সুযোগ-সুবিধা</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all bg-white/[0.01]">
                    <h4 className="font-bold text-white mb-2 text-md">হাই-টেক ল্যাব ও ব্যাকআপ পাওয়ার</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      প্রতিটি শিক্ষার্থীর জন্য রয়েছে আলাদা হাই-পারফরম্যান্স পিসি এবং নিরবচ্ছিন্ন বিদ্যুৎ ব্যাকআপের জন্য আইপিএস সিস্টেম।
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all bg-white/[0.01]">
                    <h4 className="font-bold text-white mb-2 text-md">লাইভ মেন্টরিং ও অফলাইন ল্যাব প্র্যাকটিস</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      ক্লাসের বাইরেও আমাদের ল্যাবে মেন্টরদের তত্ত্বাবধানে প্র্যাকটিস করার ও প্রজেক্ট সংক্রান্ত জিজ্ঞাসা সমাধানের সার্বক্ষণিক সুবিধা।
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all bg-white/[0.01]">
                    <h4 className="font-bold text-white mb-2 text-md">চাকরি ও ফ্রিল্যান্সিং গাইডলাইন সেল</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      সফল শিক্ষার্থীদের জন্য আমাদের রয়েছে ডেডিকেটেড ক্যারিয়ার সেল, যা ফ্রিল্যান্সিং ক্যারিয়ার ও ইন্টার্নশিপ প্রাপ্তিতে সহযোগিতা করে।
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action Section inside Prospectus */}
        <div className="glass rounded-[3rem] p-10 md:p-16 border-white/5 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white italic">
              Illuminate Your Journey With Us!
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto" style={{ fontFamily: 'var(--font-bangla)' }}>
              ভর্তির নিয়মাবলী এবং পরবর্তী ব্যাচের শুরু হওয়ার তারিখ জানতে এখনই যোগাযোগ করুন অথবা সরাসরি ফ্রি সেমিনারে অংশ নিন।
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="/apply"
                className="px-6 py-3 bg-[#00a651] hover:bg-[#008f45] text-white rounded-xl font-black text-xs md:text-sm transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                Apply Online
              </a>
              <a 
                href="/about"
                className="px-6 py-3 border border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl font-black text-xs md:text-sm transition-all"
              >
                Know More About Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

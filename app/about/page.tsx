"use client";

import React from 'react';
import Image from 'next/image';
import { 
  Award, BookOpen, Users, Milestone, Target, Compass, 
  MapPin, CheckCircle2, Heart, Shield 
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Students Trained", value: "1,500+" },
    { label: "Success Rate", value: "93%" },
    { label: "Courses Available", value: "12+" },
    { label: "Expert Mentors", value: "10+" }
  ];

  const milestones = [
    { year: "2024", title: "LSDTC Founded", desc: "Started with a single computer lab and 2 basic IT training courses to support local youths." },
    { year: "2025", title: "Lab Expansion & Hybrid Model", desc: "Expanded to 3 modern coding labs and launched hybrid model online live classes." },
    { year: "2026", title: "Govt Free Projects Partnership", desc: "Collaborated on government projects to train and certify hundreds of students for free." }
  ];

  const pillars = [
    {
      icon: Target,
      title: "Quality Over Quantity",
      desc: "আমরা প্রতিটি ব্যাচে সীমিত সংখ্যক আসন রাখি যাতে প্রত্যেক শিক্ষার্থী মেন্টরের কাছ থেকে সরাসরি ১:১ গাইডলাইন পায়।"
    },
    {
      icon: Compass,
      title: "Project-Oriented Learning",
      desc: "শুধুমাত্র থিওরি নয়, আমরা বাস্তবভিত্তিক রিয়েল-ওয়ার্ল্ড প্রজেক্ট দিয়ে কাজ শেখাই, যা মার্কেটপ্লেসে সরাসরি কাজে লাগে।"
    },
    {
      icon: Heart,
      title: "Lifelong Support",
      desc: "কোর্স সমাপ্তির পরেও আমাদের শিক্ষার্থীদের জন্য রয়েছে আজীবন মেন্টরশিপ সাপোর্ট এবং ফ্রিল্যান্সিং ক্যারিয়ার হেল্প।"
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#05060f] text-white transition-colors duration-300">
      {/* Background Blobs (controlled via classes/selectors in globals.css) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-15%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[130px] animate-blob"></div>
        <div className="absolute top-[40%] right-[-10%] w-[35%] h-[35%] bg-indigo-600/5 rounded-full blur-[110px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[10%] left-1/3 w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#60a5fa] text-xs font-bold uppercase tracking-[0.2em]">
            About Our Institute
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Empowering Minds, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
              Building Tech Careers
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
            লুমিনাস স্কিল ডেভেলপমেন্ট ট্রেনিং সেন্টার শিক্ষার্থীদের প্রযুক্তির সঠিক শিক্ষায় শিক্ষিত করে আত্মনির্ভরশীল ক্যারিয়ার গঠনে সাহায্য করে।
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-[#0c0e1f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 mb-20 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#60a5fa]">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission, Vision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Shaping the Next Generation of <br />
              <span className="text-[#60a5fa] italic font-black">Digital Innovators</span>
            </h2>
            <div className="h-px bg-white/10 w-24"></div>
            
            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
              লুমিনাস স্কিল ডেভেলপমেন্ট ট্রেনিং সেন্টার (LSDTC) একটি প্রতিশ্রুতিবদ্ধ প্রতিষ্ঠান যা তথ্যপ্রযুক্তির বিভিন্ন ক্ষেত্রে যুগোপযোগী প্রশিক্ষণ প্রদান করে। আমরা বিশ্বাস করি সঠিক দক্ষতা অর্জনের মাধ্যমে একজন শিক্ষার্থী কেবল চাকরিপ্রার্থী নয়, বরং সম্পদ সৃষ্টিতে অবদান রাখতে পারে।
            </p>
            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
              আমাদের অভিজ্ঞ মেন্টরগণ শিক্ষার্থীদের তত্ত্বীয় শিক্ষার পাশাপাশি রিয়েল-টাইম ক্লায়েন্ট প্রজেক্টের কাজের সুযোগ করে দেন। যার ফলে তারা জাতীয় ও আন্তর্জাতিক বাজারে প্রতিযোগিতায় সফল হতে পারে।
            </p>
          </div>

          <div className="relative aspect-[16/10] w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0c0e1f] shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80" 
              alt="Lab training" 
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>

        {/* Timeline / Milestones */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black italic mb-4">Our Historical Timeline</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto" style={{ fontFamily: 'var(--font-bangla)' }}>
              প্রতিষ্ঠা লাভ থেকে শুরু করে আজকের সাফল্যের অবস্থানে আসার গল্প।
            </p>
            <div className="h-px w-24 bg-blue-600 mx-auto opacity-30 mt-4"></div>
          </div>

          <div className="relative border-l border-white/10 md:mx-auto max-w-3xl pl-8 space-y-12">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative">
                {/* Year Badge */}
                <div className="absolute -left-[53px] top-1 w-10 h-10 rounded-full bg-[#2F2FE4] border-4 border-[#05060f] flex items-center justify-center text-[10px] font-black text-white">
                  {m.year}
                </div>
                
                <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                  <h3 className="text-lg font-bold text-white">{m.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Pillars */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black italic mb-4">Core Principles</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto" style={{ fontFamily: 'var(--font-bangla)' }}>
              যে ৩টি স্তম্ভের ওপর আমাদের শিক্ষা পদ্ধতি পরিচালিত হয়।
            </p>
            <div className="h-px w-24 bg-blue-600 mx-auto opacity-30 mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="glass p-8 rounded-3xl border border-white/5 text-center space-y-6 hover:border-blue-500/30 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Infrastructure Highlights */}
        <div className="glass rounded-[3.5rem] p-8 md:p-16 border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[16/10] w-full rounded-[2rem] overflow-hidden border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80" 
              alt="Campus" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6" style={{ fontFamily: 'var(--font-bangla)' }}>
            <h3 className="text-2xl md:text-3xl font-black text-white italic">আমাদের উন্নত পরিবেশ ও সুবিধা</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              মোহাম্মদপুরের প্রাণকেন্দ্রে অবস্থিত আমাদের ট্রেনিং সেন্টারটি অত্যন্ত পরিষ্কার, কোলাহলমুক্ত এবং আধুনিক উপকরণে সজ্জিত। রয়েছে উন্নত ল্যাব সুবিধা এবং গ্রুপ ডিসকাশনের জন্য খোলামেলা স্পেস।
            </p>
            
            <ul className="space-y-3.5">
              {[
                "প্রতিটি শিক্ষার্থীর জন্য সম্পূর্ণ আলাদা ও ডেডিকেটেড কম্পিউটার ডেস্ক।",
                "হাই-স্পিড ওয়াই-ফাই ইন্টারনেট সংযোগ ল্যাবের কাজের জন্য।",
                "প্রজেক্টর দিয়ে প্রতিটি ক্লাসের প্রজেক্ট প্রেজেন্টেশন এবং প্র্যাকটিস সেশন।",
                "অফলাইন প্র্যাকটিস ক্লাসের জন্য ল্যাব রুম সারাদিন উন্মুক্ত রাখার সুবিধা।"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

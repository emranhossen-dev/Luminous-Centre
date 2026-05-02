"use client";

import React from "react";
import { 
  Video, 
  Users, 
  MonitorPlay, 
  MapPin, 
  Landmark, 
  Calendar, 
  Clock, 
  ArrowRight,
  PlayCircle
} from "lucide-react";

const CATEGORIES = [
  {
    title: "রেকর্ডড কোর্স",
    desc: "আপনার সুবিধামতো সময়ে শিখুন সেরা সব ভিডিও লেসনের মাধ্যমে।",
    students: "২,৫০০+",
    duration: "লাইফটাইম এক্সেস",
    batch: "২৪/৭ এভেইলেবল",
    ends: "নাই",
    videos: "৩০+",
    icon: Video,
    color: "#2e31e1",
    isGovt: false,
  },
  {
    title: "অনলাইন ব্যাচ",
    desc: "মেন্টরদের সাথে সরাসরি লাইভ ক্লাসে অংশ নিয়ে শিখুন।",
    students: "১,৮০০+",
    duration: "৩-৬ মাস",
    batch: "ব্যাচ ১৪",
    ends: "১০ মে, ২০২৬",
    videos: "৫০+",
    icon: MonitorPlay,
    color: "#60a5fa",
    isGovt: false,
  },
  {
    title: "অফলাইন ব্যাচ",
    desc: "সরাসরি ল্যাবে বসে হাতে-কলমে প্রজেক্ট ভিত্তিক শিক্ষা।",
    students: "১,২০০+",
    duration: "৪ মাস",
    batch: "ব্যাচ ০৮",
    ends: "১৫ মে, ২০২৬",
    videos: "২০+",
    icon: MapPin,
    color: "#006a4e",
    isGovt: false,
  },
  {
    title: "সরকারি প্রজেক্ট",
    desc: "সরকারি অর্থায়নে পরিচালিত বিশেষ আইটি প্রশিক্ষণ প্রোগ্রাম।",
    students: "৮০০+",
    duration: "৬ মাস",
    batch: "ব্যাচ ০৩",
    ends: "০৫ মে, ২০২৬",
    videos: "৪০+",
    icon: Landmark,
    color: "#f42a41",
    isGovt: true,
  }
];

export default function CategorySection() {
  return (
    <section className="py-24 bg-[#0b0c17] relative">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Area */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white">
            ক্যাটাগরি <span className="text-gradient">এক্সপ্লোর করুন</span>
          </h2>
          <p className="text-white/50 font-medium text-lg">আপনার ক্যারিয়ার গড়ার সঠিক পথটি বেছে নিন</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((item, idx) => (
            <div key={idx} className="glass group rounded-[2rem] p-8 border-white/5 flex flex-col transition-all hover:-translate-y-2 hover:border-white/10">
              
              {/* Top Icon */}
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
              >
                <item.icon style={{ color: item.color }} size={28} />
              </div>

              {/* Info */}
              <h3 className="text-2xl font-black text-white mb-3">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed font-medium mb-6 flex-grow">
                {item.desc}
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 text-white/30 uppercase font-bold tracking-wider">
                    <Users size={14} /> সম্পন্নকারী
                  </span>
                  <span className="text-white font-black">{item.students}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 text-white/30 uppercase font-bold tracking-wider">
                    <Clock size={14} /> সময়কাল
                  </span>
                  <span className="text-white font-black">{item.duration}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 text-white/30 uppercase font-bold tracking-wider">
                    <Calendar size={14} /> বর্তমান ব্যাচ
                  </span>
                  <span className="text-white font-black">{item.batch}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#f42a41] uppercase font-bold tracking-wider">ভর্তির শেষ তারিখ</span>
                  <span className="text-white font-black">{item.ends}</span>
                </div>
              </div>

              {/* Videos Badge */}
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold mb-8 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                <PlayCircle size={14} className="text-[#60a5fa]" />
                {item.videos} ভিডিও লেসন
              </div>

              {/* Action Button */}
              {item.isGovt ? (
                <button className="w-full py-4 rounded-xl bg-[#f42a41] text-white font-black hover:bg-[#d9263a] transition-colors flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(244,42,65,0.2)]">
                  আবেদন করুন <ArrowRight size={18} />
                </button>
              ) : (
                <button className="w-full py-4 rounded-xl border border-white/10 bg-white/5 text-white font-black hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  বিস্তারিত দেখুন <ArrowRight size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
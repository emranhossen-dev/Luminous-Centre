"use client";

import React from "react";
import { 
  Code2, 
  Palette, 
  Zap, 
  Atom, 
  Wind, 
  Flame, 
  Server, 
  Database, 
  Cpu, 
  CloudUpload, 
  GitGraph,
  Layers // DaisyUI এর জন্য একটি আইকন
} from "lucide-react";

const SKILLS = [
  {
    name: "HTML5",
    desc: "ওয়েবসাইটের মূল কাঠামো বা কঙ্কাল তৈরির জন্য ব্যবহৃত হয়।",
    usage: "যেকোনো ওয়েবসাইটের কন্টেন্ট এবং স্ট্রাকচার তৈরি করতে পারবেন।",
    icon: Code2,
    color: "#E34F26"
  },
  {
    name: "CSS3",
    desc: "ওয়েবসাইটকে সুন্দর এবং আকর্ষণীয় ডিজাইন দেওয়ার জন্য ব্যবহৃত হয়।",
    usage: "রেসপনসিভ লেআউট, কালার এবং এনিমেশন যুক্ত করতে পারবেন।",
    icon: Palette,
    color: "#1572B6"
  },
  {
    name: "JavaScript",
    desc: "ওয়েবসাইটে ইন্টারঅ্যাক্টিভিটি এবং লজিক যুক্ত করার প্রধান ভাষা।",
    usage: "ডাইনামিক কন্টেন্ট এবং ইউজারের সাথে যোগাযোগ তৈরি করতে পারবেন।",
    icon: Zap,
    color: "#F7DF1E"
  },
  {
    name: "React.js",
    desc: "আধুনিক ওয়েব অ্যাপ তৈরির জন্য জনপ্রিয় জাভাস্ক্রিপ্ট লাইব্রেরি।",
    usage: "অত্যন্ত দ্রুত এবং প্রফেশনাল সিঙ্গেল পেজ অ্যাপ্লিকেশন তৈরি করতে পারবেন।",
    icon: Atom,
    color: "#61DAFB"
  },
  {
    name: "Tailwind CSS",
    desc: "ইউটিলিটি-ফার্স্ট সিএসএস ফ্রেমওয়ার্ক যা ডিজাইন দ্রুত করে।",
    usage: "খুব অল্প সময়ে কাস্টম এবং মডার্ন ইউজার ইন্টারফেস ডিজাইন করতে পারবেন।",
    icon: Wind,
    color: "#06B6D4"
  },
  // --- নতুন DaisyUI কার্ড ---
  {
    name: "DaisyUI",
    desc: "Tailwind CSS এর উপর ভিত্তি করে তৈরি একটি জনপ্রিয় কম্পোনেন্ট লাইব্রেরি।",
    usage: "তৈরি করা বাটন, কার্ড এবং মোডাল ব্যবহার করে দ্রুত UI ডেভেলপ করতে পারবেন।",
    icon: Layers,
    color: "#5AD7E4"
  },
  {
    name: "Firebase",
    desc: "গুগলের ব্যাকএন্ড সার্ভিস যা অথেন্টিকেশন এবং ডাটাবেস প্রদান করে।",
    usage: "সহজেই লগইন সিস্টেম এবং রিয়েল-টাইম ডাটা ম্যানেজ করতে পারবেন।",
    icon: Flame,
    color: "#FFCA28"
  },
  {
    name: "Express.js",
    desc: "নোড জেএস-এর জন্য একটি ফ্লেক্সিবল ওয়েব অ্যাপ্লিকেশন ফ্রেমওয়ার্ক।",
    usage: "ওয়েবসাইটের জন্য শক্তিশালী সার্ভার এবং API তৈরি করতে পারবেন।",
    icon: Server,
    color: "#ffffff"
  },
  {
    name: "MongoDB",
    desc: "একটি জনপ্রিয় NoSQL ডাটাবেস যা ডাটা স্টোর করতে ব্যবহৃত হয়।",
    usage: "বিশাল পরিমাণ ডাটা খুব সহজেই অর্গানাইজ এবং হ্যান্ডেল করতে পারবেন।",
    icon: Database,
    color: "#47A248"
  },
  {
    name: "Node.js",
    desc: "জাভাস্যক্রিপ্ট রানটাইম যা সার্ভার সাইড কোড চালাতে সাহায্য করে।",
    usage: "জাভাস্ক্রিপ্ট দিয়েই ফুল-স্ট্যাক এপ্লিকেশন তৈরি করতে পারবেন।",
    icon: Cpu,
    color: "#339933"
  },
  {
    name: "Vercel",
    desc: "ফ্রন্টএন্ড হোস্ট করার জন্য বিশ্বের সেরা ক্লাউড প্ল্যাটফর্ম।",
    usage: "আপনার প্রজেক্ট মাত্র এক ক্লিকে লাইভ বা পাবলিশ করতে পারবেন।",
    icon: CloudUpload,
    color: "#ffffff"
  },
  {
    name: "GitHub",
    desc: "কোড ম্যানেজমেন্ট এবং কোলাবরেশনের জন্য ভার্সন কন্ট্রোল সিস্টেম।",
    usage: "টিম নিয়ে কাজ করা এবং আপনার কোড সুরক্ষিত রাখতে পারবেন।",
    icon: GitGraph,
    color: "#ffffff"
  }
];

export default function SkillsSection() {
  return (
    <section className="py-24 bg-[#0b0c17] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white">
            আমরা যা <span className="text-gradient">শিখবো</span>
          </h2>
          <p className="text-white/50 font-medium text-lg max-w-2xl mx-auto">
            ইন্ডাস্ট্রি স্ট্যান্ডার্ড টেকনোলজি শিখে নিজেকে একজন দক্ষ ফুল-স্ট্যাক ডেভেলপার হিসেবে গড়ে তুলুন।
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SKILLS.map((skill, idx) => (
            <div 
              key={idx} 
              className="glass p-8 rounded-2xl transition-transform duration-300 ease-out hover:scale-105 cursor-default flex flex-col h-full border border-white/5 shadow-lg"
            >
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 border border-white/10">
                <skill.icon style={{ color: skill.color }} size={24} />
              </div>
              
              <h3 className="text-xl font-black text-white mb-3">{skill.name}</h3>
              
              <div className="space-y-4 flex-grow">
                <p className="text-sm text-white/50 leading-relaxed font-medium">
                  {skill.desc}
                </p>
                
                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase text-[#60a5fa] tracking-widest block mb-2">কি করতে পারবেন:</span>
                  <p className="text-xs text-white/70 leading-relaxed font-semibold">
                    {skill.usage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
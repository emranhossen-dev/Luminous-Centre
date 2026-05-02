"use client";

import React from "react";
import { Users, GraduationCap, Award, CheckCircle2 } from "lucide-react";

const STATS = [
  { label: "সফল শিক্ষার্থী", value: "৮০,০০০+", icon: Users },
  { label: "মেন্টর সংখ্যা", value: "৬০+", icon: GraduationCap },
  { label: "সন্তুষ্টির হার", value: "৯০%", icon: CheckCircle2 },
  { label: "পুরস্কার", value: "১৫+", icon: Award },
];

export default function AboutSection() {
  return (
    <section className="py-24 bg-[#0b0c17] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          
          {/* --- LEFT SIDE: Image & Stats --- */}
          <div className="flex flex-col justify-between space-y-10">
            {/* Institute Image */}
            <div className="relative group flex-grow">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2e31e1] to-[#60a5fa] rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative h-full min-h-[300px] rounded-[2rem] overflow-hidden border border-white/10 bg-[#0b0c17]">
                <img 
                  src="https://i.ibb.co/sp2vGsP9/Gemini-Generated-Image-62pq3q62pq3q62pq.png" 
                  alt="Our Institute"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Statistics below the image */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((stat, idx) => (
                <div key={idx} className="glass p-5 rounded-2xl border-white/5 flex flex-col items-center text-center">
                  <stat.icon className="text-[#60a5fa] mb-3" size={20} />
                  <h4 className="text-xl font-black text-white mb-1">{stat.value}</h4>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT SIDE: Content --- */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              {/* Smaller Heading to fit two lines */}
              <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.2] tracking-tight">
                আমরা প্রদান করছি <br />
                <span className="text-gradient">অনলাইন ও অফলাইন</span> কোর্স
              </h2>
              <p className="text-lg text-white/50 leading-relaxed max-w-xl font-medium">
                বাংলাদেশের শীর্ষস্থানীয় আইটি কোর্সের মাধ্যমে আপনার ক্যারিয়ারকে এগিয়ে নিন। আমরা ফ্লেক্সিবল লার্নিং সিস্টেমের মাধ্যমে দক্ষ মেন্টরদের তত্ত্বাবধানে মানসম্মত শিক্ষা নিশ্চিত করি।
              </p>
            </div>

            {/* Course Cards - Icons Removed */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#2e31e1]/30 transition-all group">
                <h5 className="text-xl font-black text-white mb-3">অনলাইন কোর্স</h5>
                <p className="text-sm text-white/40 leading-relaxed font-medium">
                  দেশের যেকোনো প্রান্ত থেকে ঘরে বসেই শিখুন আধুনিক সব প্রযুক্তি।
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#2e31e1]/30 transition-all group">
                <h5 className="text-xl font-black text-white mb-3">অফলাইন কোর্স</h5>
                <p className="text-sm text-white/40 leading-relaxed font-medium">
                  আমাদের ল্যাবে সরাসরি বসে মেন্টরদের উপস্থিতিতে হাতে-কলমে শিখুন।
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2e31e1]/5 blur-[150px] rounded-full -z-10"></div>
    </section>
  );
}
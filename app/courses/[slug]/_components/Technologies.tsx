"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, Globe, Database, Cpu, Layout, Server } from "lucide-react";

interface Tech {
  name: string;
  description: string;
  icon: any;
  color: string;
}

const TECH_LIST: Tech[] = [
  { 
    name: "React.js", 
    description: "React.js হল একটি জনপ্রিয় JavaScript লাইব্রেরি যা ইন্টারেক্টিভ UI তৈরি করতে ব্যবহৃত হয়। এটি দিয়ে আপনি ডায়নামিক ওয়েব অ্যাপ্লিকেশন তৈরি করতে পারবেন।", 
    icon: Layout, 
    color: "text-blue-400" 
  },
  { 
    name: "Node.js", 
    description: "Node.js দিয়ে JavaScript দিয়ে সার্ভার-সাইড অ্যাপ্লিকেশন তৈরি করা যায়। এটি ব্যবহার করে আপনি স্কেলেবল ব্যাকএন্ড সিস্টেম ডেভেলপ করতে পারবেন।", 
    icon: Server, 
    color: "text-green-400" 
  },
  { 
    name: "MongoDB", 
    description: "MongoDB একটি NoSQL ডাটাবেস যা ফ্লেক্সিবল ডাটা স্টোরেজের জন্য ব্যবহৃত হয়। এটি দিয়ে আপনি বড় আকারের অ্যাপ্লিকেশনের জন্য ডাটাবেস ম্যানেজ করতে পারবেন।", 
    icon: Database, 
    color: "text-emerald-500" 
  },
  { 
    name: "Express.js", 
    description: "Express.js Node.js এর জন্য একটি মিনিমালিস্ট ওয়েব ফ্রেমওয়ার্ক। এটি দিয়ে আপনি সহজেই REST API এবং ওয়েব সার্ভিস তৈরি করতে পারবেন।", 
    icon: Globe, 
    color: "text-gray-400" 
  },
  { 
    name: "TypeScript", 
    description: "TypeScript JavaScript এর সুপারসেট যা স্ট্যাটিক টাইপিং প্রদান করে। এটি ব্যবহার করলে আপনি এরর-ফ্রি কোড লিখতে পারবেন।", 
    icon: Code2, 
    color: "text-blue-600" 
  },
  { 
    name: "Next.js", 
    description: "Next.js React এর জন্য একটি ফুল-স্ট্যাক ফ্রেমওয়ার্ক। এটি দিয়ে আপনি সার্ভার-সাইড রেন্ডারিং এবং স্ট্যাটিক সাইট তৈরি করতে পারবেন।", 
    icon: Cpu, 
    color: "text-white" 
  },
  { 
    name: "Tailwind CSS", 
    description: "Tailwind CSS একটি ইউটিলিটি-ফার্স্ট CSS ফ্রেমওয়ার্ক। এটি দিয়ে আপনি দ্রুত এবং রেসপন্সিভ ডিজাইন তৈরি করতে পারবেন।", 
    icon: Globe, 
    color: "text-cyan-400" 
  },
  { 
    name: "Git & GitHub", 
    description: "Git একটি ভার্শন কন্ট্রোল সিস্টেম এবং GitHub একটি কোড হোস্টিং প্ল্যাটফর্ম। এগুলো দিয়ে আপনি টিমের সাথে কাজ করতে পারবেন।", 
    icon: Code2, 
    color: "text-orange-400" 
  },
  { 
    name: "Redux", 
    description: "Redux React অ্যাপ্লিকেশনের জন্য একটি স্টেট ম্যানেজমেন্ট লাইব্রেরি। এটি দিয়ে আপনি কমপ্লেক্স অ্যাপ্লিকেশনের স্টেট ম্যানেজ করতে পারবেন।", 
    icon: Server, 
    color: "text-purple-400" 
  },
];

export default function Technologies() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2F2FE4] rounded-full mix-blend-screen filter blur-[180px] opacity-5 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white italic">
            Technologies <span className="text-gradient-blue">We Master</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium">
            Industry-standard tools and frameworks you will learn to build professional applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TECH_LIST.map((tech, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-[#2F2FE4]/30 transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform ${tech.color}`}>
                <tech.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 italic tracking-tight">{tech.name}</h3>
              <p className="text-gray-500 font-medium leading-relaxed" style={{ fontFamily: "var(--font-bangla)" }}>
                {tech.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

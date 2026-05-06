"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Image from "next/image";

const FEEDBACKS = [
  {
    name: "Tanvir Ahmed",
    role: "MERN Stack Developer",
    comment: "লুমিনাস স্কিল সেন্টারের কারিকুলাম এবং সাপোর্ট সত্যিই অসাধারন। আমি এখন একটি আইটি ফার্মে সফলভাবে কাজ করছি।",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=tanvir"
  },
  {
    name: "Sumiya Akter",
    role: "Full Stack Student",
    comment: "তাদের হাতে কলমে শেখানোর পদ্ধতি অনেক ইউনিক। বিশেষ করে প্রজেক্ট বেসড লার্নিং আমাকে অনেক কনফিডেন্স দিয়েছে।",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=sumiya"
  },
  {
    name: "Rakib Hossain",
    role: "Freelance Developer",
    comment: "মার্কেটপ্লেস গাইডলাইন এবং ইন্টারভিউ প্রিপারেশন সেশনগুলো আমার জন্য গেম চেঞ্জার ছিল। ধন্যবাদ লুমিনাস!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=rakib"
  }
];

export default function StudentFeedback() {
  return (
    <section className="py-24 bg-[#080616]/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white italic">
            Student <span className="text-[#60a5fa]">Feedback</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium" style={{ fontFamily: "var(--font-bangla)" }}>
            আমাদের সফল শিক্ষার্থীদের অভিজ্ঞতা শুনুন এবং আপনার ক্যারিয়ার গড়ার সিদ্ধান্ত নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEEDBACKS.map((feedback, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass p-8 rounded-[2.5rem] border-white/5 relative group hover:border-[#2F2FE4]/30 transition-all"
            >
              <div className="absolute top-8 right-8 text-[#2F2FE4]/20 group-hover:text-[#2F2FE4]/40 transition-colors">
                <Quote size={40} fill="currentColor" />
              </div>

              <div className="flex gap-1 mb-6">
                {Array.from({ length: feedback.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              <p className="text-gray-300 text-lg font-medium leading-relaxed mb-8 italic" style={{ fontFamily: "var(--font-bangla)" }}>
                "{feedback.comment}"
              </p>

              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#2F2FE4]/30">
                  <Image
                    src={feedback.avatar}
                    alt={feedback.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-black italic">{feedback.name}</h4>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{feedback.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

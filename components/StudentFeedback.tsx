"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatar_url: string;
}

const DEFAULT_FEEDBACKS: Testimonial[] = [
  {
    id: 'f1',
    name: "Tanvir Ahmed",
    role: "MERN Stack Developer",
    comment: "লুমিনাস স্কিল সেন্টারের কারিকুলাম এবং সাপোর্ট সত্যিই অসাধারন। আমি এখন একটি আইটি ফার্মে সফলভাবে কাজ করছি।",
    rating: 5,
    avatar_url: "https://i.pravatar.cc/150?u=tanvir"
  },
  {
    id: 'f2',
    name: "Sumiya Akter",
    role: "Full Stack Student",
    comment: "তাদের হাতে কলমে শেখানোর পদ্ধতি অনেক ইউনিক। বিশেষ করে প্রজেক্ট বেসড লার্নিং আমাকে অনেক কনফিডেন্স দিয়েছে।",
    rating: 5,
    avatar_url: "https://i.pravatar.cc/150?u=sumiya"
  },
  {
    id: 'f3',
    name: "Rakib Hossain",
    role: "Freelance Developer",
    comment: "মার্কেটপ্লেস গাইডলাইন এবং ইন্টারভিউ প্রিপারেশন সেশনগুলো আমার জন্য গেম চেঞ্জার ছিল। ধন্যবাদ লুমিনাস!",
    rating: 5,
    avatar_url: "https://i.pravatar.cc/150?u=rakib"
  }
];

export default function StudentFeedback() {
  const [feedbacks, setFeedbacks] = useState<Testimonial[]>(DEFAULT_FEEDBACKS);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setFeedbacks(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const displayFeedbacks = feedbacks.length > 0 ? feedbacks : DEFAULT_FEEDBACKS;

  return (
    <section className="relative w-full overflow-hidden py-10 lg:py-14">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c17] via-[#080616] to-[#05060f] z-0"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 w-full h-full overflow-hidden z-0 pointer-events-none -translate-y-1/2">
        <div className="absolute top-1/2 left-[-5%] w-[30%] h-[30%] bg-blue-600/12 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[25%] h-[25%] bg-purple-600/10 rounded-full blur-[90px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-indigo-600/12 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl md:text-4xl font-black text-white italic">
            Student <span className="text-[#60a5fa]">Feedback</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto font-medium" style={{ fontFamily: "var(--font-hind-siliguri)" }}>
            আমাদের সফল শিক্ষার্থীদের অভিজ্ঞতা শুনুন এবং আপনার ক্যারিয়ার গড়ার সিদ্ধান্ত নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayFeedbacks.map((feedback, idx) => (
            <motion.div
              key={feedback.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glass p-6 md:p-8 rounded-[2rem] border-white/5 relative group hover:border-[#2F2FE4]/30 transition-all flex flex-col justify-between"
            >
              <div className="absolute top-6 right-6 text-[#2F2FE4]/20 group-hover:text-[#2F2FE4]/40 transition-colors">
                <Quote size={32} fill="currentColor" />
              </div>

              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: feedback.rating || 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed mb-6 italic" style={{ fontFamily: "var(--font-hind-siliguri)" }}>
                  "{feedback.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#2F2FE4]/30 shrink-0">
                  <img
                    src={feedback.avatar_url || "https://i.pravatar.cc/150"}
                    alt={feedback.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm italic">{feedback.name}</h3>
                  <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">{feedback.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

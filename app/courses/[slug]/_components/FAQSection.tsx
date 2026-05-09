"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

const FAQS = [
  {
    question: "কোর্সটি করার জন্য কি কি জানা লাগবে?",
    answer: "এই কোর্সটি একদম বিগিনার থেকে শুরু করা হয়েছে। তবে বেসিক কম্পিউটার চালানো এবং ইন্টারনেট ব্যবহারের জ্ঞান থাকলে ভালো।"
  },
  {
    question: "ক্লাসগুলো কি লাইভ হবে না রেকর্ডেড?",
    answer: "ক্লাসগুলো লাইভ হবে এবং প্রতি ক্লাসের রেকর্ডিং আপনার ড্যাশবোর্ডে লাইফটাইম এক্সেস সহ পেয়ে যাবেন।"
  },
  {
    question: "কোর্স শেষে কি সার্টিফিকেট দেওয়া হবে?",
    answer: "হ্যাঁ, প্রতিটি মাইলস্টোন এবং ফাইনাল প্রজেক্ট সফলভাবে সম্পন্ন করার পর আপনি একটি প্রফেশনাল সার্টিফিকেট পাবেন।"
  },
  {
    question: "সাপোর্ট কিভাবে পাব?",
    answer: "আমাদের ডেডিকেটেড সাপোর্ট গ্রুপ এবং ২৪/৭ মেন্টর সাপোর্ট আছে যেখানে আপনি যেকোনো সমস্যায় তাৎক্ষণিক সমাধান পাবেন।"
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
            <div className="w-16 h-16 rounded-2xl bg-[#2F2FE4]/10 flex items-center justify-center text-[#60a5fa] border border-[#2F2FE4]/20">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic leading-tight">
              Common <span className="text-[#60a5fa]">Questions</span>
            </h2>
            <p className="text-gray-400 font-medium" style={{ fontFamily: "var(--font-bangla)" }}>
              আপনার মনে কি কোনো প্রশ্ন আছে? সচরাচর জিজ্ঞাসিত কিছু প্রশ্নের উত্তর এখানে দেওয়া হলো।
            </p>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`glass rounded-3xl border-white/5 transition-all overflow-hidden ${activeIndex === idx ? 'border-[#2F2FE4]/30 ring-1 ring-[#2F2FE4]/20' : ''}`}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                  className="w-full p-6 md:p-8 flex items-center justify-between text-left gap-4"
                >
                  <span className="text-lg md:text-xl font-bold text-white leading-snug" style={{ fontFamily: "var(--font-bangla)" }}>
                    {faq.question}
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${activeIndex === idx ? 'bg-[#2F2FE4] text-white rotate-180' : 'bg-white/5 text-gray-500'}`}>
                    {activeIndex === idx ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>

                <AnimatePresence>
                  {activeIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-8 pb-8 text-gray-400 font-medium text-lg leading-relaxed border-t border-white/5 pt-4" style={{ fontFamily: "var(--font-bangla)" }}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

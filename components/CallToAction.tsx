"use client";

import React from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Rocket, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CallToAction() {
  const { user } = useAuth();
  const router = useRouter();

  const handleEnrollmentClick = () => {
    router.push('/courses');
  };

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#2F2FE4] rounded-full mix-blend-screen filter blur-[130px] opacity-10 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#60a5fa] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="relative glass rounded-[2.5rem] p-8 md:p-14 border-white/5 overflow-hidden text-center space-y-6 group">
          {/* Decorative Border Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2F2FE4]/0 via-[#2F2FE4]/10 to-[#2F2FE4]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="space-y-4 relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#60a5fa] text-xs font-bold tracking-[0.15em] uppercase"
            >
              <Sparkles size={14} className="fill-[#60a5fa]" />
              Start Your Journey Today
            </motion.div>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to <span className="text-gradient-blue">Transform</span> Your Life?
            </h2>
            
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto font-normal leading-relaxed" style={{ fontFamily: "var(--font-hind-siliguri)" }}>
              দেরি না করে আজই এনরোল করুন এবং আপনার পছন্দের ক্যারিয়ার গড়ার পথে প্রথম পদক্ষেপ নিন। আমরা আছি আপনার সাথে প্রতি পদক্ষেপে।
            </p>
          </div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-4 relative pt-2"
          >
            <button 
              onClick={handleEnrollmentClick}
              className="px-7 py-3.5 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-xl font-bold text-sm transition-all transform active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer"
            >
              Enroll Now
              <Rocket size={18} />
            </button>
            
            <button
              onClick={() => router.push('/contact')}
              className="px-7 py-3.5 glass hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border border-white/10"
            >
              Talk to Advisor
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

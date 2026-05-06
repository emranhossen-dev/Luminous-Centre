"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CallToAction() {
  const { user, openModal } = useAuth();

  const handleEnrollmentClick = () => {
    console.log('CallToAction enrollment button clicked!');
    
    if (!user) {
      console.log('Redirecting to login page...');
      // Redirect to login page
      window.location.href = '/auth/login?redirect=enroll';
      return;
    }
    
    console.log('Redirecting to courses...');
    // If authenticated, redirect to courses page
    window.location.href = '/courses';
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#2F2FE4] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#60a5fa] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="relative glass rounded-[4rem] p-12 md:p-24 border-white/5 overflow-hidden text-center space-y-10 group">
          {/* Decorative Border Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2F2FE4]/0 via-[#2F2FE4]/10 to-[#2F2FE4]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="space-y-6 relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#60a5fa] text-sm font-black uppercase tracking-[0.2em]"
            >
              <Sparkles size={18} className="fill-[#60a5fa]" />
              Start Your Journey Today
            </motion.div>

            <h2 className="text-4xl md:text-7xl font-black text-white italic leading-[1.1] tracking-tight">
              Ready to <span className="text-gradient-blue">Transform</span> Your Life?
            </h2>
            
            <p className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium" style={{ fontFamily: "var(--font-bangla)" }}>
              দেরি না করে আজই এনরোল করুন এবং আপনার পছন্দের ক্যারিয়ার গড়ার পথে প্রথম পদক্ষেপ নিন। আমরা আছি আপনার সাথে প্রতি পদক্ষেপে।
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 relative"
          >
            <button 
              onClick={handleEnrollmentClick}
              className="px-12 py-6 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-[2rem] font-black text-xl transition-all transform active:scale-95 flex items-center gap-4 group shadow-[0_0_50px_rgba(47,47,228,0.4)] cursor-pointer"
            >
              Enroll Now
              <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            
            <button className="px-12 py-6 glass hover:bg-white/10 text-white rounded-[2rem] font-black text-xl transition-all flex items-center gap-4">
              Talk to Advisor
              <ArrowRight size={24} />
            </button>
          </motion.div>

          {/* Floating Decor */}
          <div className="absolute top-12 left-12 w-24 h-24 border-2 border-white/5 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute bottom-12 right-12 w-48 h-48 border border-[#2F2FE4]/10 rounded-full opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
        </div>
      </div>
    </section>
  );
}

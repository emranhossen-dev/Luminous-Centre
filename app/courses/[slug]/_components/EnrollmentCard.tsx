"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

interface EnrollmentCardProps {
  price: number;
  oldPrice: number;
  batch: string;
}

export default function EnrollmentCard({ price, oldPrice, batch }: EnrollmentCardProps) {
  return (
    <div className="bg-[#0c0e1f] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2F2FE4] opacity-5 blur-3xl"></div>
      
      <div className="space-y-8 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Investment</span>
            <div className="px-3 py-1 bg-[#f42a41]/10 rounded-lg text-[10px] font-black italic text-[#f42a41] border border-[#f42a41]/20">25% OFF</div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white italic">{price} TK</span>
            <span className="text-lg text-gray-600 line-through font-bold">{oldPrice} TK</span>
          </div>
        </div>

        <button className="w-full py-5 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 group/btn shadow-[0_10px_30px_rgba(47,47,228,0.3)]">
          Enroll Course
          <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>

        <div className="space-y-4 pt-6 border-t border-white/5">
          {[
            "Lifetime Access",
            "24/7 Expert Support",
            "Certificate of Completion",
            "Career Guidelines"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-[#60a5fa]" />
              <span className="text-sm font-bold text-gray-300">{item}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <Zap size={18} className="text-[#60a5fa] animate-pulse" />
          <div className="space-y-0.5">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Next Batch</p>
            <p className="text-xs font-black text-white italic">{batch}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

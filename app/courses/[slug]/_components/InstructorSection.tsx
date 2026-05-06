"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link, Mail, Globe, Award, Users, Star } from "lucide-react";

export default function InstructorSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="glass rounded-[3rem] p-8 md:p-16 border-white/5 relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2F2FE4] opacity-5 blur-[100px] rounded-full"></div>
          
          <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Instructor Image */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#2F2FE4] to-[#60a5fa] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#0c0e1f] shadow-2xl">
                  <Image
                    src="https://i.pravatar.cc/400?u=instructor"
                    alt="Instructor"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 rounded-full text-[#60a5fa] text-[10px] font-black uppercase tracking-wider">
                  Lead Instructor
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white italic">Md. Shamshed <span className="text-[#60a5fa]">Ali</span></h2>
                <p className="text-gray-400 text-lg font-medium leading-relaxed" style={{ fontFamily: "var(--font-bangla)" }}>
                  সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার হিসেবে ৫ বছরেরও বেশি অভিজ্ঞতা সম্পন্ন। তিনি ইতিমধ্যে ১০০০+ স্টুডেন্টকে মডার্ন ওয়েব ডেভেলপমেন্ট শিখিয়েছেন।
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { label: "Expertise", value: "MERN Stack", icon: Award },
                  { label: "Students", value: "1000+", icon: Users },
                  { label: "Rating", value: "4.9/5", icon: Star },
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2 text-[#60a5fa]">
                      <stat.icon size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
                    </div>
                    <div className="text-xl font-black text-white italic">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                {[Link, Mail, Globe].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#2F2FE4] hover:text-white hover:border-[#2F2FE4] transition-all transform hover:-translate-y-1"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

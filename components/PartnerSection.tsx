"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const PARTNERS = [
  { name: "Google", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Microsoft", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Amazon", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Meta", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Netflix", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Apple", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Tesla", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "IBM", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Oracle", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Adobe", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Salesforce", logo: "https://i.ibb.co.com/35332p83/preview.png" },
  { name: "Spotify", logo: "https://i.ibb.co.com/35332p83/preview.png" },
];

export default function PartnerSection() {
  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      
      {/* Mixed Gradient Background - starts where StudentFeedback ends */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#080616] to-[#0b0c17] z-0"></div>
      
      {/* Middle Glow Effects */}
      <div className="absolute top-1/2 left-0 w-full h-full overflow-hidden z-0 pointer-events-none -translate-y-1/2">
        {/* Middle Left Glow */}
        <div className="absolute top-1/2 left-[-5%] w-[30%] h-[30%] bg-blue-600/12 rounded-full blur-[100px] animate-blob"></div>
        {/* Middle Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[25%] h-[25%] bg-purple-600/10 rounded-full blur-[90px] animate-blob animation-delay-2000"></div>
        {/* Middle Right Glow */}
        <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-indigo-600/12 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10 mb-12">
        <div className="text-center">
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mb-4">Our Trusted Partners</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Global Companies Trust Us</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">We collaborate with leading international companies to provide world-class training and placement opportunities.</p>
          <div className="h-px w-24 bg-blue-600 mx-auto opacity-30 mt-4"></div>
        </div>
      </div>
        
      {/* Carousel Container - Full Width Banner with border top/bottom */}
      <div className="w-full bg-white/[0.015] border-y border-white/[0.06] py-10 md:py-14 backdrop-blur-md relative overflow-hidden shadow-2xl shadow-blue-950/20 z-10">
        
        {/* Edge fading mask using linear-gradient */}
        <div 
          className="overflow-hidden w-full"
          style={{
            maskImage: "linear-gradient(to right, transparent, white 10%, white 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, white 10%, white 90%, transparent)"
          }}
        >
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="flex items-center w-max"
          >
            {[...PARTNERS, ...PARTNERS].map((partner, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center space-y-3 flex-shrink-0 px-10 md:px-14"
              >
                <div className="relative w-20 h-10 md:w-24 md:h-12 flex-shrink-0">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-300"
                  />
                </div>
                <span className="font-semibold text-gray-400 text-xs md:text-sm tracking-widest uppercase select-none">
                  {partner.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10 mt-16">
        <div className="text-center">
          <blockquote className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-300 italic mb-4">
              "Success is not just about what you accomplish in your life, it's about what you inspire others to do."
            </p>
            <cite className="text-gray-500 font-medium">- Unknown</cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

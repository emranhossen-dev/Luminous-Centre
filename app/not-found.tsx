"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Map } from 'lucide-react';
import { useLayout } from '@/contexts/LayoutContext';

export default function NotFound() {
  const { setHideNavbarAndFooter } = useLayout();

  useEffect(() => {
    setHideNavbarAndFooter(true);
    return () => {
      setHideNavbarAndFooter(false);
    };
  }, [setHideNavbarAndFooter]);
  return (
    <div className="min-h-screen bg-[#05060f] text-white flex flex-col items-center justify-center relative overflow-hidden px-6 font-sans">
      {/* Background large 404 */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
        <h1 className="text-[24vw] md:text-[30vw] font-black text-white/[0.015] tracking-tighter">
          404
        </h1>
      </div>

      {/* Floating Astronaut and Space Scene */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
        {/* Astronaut and planet container */}
        <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
          {/* Saturn's Ring */}
          <div className="absolute w-52 h-16 border-[5px] border-sky-300/40 rounded-full transform rotate-[25deg] shadow-[0_0_20px_rgba(125,211,252,0.2)] z-10" />
          
          {/* Glowing Planet Saturn */}
          <div className="absolute w-32 h-32 bg-gradient-to-tr from-sky-400 to-indigo-600 rounded-full shadow-[0_0_50px_rgba(56,189,248,0.35)]" />
          
          {/* Tiny Planet */}
          <div className="absolute top-4 left-4 w-6 h-6 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
          
          {/* Floating Astronaut SVG */}
          <motion.div 
            animate={{ 
              y: [-15, 15, -15],
              rotate: [-5, 5, -5]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute z-20"
          >
            <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              {/* Helmet visor / Glass */}
              <rect x="35" y="30" width="50" height="40" rx="20" fill="#0f172a" stroke="#60a5fa" strokeWidth="4" />
              <path d="M45 42 H75" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              <circle cx="50" cy="42" r="2" fill="#fff" />
              
              {/* Body Suit */}
              <rect x="25" y="65" width="70" height="60" rx="25" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
              
              {/* Control Panel on Chest */}
              <rect x="42" y="75" width="36" height="22" rx="4" fill="#1e293b" />
              <circle cx="48" cy="81" r="2" fill="#ef4444" />
              <circle cx="56" cy="81" r="2" fill="#3b82f6" />
              <circle cx="64" cy="81" r="2" fill="#10b981" />
              <rect x="48" y="87" width="24" height="4" rx="2" fill="#64748b" />
              
              {/* Arms */}
              <rect x="5" y="70" width="22" height="30" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" transform="rotate(-15 5 70)" />
              <rect x="93" y="70" width="22" height="30" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" transform="rotate(15 93 70)" />
              
              {/* Boots / Legs */}
              <rect x="35" y="118" width="22" height="25" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
              <rect x="63" y="118" width="22" height="25" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
              <rect x="30" y="138" width="28" height="10" rx="5" fill="#cbd5e1" />
              <rect x="62" y="138" width="28" height="10" rx="5" fill="#cbd5e1" />
            </svg>
          </motion.div>
        </div>

        {/* Text Content */}
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">
          D&apos;oh! Lost?
        </h2>
        <p className="text-gray-400 text-lg mb-2">
          Don&apos;t be a lone wanderer.
        </p>
        <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
          You have wandered into deep space, or you trying to access a restricted sector. Let me help you teleport back home.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/"
            className="inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm uppercase tracking-wider"
          >
            <Rocket className="w-4 h-4" /> Teleport Home
          </Link>
        </div>

        {/* Sitemap links at the bottom (matching image) */}
        <div className="mt-16 pt-8 border-t border-white/5 w-full">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3 flex items-center justify-center gap-1.5">
            <Map className="w-3.5 h-3.5" /> Sitemap
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
            <Link href="/courses" className="hover:text-blue-400 transition-colors">Courses</Link>
            <Link href="/prospectus" className="hover:text-blue-400 transition-colors">Prospectus</Link>
            <Link href="/gallery" className="hover:text-blue-400 transition-colors">Gallery</Link>
            <Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link>
            <Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link>
          </div>
        </div>
      </div>

      {/* Decorative twinkling stars */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[
          { top: '15%', left: '10%', size: 'w-1 h-1', delay: '0s' },
          { top: '25%', left: '80%', size: 'w-1.5 h-1.5', delay: '1s' },
          { top: '70%', left: '15%', size: 'w-2 h-2', delay: '2s' },
          { top: '65%', left: '85%', size: 'w-1 h-1', delay: '1.5s' },
          { top: '80%', left: '45%', size: 'w-1.5 h-1.5', delay: '0.5s' },
          { top: '45%', left: '90%', size: 'w-1 h-1', delay: '3.2s' },
          { top: '10%', left: '60%', size: 'w-2 h-2', delay: '1.2s' },
        ].map((star, idx) => (
          <div
            key={idx}
            className={`absolute rounded-full bg-white opacity-40 ${star.size}`}
            style={{
              top: star.top,
              left: star.left,
            }}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, Folder } from 'lucide-react';

interface CurriculumModule {
  id: number;
  title: string;
  order_index: number;
  topics: Array<{ id: number; topic_name: string; order_index: number }>;
  achievements: Array<{ id: number; achievement_text: string; order_index: number }>;
}

interface CourseCurriculumProps {
  curriculum: CurriculumModule[];
}

export default function CourseCurriculum({ curriculum }: CourseCurriculumProps) {
  const [activeModule, setActiveModule] = useState(0);
  const [animateLines, setAnimateLines] = useState(false);
  const topicsRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const milestoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnimateLines(true);
  }, [activeModule]);

  if (!curriculum || curriculum.length === 0) {
    return null;
  }

  const currentModule = curriculum[activeModule];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">
          কোর্স <span className="text-purple-400">কারিকুলাম</span>
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          Javascript, React, Node.js, MongoDB, Next.js এবং Express শিখে শুন্য থেকে দক্ষ ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন তৈরি করা শেখো।
          <br />
          ফ্রন্টএন্ডে এডভান্স হওয়ার সাথে শিখে নাও ব্যাকএন্ডও, যেন ইউজারকে দিতে পারো স্মুথ এক্সপেরিয়েন্স।
        </p>
      </div>

      {/* Horizontal Milestone Navigation */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {curriculum.map((module, index) => (
          <button
            key={module.id}
            onClick={() => {
              setActiveModule(index);
              setAnimateLines(false);
              setTimeout(() => setAnimateLines(true), 100);
            }}
            className={`w-12 h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
              activeModule === index
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        ))}
      </div>

      {/* Module Title */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white">{currentModule.title}</h3>
      </div>

      {/* Curriculum Layout */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
        {/* Left Side - Topics */}
        <div ref={topicsRef} className="space-y-4">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-sm">
            <div className="text-center mb-6">
              <h4 className="text-white font-bold text-lg">
                টপিক
              </h4>
            </div>
            <div className="space-y-2">
              <h5 className="text-white font-bold text-xl mb-4">
                Topic will <span className="text-purple-400">Cover</span>
              </h5>
              <div className="flex flex-wrap gap-2">
                {currentModule.topics.map((topic, index) => (
                  <span
                    key={topic.id}
                    className="bg-slate-800/80 border border-purple-500/30 rounded-full px-4 py-2 text-gray-300 text-sm hover:bg-purple-500/20 hover:border-purple-500/50 transition-all cursor-default"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both` }}
                  >
                    {topic.topic_name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle - Milestone Folder Icon */}
        <div ref={milestoneRef} className="flex flex-col items-center justify-center sticky top-4 relative">
          <div className="relative">
            {/* 3D Folder Icon */}
            <svg width="250" height="250" viewBox="0 0 301 301" fill="none" className="drop-shadow-2xl">
              {/* Folder layers for 3D effect */}
              <path d="M134.928 43.5484C132.474 41.3493 129.295 40.1333 126 40.1333H53.5109C47.9696 40.1333 43.4775 44.6254 43.4775 50.1667V205.683H257.522V67.5362C257.522 61.9949 253.03 57.5028 247.489 57.5028H155.617C152.322 57.5028 149.143 56.2868 146.689 54.0878L134.928 43.5484Z" fill="url(#folderGradient1)" />
              <path opacity="0.75" d="M42.3902 79.1551C42.0714 71.5535 48.1479 65.2168 55.7562 65.2168H245.244C252.852 65.2168 258.929 71.5535 258.61 79.1551L252.72 219.622C252.419 226.786 246.524 232.439 239.353 232.439H61.6468C54.4764 232.439 48.5811 226.786 48.2807 219.622L42.3902 79.1551Z" fill="url(#folderGradient2)" />
              <path opacity="0.75" d="M38.2329 85.8656C37.9015 78.256 43.9813 71.9058 51.598 71.9058H249.402C257.019 71.9058 263.098 78.256 262.767 85.8656L256.65 226.332C256.338 233.487 250.447 239.128 243.285 239.128H57.7151C50.5531 239.128 44.6616 233.487 44.35 226.332L38.2329 85.8656Z" fill="url(#folderGradient3)" />
              <path opacity="0.75" d="M34.0758 92.5756C33.7317 84.9581 39.8147 78.5942 47.4399 78.5942H253.56C261.185 78.5942 267.268 84.9581 266.924 92.5756L260.58 233.042C260.258 240.189 254.37 245.816 247.216 245.816H53.7836C46.6299 245.816 40.7421 240.189 40.4194 233.042L34.0758 92.5756Z" fill="url(#folderGradient4)" />
              <path opacity="0.75" d="M29.9186 99.286C29.562 91.6606 35.6481 85.2832 43.2818 85.2832H257.718C265.351 85.2832 271.438 91.6606 271.081 99.286L264.511 239.753C264.177 246.89 258.293 252.505 251.148 252.505H49.852C42.7067 252.505 36.8227 246.89 36.4889 239.753L29.9186 99.286Z" fill="url(#folderGradient5)" />
              <path opacity="0.75" d="M25.7621 105.996C25.3927 98.3632 31.482 91.9722 39.1242 91.9722H261.876C269.518 91.9722 275.608 98.3632 275.238 105.997L268.441 246.463C268.097 253.592 262.216 259.194 255.079 259.194H45.921C38.784 259.194 32.9038 253.592 32.5589 246.463L25.7621 105.996Z" fill="url(#folderGradient6)" />
              <path opacity="0.8" d="M21.6051 112.707C21.2231 105.066 27.3155 98.6611 34.9662 98.6611H266.034C273.685 98.6611 279.777 105.066 279.395 112.707L272.372 253.174C272.016 260.293 266.139 265.883 259.011 265.883H41.9895C34.8609 265.883 28.9844 260.293 28.6285 253.174L21.6051 112.707Z" fill="url(#folderGradient7)" />
              <path d="M30.8003 107.858H270.2C277.377 107.858 283.091 113.871 282.725 121.039L275.81 256.574C275.424 264.133 269.183 270.064 261.615 270.064H39.3853C31.8166 270.064 25.5756 264.133 25.1899 256.574L18.2749 121.039C17.9093 113.871 23.6228 107.858 30.8003 107.858Z" fill="url(#folderGradient8)" fillOpacity="0.2" />
              <path d="M30.8003 107.858H270.2C277.377 107.858 283.091 113.871 282.725 121.039L275.81 256.574C275.424 264.133 269.183 270.064 261.615 270.064H39.3853C31.8166 270.064 25.5756 264.133 25.1899 256.574L18.2749 121.039C17.9093 113.871 23.6228 107.858 30.8003 107.858Z" stroke="url(#folderGradient9)" strokeWidth="1.67222" />
              <text x="40" y="235" fill="url(#numberGradient)" fontSize="80" fontWeight="600" fontFamily="Baloo Da 2, sans-serif">{String(activeModule + 1).padStart(2, '0')}</text>
              <defs>
                <radialGradient id="folderGradient1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150.5 40.1333) rotate(90) scale(64.3806 160.907)">
                  <stop stopColor="#3100E2" />
                  <stop offset="1" stopColor="#3100E2" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="folderGradient2" x1="150.5" y1="65.2168" x2="150.5" y2="232.439" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C9BAFF" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#C9BAFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="folderGradient3" x1="150.5" y1="71.9058" x2="150.5" y2="239.128" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A991FF" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#A991FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="folderGradient4" x1="150.5" y1="78.5942" x2="150.5" y2="245.816" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4A18FF" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#4A18FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="folderGradient5" x1="150.5" y1="85.2832" x2="150.5" y2="252.505" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3100E2" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#3100E2" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="folderGradient6" x1="150.5" y1="91.9722" x2="150.5" y2="259.194" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8A69FF" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#8A69FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="folderGradient7" x1="150.5" y1="98.6611" x2="150.5" y2="265.883" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3100E2" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#3100E2" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="folderGradient8" x1="150.5" y1="107.022" x2="150.5" y2="270.9" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E8E1FF" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#E8E1FF" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="folderGradient9" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(19.2305 181.854) rotate(82.6998) scale(220.43 923.702)">
                  <stop stopColor="#3100E2" stopOpacity="0.5" />
                  <stop offset="0.293269" stopColor="#F98EF2" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#3100E2" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="numberGradient" x1="120" y1="160" x2="10" y2="200" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Animated Connecting Lines SVG */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '800px', height: '600px', left: '-275px', top: '-175px' }}>
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="lineGradientLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D946EF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#9333EA" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="lineGradientRight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9333EA" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2DC874" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Single line to left container */}
              <path
                d="M 400 300 L 200 300"
                stroke="url(#lineGradientLeft)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                className={`opacity-0 ${animateLines ? 'animate-draw' : ''}`}
                style={{ animationDelay: '0.1s' }}
              />
              
              {/* Single line to right container */}
              <path
                d="M 400 300 L 600 300"
                stroke="url(#lineGradientRight)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                className={`opacity-0 ${animateLines ? 'animate-draw' : ''}`}
                style={{ animationDelay: '0.3s' }}
              />
            </svg>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 relative z-10">
            <button
              onClick={() => {
                setActiveModule(Math.max(0, activeModule - 1));
                setAnimateLines(false);
                setTimeout(() => setAnimateLines(true), 100);
              }}
              disabled={activeModule === 0}
              className="p-3 bg-slate-800 rounded-lg text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                setActiveModule(Math.min(curriculum.length - 1, activeModule + 1));
                setAnimateLines(false);
                setTimeout(() => setAnimateLines(true), 100);
              }}
              disabled={activeModule === curriculum.length - 1}
              className="p-3 bg-slate-800 rounded-lg text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-700"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Side - Achievements */}
        <div ref={achievementsRef} className="space-y-4">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-sm">
            <div className="text-center mb-6">
              <h4 className="text-white font-bold text-lg">
                তুমি <span className="text-purple-400">কী কী</span> করতে পারবে
              </h4>
            </div>
            <div className="space-y-2">
              <h5 className="text-white font-bold text-xl mb-4">
                What You Will <span className="text-purple-400">Be Able To Do</span>
              </h5>
              <div className="flex flex-wrap gap-2">
                {currentModule.achievements.map((achievement, index) => (
                  <span
                    key={achievement.id}
                    className="bg-slate-800/80 border border-purple-500/30 rounded-full px-4 py-2 text-gray-300 text-sm hover:bg-purple-500/20 hover:border-purple-500/50 transition-all cursor-default flex items-center gap-2"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both` }}
                  >
                    <Check className="w-3 h-3 text-purple-400" strokeWidth="3" />
                    {achievement.achievement_text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes draw {
          from {
            opacity: 0;
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            opacity: 1;
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        
        .animate-draw {
          animation: draw 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Layers, Clock, CheckCircle, Award, TrendingUp, CheckSquare, Users, Download, LucideIcon } from 'lucide-react';
import { CourseData } from '@/types/course';

const iconMap: Record<string, LucideIcon> = { TrendingUp, CheckSquare, Users, Award, Download };

export default function CourseBanner({ course }: { course: CourseData }) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const deadline = new Date(course.enrollment_deadline).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
    setDaysLeft(diff);
  }, [course.enrollment_deadline]);

  return (
    <div className="relative w-full bg-[#020617] text-white overflow-hidden py-16 lg:py-24">
      {/* Background Animated Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

        {/* LEFT: Dynamic Text Content */}
        <div className="lg:col-span-7 space-y-8 pt-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest w-fit">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            {course.badge}
          </div>

          <h1 className="text-3xl lg:text-5xl font-black leading-[1.1] tracking-tight">
            {course.title}
          </h1>

          <p className="text-slate-400 text-lg lg:text-xl leading-relaxed max-w-2xl font-medium">
            {course.description}
          </p>

          {/* Registration Fee Section */}
          <div className="flex flex-wrap items-baseline gap-6 pt-1">
            <span className="text-2xl text-slate-400 font-bold">Registration Fee:</span>
            <div className="flex gap-4 items-baseline">
              <span className="text-2xl font-black italic text-white tracking-tighter">
                {course.current_price.toLocaleString()} {course.currency}
              </span>
              <span className="text-slate-500 line-through text-xl font-bold">
                {course.regular_price.toLocaleString()} {course.currency}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <StatItem icon={<Layers size={22} />} label="Classes" value={course.classes_count} />
            <StatItem icon={<CheckCircle size={22} />} label="Projects" value={course.projects_count} />
            <StatItem icon={<Clock size={22} />} label="Days Left" value={daysLeft} />
          </div>
        </div>

        {/* RIGHT: Media Card + Buttons */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
            {/* Video Placeholder */}
            <div className="relative aspect-video group cursor-pointer overflow-hidden border-b border-white/5">
              <img
                src={course.thumbnail_url || '/file.svg'}
                alt="Course thumbnail"
                className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-blue-600 p-5 rounded-full shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Play fill="white" size={28} />
                </div>
                <p className="mt-4 text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Preview Course</p>
              </div>
            </div>

            {/* Learning Outcomes - Restored Padding for Better Height */}
            <div className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h3 className="text-xl font-black tracking-tight">কোর্স থেকে যা শিখবেন</h3>
              </div>

              <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                {course.learning_outcomes.map((item, i) => {
                  const Icon = iconMap[item.icon] || CheckSquare;
                  return (
                    <div key={i} className="flex gap-4 items-center group">
                      <div className="shrink-0 bg-blue-500/10 p-3 rounded-2xl text-blue-500 border border-blue-500/10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[14px] text-slate-100 leading-snug">{item.title}</h4>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/courses/${course.slug}/enroll`}
              className="flex-[1.5] bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 flex items-center justify-center gap-3"
            >
              Enroll Now <span>→</span>
            </Link>

            {course.course_outline_url ? (
              <a
                href={course.course_outline_url}
                download="course-outline.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <Download size={20} />
                Download Outline
              </a>
            ) : (
              <button
                disabled
                className="flex-1 px-6 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 bg-slate-800/50 border border-slate-700 text-slate-500 cursor-not-allowed"
              >
                <Download size={20} />
                Outline
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline StatItem Component
const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-white/5 border border-white/5 px-5 py-4 rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-all">
    <div className="text-blue-500 shrink-0">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-black leading-none">{value}</span>
      <span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mt-1">
        {label}
      </span>
    </div>
  </div>
);
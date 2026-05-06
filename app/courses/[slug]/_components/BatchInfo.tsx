"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, UserCheck } from "lucide-react";

interface BatchInfoProps {
  batchDetails: {
    startDate: string;
    startTime: string;
    completionCategory: string;
    classTime: string;
    activeBatch: string;
    enrollmentStatus: string;
  };
}

export default function BatchInfo({ batchDetails }: BatchInfoProps) {
  const cards = [
    {
      title: "Batch Start Time",
      value: batchDetails.startDate,
      subValue: batchDetails.startTime,
      icon: Calendar,
      color: "from-blue-500/20 to-indigo-500/20",
      accent: "text-blue-400"
    },
    {
      title: "Class Schedule",
      value: batchDetails.completionCategory,
      subValue: batchDetails.classTime,
      icon: Clock,
      color: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-400"
    },
    {
      title: "Enrollment Info",
      value: batchDetails.activeBatch,
      subValue: batchDetails.enrollmentStatus,
      icon: UserCheck,
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "text-emerald-400"
    }
  ];

  return (
    <section className="py-12 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative overflow-hidden glass p-8 rounded-[2rem] border-white/5 hover:border-white/10 transition-all group`}
            >
              {/* Decorative Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ${card.accent}`}>
                  <card.icon size={28} />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest">{card.title}</h4>
                  <div className="text-2xl font-black text-white italic">{card.value}</div>
                  <div className="text-sm font-medium text-gray-400" style={{ fontFamily: "var(--font-bangla)" }}>{card.subValue}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Lock, 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  Award,
  ArrowRight,
  Menu,
  X,
  Video,
  FileText
} from "lucide-react";

interface Module {
  id: number;
  title: string;
  duration: string;
  isFree: boolean;
  isLocked: boolean;
  description: string;
  videoUrl?: string;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  totalModules: number;
  completedModules: number;
  modules: Module[];
}

const generateMilestones = (): Milestone[] => {
  return Array.from({ length: 10 }, (_, milestoneIndex) => ({
    id: milestoneIndex + 1,
    title: `মাইলস্টোন ${milestoneIndex + 1}: ${getMilestoneTitle(milestoneIndex + 1)}`,
    description: getMilestoneDescription(milestoneIndex + 1),
    totalModules: 10,
    completedModules: milestoneIndex === 0 ? 3 : 0,
    modules: Array.from({ length: 10 }, (_, moduleIndex) => ({
      id: moduleIndex + 1,
      title: `মডিউল ${moduleIndex + 1}: ${getModuleTitle(milestoneIndex, moduleIndex)}`,
      duration: `${15 + moduleIndex * 5} min`,
      isFree: milestoneIndex === 0 && moduleIndex < 3,
      isLocked: milestoneIndex > 0 || moduleIndex >= 3,
      description: getModuleDescription(milestoneIndex, moduleIndex),
      videoUrl: milestoneIndex === 0 && moduleIndex < 3 ? "#demo-video" : undefined
    }))
  }));
};

function getMilestoneTitle(id: number): string {
  const titles = [
    "ওয়েব ডেভেলপমেন্টের হাতেখড়ি",
    "অ্যাডভান্সড জাভাস্ক্রিপ্ট মাস্টারক্লাস",
    "রিয়েক্ট কোর ফান্ডামেন্টালস",
    "স্টেট ম্যানেজমেন্ট ও হুকস",
    "ব্যাকএন্ড ফান্ডামেন্টালস (Node & Express)",
    "ডেটাবেস আর্কিটেকচার (MongoDB)",
    "অথেন্টিকেশন ও সিকিউরিটি",
    "ফুল-স্ট্যাক প্রজেক্ট ডেভেলপমেন্ট",
    "ডেপ্লয়মেন্ট ও অপ্টিমাইজেশন",
    "ইন্টারভিউ প্রিপারেশন ও পোর্টফোলিও"
  ];
  return titles[id - 1] || "অ্যাডভান্সড টপিক";
}

function getMilestoneDescription(id: number): string {
  return `এই মাইলস্টোনে আপনি ওয়েব ডেভেলপমেন্টের মৌলিক ধারণাগুলো শিখবেন এবং হাতে-কলমে প্র্যাকটিস করবেন।`;
}

function getModuleTitle(milestoneIndex: number, moduleIndex: number): string {
  const topics = [
    ["HTML5 বেসিকস", "CSS3 ফান্ডামেন্টালস", "রেসপন্সিভ ডিজাইন", "ফ্লেক্সবক্স লেআউট", "CSS গ্রিড", "অ্যানিমেশন", "ট্রানজিশন", "মডার্ন CSS", "ব্রাউজার ডেভটুলস", "প্রজেক্ট: পোর্টফোলিও"],
    ["ভ্যারিয়েবল ও ডাটা টাইপ", "ফাংশন ও স্কোপ", "অ্যারে ও অবজেক্ট", "DOM ম্যানিপুলেশন", "ইভেন্ট হ্যান্ডলিং", "ES6+ ফিচারস", "অ্যাসিনক্রোনাস JS", "এরর হ্যান্ডলিং", "মডিউল সিস্টেম", "প্রজেক্ট: টাস্ক ম্যানেজার"],
    ["রিয়েক্ট ইনট্রোডাকশন", "কম্পোনেন্টস", "প্রপস ও স্টেট", "লাইফসাইকেল মেথড", "ইভেন্ট হ্যান্ডলিং", "কন্ডিশনাল রেন্ডারিং", "লিস্ট ও কীস", "ফর্মস", "রাউটিং", "প্রজেক্ট: ব্লগ অ্যাপ"]
  ];
  
  if (milestoneIndex < topics.length) {
    return topics[milestoneIndex][moduleIndex] || "অ্যাডভান্সড টপিক";
  }
  return "অ্যাডভান্সড টপিক";
}

function getModuleDescription(milestoneIndex: number, moduleIndex: number): string {
  return `এই মডিউলে আপনি ${getModuleTitle(milestoneIndex, moduleIndex)} সম্পর্কে বিস্তারিত জানতে পারবেন।`;
}

export default function DemoDashboard() {
  const [milestones] = useState<Milestone[]>(generateMilestones());
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(milestones[0]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleModuleClick = (module: Module) => {
    if (module.isLocked) {
      // Show enrollment prompt
      alert("এই মডিউলটি আনলক করতে কোর্সে ভর্তি হোন!");
      return;
    }
    setSelectedModule(module);
  };

  return (
    <div className="min-h-screen bg-[#080616]">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#2F2FE4] opacity-5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#2F2FE4] opacity-5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 rounded-xl bg-[#2F2FE4] flex items-center justify-center text-white"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar - Milestones */}
        <div className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-[#0c0e1f] border-r border-white/5 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-full overflow-y-auto p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white mb-2">কোর্স কন্টেন্ট</h2>
              <p className="text-gray-400 text-sm">১০টি মাইলস্টোন, ১০টি মডিউল</p>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedMilestone(milestone);
                    setIsSidebarOpen(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedMilestone.id === milestone.id
                      ? "bg-[#2F2FE4] border-[#2F2FE4] shadow-[0_0_20px_rgba(47,47,228,0.3)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-gray-400">মাইলস্টোন {milestone.id}</span>
                    {milestone.completedModules > 0 && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold">
                        {milestone.completedModules}/{milestone.totalModules}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm leading-tight" style={{ fontFamily: "var(--font-bangla)" }}>
                    {milestone.title}
                  </h3>
                  <div className="mt-2">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-[#2F2FE4] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(milestone.completedModules / milestone.totalModules) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-[#0c0e1f] border-b border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "var(--font-bangla)" }}>
                  {selectedMilestone.title}
                </h1>
                <p className="text-gray-400">{selectedMilestone.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#60a5fa]">{selectedMilestone.completedModules}</div>
                  <div className="text-xs text-gray-400">সম্পন্ন</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{selectedMilestone.totalModules}</div>
                  <div className="text-xs text-gray-400">মোট</div>
                </div>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedMilestone.modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleModuleClick(module)}
                  className={`relative group glass rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                    module.isLocked
                      ? "border-white/10 opacity-60"
                      : module.isFree
                      ? "border-emerald-500/30 hover:border-emerald-500/50"
                      : "border-white/10 hover:border-[#2F2FE4]/50"
                  }`}
                >
                  {/* Module Header */}
                  <div className={`p-6 ${
                    module.isFree ? "bg-emerald-500/10" : "bg-white/5"
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          module.isLocked
                            ? "bg-white/10"
                            : module.isFree
                            ? "bg-emerald-500/20"
                            : "bg-[#2F2FE4]/20"
                        }`}>
                          {module.isLocked ? (
                            <Lock size={24} className="text-gray-400" />
                          ) : module.isFree ? (
                            <Play size={24} className="text-emerald-400" />
                          ) : (
                            <Video size={24} className="text-[#60a5fa]" />
                          )}
                        </div>
                        <div>
                          {module.isFree && (
                            <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-1">
                              ফ্রি
                            </span>
                          )}
                          {module.isLocked && (
                            <span className="inline-block px-2 py-1 bg-white/10 text-gray-400 text-xs font-bold rounded-full mb-1">
                              লক
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock size={14} />
                        {module.duration}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white mb-2" style={{ fontFamily: "var(--font-bangla)" }}>
                      {module.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{module.description}</p>
                  </div>

                  {/* Module Footer */}
                  <div className="p-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {module.isLocked ? (
                        <span className="text-xs text-gray-400 font-medium">ভর্তি হোন</span>
                      ) : module.isFree ? (
                        <span className="text-xs text-emerald-400 font-medium">এখনই দেখুন</span>
                      ) : (
                        <span className="text-xs text-[#60a5fa] font-medium">প্রিমিয়াম</span>
                      )}
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enrollment CTA */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa] rounded-3xl p-8 text-center">
              <h2 className="text-3xl font-black text-white mb-4">সম্পূর্ণ কোর্স আনলক করুন!</h2>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                সবগুলো মাইলস্টোন এবং মডিউল আনলক করতে আজই কোর্সে ভর্তি হোন এবং আপনার ওয়েব ডেভেলপমেন্ট যাত্রা শুরু করুন।
              </p>
              <button className="px-8 py-4 bg-white text-[#2F2FE4] rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95">
                এখনই ভর্তি হোন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

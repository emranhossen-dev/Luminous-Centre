"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ExternalLink, Code, Layers } from "lucide-react";

interface Project {
  id: number;
  title: string;
  image: string;
  tools: string[];
  description: string;
  features: string[];
  milestone: number;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Personal Portfolio Website",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    description: "একটি সুন্দর এবং রেসপন্সিভ পোর্টফোলিও ওয়েবসাইট যেখানে আপনার সব কাজ প্রদর্শন করতে পারবেন।",
    features: [
      "Responsive design for all devices",
      "Smooth animations and transitions",
      "Contact form with validation",
      "Project gallery with filtering"
    ],
    milestone: 1
  },
  {
    id: 2,
    title: "Todo List Application",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "CSS3", "Local Storage"],
    description: "একটি ফিচার-রিচ টুডু লিস্ট অ্যাপ্লিকেশন যা CRUD অপারেশন সমর্থন করে।",
    features: [
      "Add, edit, and delete tasks",
      "Mark tasks as complete",
      "Local storage for data persistence",
      "Task filtering and search"
    ],
    milestone: 2
  },
  {
    id: 3,
    title: "Weather Dashboard",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "API Integration", "CSS3", "Async/Await"],
    description: "রিয়েল-টাইম আবহাওয়া তথ্য দেখানোর জন্য একটি ড্যাশবোর্ড অ্যাপ্লিকেশন।",
    features: [
      "Real-time weather data",
      "Multiple city support",
      "5-day weather forecast",
      "Beautiful weather animations"
    ],
    milestone: 3
  },
  {
    id: 4,
    title: "E-commerce Product Page",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "State Management", "CSS3", "Component Architecture"],
    description: "একটি পূর্ণাঙ্গ ই-কমার্স প্রোডাক্ট পেজ যা শপিং কার্ট ফিচার সহ।",
    features: [
      "Product gallery with zoom",
      "Shopping cart functionality",
      "Product reviews and ratings",
      "Price filter and sorting"
    ],
    milestone: 4
  },
  {
    id: 5,
    title: "Blog Platform",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "React Router", "Markdown", "CSS3"],
    description: "একটি ব্লগিং প্ল্যাটফর্ম যেখানে আপনি আর্টিকেল লিখতে এবং প্রকাশ করতে পারবেন।",
    features: [
      "Create and edit blog posts",
      "Markdown support",
      "Category and tag system",
      "Comment section"
    ],
    milestone: 5
  },
  {
    id: 6,
    title: "Task Management System",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "Redux", "Node.js", "Express", "MongoDB"],
    description: "একটি পূর্ণাঙ্গ টাস্ক ম্যানেজমেন্ট সিস্টেম যা টিমের জন্য উপযুক্ত।",
    features: [
      "User authentication",
      "Task assignment to team members",
      "Progress tracking",
      "Deadline notifications"
    ],
    milestone: 6
  },
  {
    id: 7,
    title: "Social Media Dashboard",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "Chart.js", "Node.js", "REST API", "JWT"],
    description: "সোশ্যাল মিডিয়া অ্যানালিটিক্স দেখানোর জন্য একটি ড্যাশবোর্ড।",
    features: [
      "Real-time analytics",
      "Interactive charts and graphs",
      "Post scheduling",
      "User engagement metrics"
    ],
    milestone: 7
  },
  {
    id: 8,
    title: "Online Learning Platform",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "Node.js", "MongoDB", "Video Streaming", "Payment"],
    description: "একটি অনলাইন লার্নিং প্ল্যাটফর্ম যেখানে কোর্স এবং ভিডিও কন্টেন্ট থাকবে।",
    features: [
      "Video course player",
      "Progress tracking",
      "Quiz and assessment system",
      "Certificate generation"
    ],
    milestone: 8
  },
  {
    id: 9,
    title: "Real Estate Website",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Map Integration"],
    description: "একটি রিয়েল এস্টেট ওয়েবসাইট যা প্রপার্টি লিস্টিং এবং ম্যাপ ইন্টিগ্রেশন সহ।",
    features: [
      "Property search and filter",
      "Interactive map view",
      "Virtual property tours",
      "Agent contact system"
    ],
    milestone: 9
  },
  {
    id: 10,
    title: "Food Delivery App",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "Redux", "Node.js", "MongoDB", "Stripe API"],
    description: "একটি ফুড ডেলিভারি অ্যাপ্লিকেশন যা অর্ডার এবং পেমেন্ট সিস্টেম সহ।",
    features: [
      "Restaurant menu browsing",
      "Online ordering system",
      "Payment integration",
      "Order tracking"
    ],
    milestone: 10
  },
  {
    id: 11,
    title: "Job Portal Platform",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Email Service"],
    description: "একটি জব পোর্টাল যেখানে চাকরি খুঁজে এবং আবেদন করা যাবে।",
    features: [
      "Job search and filtering",
      "Resume upload",
      "Application tracking",
      "Email notifications"
    ],
    milestone: 11
  },
  {
    id: 12,
    title: "Freelance Marketplace",
    image: "https://i.ibb.co.com/35332p83/preview.png",
    tools: ["React", "Node.js", "MongoDB", "Socket.io", "Stripe"],
    description: "একটি ফ্রিল্যান্সিং মার্কেটপ্লেস যেখানে ক্লায়েন্ট এবং ফ্রিল্যান্সাররা কাজ পাবে।",
    features: [
      "Project posting and bidding",
      "Real-time messaging",
      "Payment escrow system",
      "Rating and review system"
    ],
    milestone: 12
  }
];

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section className="py-24 bg-[#0c0e1f]/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white italic">
            Projects <span className="text-[#60a5fa]">We Build</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-medium" style={{ fontFamily: "var(--font-bangla)" }}>
            এই কোর্সে আমরা মোট ১২টি ইন্ডাস্ট্রি লেভেলের প্রজেক্ট তৈরি করব যা আপনার পোর্টফোলিওকে সমৃদ্ধ করবে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="group glass rounded-[2.5rem] overflow-hidden border-white/5 hover:border-[#2F2FE4]/50 transition-all shadow-2xl flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080616] via-transparent to-transparent opacity-60"></div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-grow space-y-4">
                <div className="flex flex-wrap gap-2">
                  {project.tools.slice(0, 3).map((tool, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-gray-400">
                      {tool}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-black text-white italic tracking-tight group-hover:text-[#60a5fa] transition-colors">
                  {project.title}
                </h3>

                <p className="text-gray-500 text-sm font-medium line-clamp-2" style={{ fontFamily: "var(--font-bangla)" }}>
                  {project.description}
                </p>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="mt-auto w-full py-4 bg-white/5 hover:bg-[#2F2FE4] text-white border border-white/10 hover:border-[#2F2FE4] rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 group/btn"
                >
                  View Details
                  <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-[#080616]/90 backdrop-blur-md"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0c0e1f] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all z-20"
              >
                <X size={24} />
              </button>

              <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white italic">{selectedProject.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tools.map((tool, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-bold text-[#60a5fa]">
                          <Code size={12} />
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest">
                      <Layers size={14} className="text-[#60a5fa]" />
                      Project Features
                    </div>
                    <ul className="space-y-4">
                      {selectedProject.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#2F2FE4] mt-2 shrink-0"></div>
                          <span className="text-gray-300 font-medium leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-3xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20">
                    <p className="text-gray-300 italic font-medium leading-relaxed" style={{ fontFamily: "var(--font-bangla)" }}>
                      {selectedProject.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

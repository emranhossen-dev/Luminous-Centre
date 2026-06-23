"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, X, ZoomIn, Info, Eye } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  category: 'classroom' | 'lab' | 'event' | 'certification';
  image_url: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "MERN Stack Web Dev Session",
    category: "classroom",
    image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    description: "Students collaborating during an intensive React development lecture."
  },
  {
    id: 2,
    title: "Main Computer Training Lab",
    category: "lab",
    image_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    description: "Our high-tech lab setup with individual workstation nodes and dual displays."
  },
  {
    id: 3,
    title: "Tech Career Seminar 2026",
    category: "event",
    image_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    description: "Industry experts sharing tips on entering the software market with students."
  },
  {
    id: 4,
    title: "Graduation & Certification Ceremony",
    category: "certification",
    image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
    description: "Celebrating the achievements of our successful web development batch."
  },
  {
    id: 5,
    title: "UI/UX Design Masterclass Lab",
    category: "lab",
    image_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    description: "Hands-on Figma training where students build interfaces from sketch to design."
  },
  {
    id: 6,
    title: "Offline Team Programming Bootcamp",
    category: "classroom",
    image_url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80",
    description: "Peer programming session focused on resolving complex algorithms in JS."
  },
  {
    id: 7,
    title: "Govt Project Seminar Launch",
    category: "event",
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    description: "Official launch event for the free IT training courses funded by government."
  },
  {
    id: 8,
    title: "Student Project Presentation Day",
    category: "certification",
    image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    description: "Graduates presenting full-stack websites to potential employers."
  }
];

type CategoryFilter = 'all' | 'classroom' | 'lab' | 'event' | 'certification';

export default function GalleryPage() {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems = filter === 'all' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === filter);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#05060f] text-white transition-colors duration-300">
      {/* Background Blobs (controlled via classes/selectors in globals.css) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] right-[-10%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[110px] animate-blob"></div>
        <div className="absolute bottom-[15%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#60a5fa] text-xs font-bold uppercase tracking-[0.2em]">
            <Camera size={14} />
            LSDTC Campus Moments
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Our Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">Gallery</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-bangla)' }}>
            আমাদের ল্যাব, ক্লাসরুম অ্যাক্টিভিটি, সেমিনার এবং সফল শিক্ষার্থীদের উৎসবমুখর মুহূর্তের ছবিসমূহ।
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {[
            { id: 'all', label: 'All Photos' },
            { id: 'classroom', label: 'Classrooms' },
            { id: 'lab', label: 'Computer Labs' },
            { id: 'event', label: 'Events & Seminars' },
            { id: 'certification', label: 'Certifications' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as CategoryFilter)}
              className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold border transition-all cursor-pointer ${
                filter === btn.id
                  ? 'bg-[#2F2FE4] border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02] aspect-[4/3] cursor-pointer hover:border-blue-500/30 transition-all hover:scale-[1.02]"
            >
              <Image 
                src={item.image_url} 
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              
              {/* Overlay with zoom icon and text on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                  <Eye size={18} className="text-white" />
                </div>
                
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider w-fit mb-2">
                  {item.category}
                </span>
                <h3 className="text-white font-bold text-md leading-tight mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-4xl w-full bg-[#0c0e1f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/60 border border-white/10 hover:bg-black text-white hover:scale-105 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Image Section */}
                <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto md:h-[500px]">
                  <Image 
                    src={selectedImage.image_url} 
                    alt={selectedImage.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details Section */}
                <div className="p-8 flex flex-col justify-center space-y-4">
                  <span className="text-xs bg-[#2F2FE4] text-white font-black px-3 py-1 rounded-md uppercase tracking-wider w-fit">
                    {selectedImage.category}
                  </span>
                  <h2 className="text-2xl font-black text-white leading-tight">{selectedImage.title}</h2>
                  <div className="h-px bg-white/10 w-16"></div>
                  <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-bangla)' }}>
                    {selectedImage.description}
                  </p>
                  
                  <div className="pt-6 flex gap-2">
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="px-6 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Close View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

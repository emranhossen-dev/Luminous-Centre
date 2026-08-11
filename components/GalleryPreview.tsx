"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  is_featured?: boolean;
}

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'g1',
    title: 'হাই-টেক কম্পিউটার ল্যাব',
    category: 'lab',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'g2',
    title: 'প্র্যাকটিক্যাল কোডিং ক্লাস',
    category: 'classroom',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'g3',
    title: 'গ্রাফিক ডিজাইন ওয়ার্কশপ',
    category: 'classroom',
    image_url: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'g4',
    title: 'ফ্রি সেমিনার ও ক্যারিয়ার গাইডলাইন',
    category: 'event',
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'g5',
    title: 'সরকারি সার্টিফিকেট বিতরণ অনুষ্ঠান',
    category: 'certification',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
  },
];

export default function GalleryPreview() {
  const [photos, setPhotos] = useState<GalleryItem[]>(DEFAULT_GALLERY);

  useEffect(() => {
    fetch('/api/gallery?featured=true&limit=5')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setPhotos(data.data.slice(0, 5));
        } else {
          return fetch('/api/gallery?limit=5').then(r => r.json());
        }
      })
      .then(data => {
        if (data?.success && data.data.length > 0) {
          setPhotos(data.data.slice(0, 5));
        }
      })
      .catch(console.error);
  }, []);

  const displayPhotos = photos.length >= 5 ? photos.slice(0, 5) : DEFAULT_GALLERY.slice(0, 5);

  return (
    <section className="relative w-full overflow-hidden py-10 lg:py-14">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c17] via-[#080616] to-[#05060f] z-0" />

      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 right-[-5%] w-[30%] h-[50%] bg-purple-600/8 rounded-full blur-[110px] -translate-y-1/2" />
        <div className="absolute top-1/2 left-[-5%] w-[25%] h-[40%] bg-blue-600/8 rounded-full blur-[100px] -translate-y-1/2" />
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-3">
              <Camera size={12} /> ক্যাম্পাস মুহূর্ত
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              আমাদের{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
                Gallery
              </span>
            </h2>
            <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
              ক্লাসরুম, ল্যাব, ইভেন্ট ও সার্টিফিকেশনের কিছু মুহূর্ত
            </p>
          </div>
          <Link
            href="/gallery"
            className="flex items-center gap-2 px-5 py-2 border border-white/10 bg-white/5 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all self-start sm:self-auto whitespace-nowrap cursor-pointer"
          >
            সব ছবি দেখুন <ArrowRight size={14} />
          </Link>
        </div>

        {/* 5 Photo Grid: 2 rows x 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 md:grid-rows-2">
          {displayPhotos.map((photo, idx) => (
            <motion.div
              key={photo.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`group relative rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer ${
                idx === 0 
                  ? 'md:row-span-2 min-h-[250px] md:min-h-[416px] h-full' 
                  : 'min-h-[195px] h-full'
              }`}
            >
              <img
                src={photo.image_url}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider capitalize">
                    {photo.category}
                  </span>
                </div>
                {photo.title && (
                  <h3 className="text-white font-bold text-sm mt-1 truncate" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                    {photo.title}
                  </h3>
                )}
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                  <Eye size={14} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa] hover:from-[#2626c8] hover:to-[#4a8fe8] text-white rounded-2xl font-black text-xs transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-blue-900/30 cursor-pointer"
          >
            <Camera size={14} /> সম্পূর্ণ গ্যালারি দেখুন <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

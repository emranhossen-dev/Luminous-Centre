"use client";

import React, { useState, useEffect } from 'react';
import { Camera, X, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string;
}

const SAMPLE_GALLERY: GalleryItem[] = [
  {
    id: 'sg1',
    title: 'হাই-টেক কম্পিউটার ল্যাব',
    category: 'lab',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop',
    description: 'সর্বাধুনিক পিসি এবং ডুয়েল মনিটর সেটআপ সমৃদ্ধ আমাদের কম্পিউটার ল্যাব।',
  },
  {
    id: 'sg2',
    title: 'প্র্যাকটিক্যাল কোডিং ক্লাস',
    category: 'classroom',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    description: 'মেন্টরের সরাসরি তত্ত্বাবধানে লাইভ কোডিং ও প্রজেক্ট বিল্ডিং সেশন।',
  },
  {
    id: 'sg3',
    title: 'গ্রাফিক ডিজাইন ওয়ার্কশপ',
    category: 'classroom',
    image_url: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?q=80&w=800&auto=format&fit=crop',
    description: 'UI/UX এবং ব্র্যান্ড আইডেন্টিটি ডিজাইন শেখার জন্য প্র্যাকটিক্যাল সেশন।',
  },
  {
    id: 'sg4',
    title: 'ফ্রি সেমিনার ও ক্যারিয়ার গাইডলাইন',
    category: 'event',
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
    description: 'নতুন শিক্ষার্থীদের জন্য আইটি সেক্টরে ক্যারিয়ার গড়ার নির্দেশনামূলক সেমিনার।',
  },
  {
    id: 'sg5',
    title: 'সরকারি সার্টিফিকেট বিতরণ অনুষ্ঠান',
    category: 'certification',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    description: 'NSDA ও ASSETS প্রজেক্টের সফল শিক্ষার্থীদের মধ্যে সরকারি প্রশংসাপত্র প্রদান।',
  },
  {
    id: 'sg6',
    title: 'শিক্ষার্থীদের টিম প্রজেক্ট প্রেজেন্টেশন',
    category: 'event',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    description: 'ব্যাচ শেষের প্রজেক্ট শোকেস ও জুরি বোর্ডের পর্যালোচনা।',
  },
];

type CategoryFilter = 'all' | 'classroom' | 'lab' | 'event' | 'certification' | 'general';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(SAMPLE_GALLERY);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setItems(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = filter === 'all' ? items : items.filter(item => item.category === filter);
  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#05060f] text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] right-[-10%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[110px] animate-blob" />
        <div className="absolute bottom-[15%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#60a5fa] text-xs font-bold uppercase tracking-[0.2em]">
            <Camera size={14} />
            LSDTC Campus Moments
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            Our Campus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
              Gallery
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            আমাদের ল্যাব, ক্লাসরুম অ্যাক্টিভিটি, সেমিনার এবং সফল শিক্ষার্থীদের উৎসবমুখর মুহূর্তের ছবিসমূহ।
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as CategoryFilter)}
              className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold border transition-all cursor-pointer capitalize
                ${filter === cat
                  ? 'bg-[#2F2FE4] border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                }`}
            >
              {cat === 'all' ? 'All Photos' : cat}
              {' '}({cat === 'all' ? items.length : items.filter(i => i.category === cat).length})
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-24">
            <Camera size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">No photos in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02] aspect-[4/3] cursor-pointer hover:border-blue-500/30 transition-all hover:scale-[1.02]"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <Eye size={18} className="text-white" />
                  </div>
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider w-fit mb-2 capitalize">
                    {item.category}
                  </span>
                  {item.title && (
                    <h3 className="text-white font-bold text-md leading-tight mb-1" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#0c0e1f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/60 border border-white/10 hover:bg-black text-white hover:scale-105 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto md:h-[500px]">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center space-y-4">
                  <span className="text-xs bg-[#2F2FE4] text-white font-black px-3 py-1 rounded-md uppercase tracking-wider w-fit capitalize">
                    {selectedImage.category}
                  </span>
                  <h2 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                    {selectedImage.title || 'Gallery Photo'}
                  </h2>
                  <div className="h-px bg-white/10 w-16" />
                  {selectedImage.description && (
                    <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      {selectedImage.description}
                    </p>
                  )}
                  <div className="pt-6">
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

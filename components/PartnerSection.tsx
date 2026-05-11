"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PARTNERS = [
  { name: "Google", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Technology Leader" },
  { name: "Microsoft", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Software Innovation" },
  { name: "Amazon", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Cloud Computing" },
  { name: "Meta", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Social Media Giant" },
  { name: "Netflix", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Entertainment Platform" },
  { name: "Apple", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Consumer Electronics" },
  { name: "Tesla", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Electric Vehicles" },
  { name: "IBM", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Enterprise Solutions" },
  { name: "Oracle", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Database Systems" },
  { name: "Adobe", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Creative Software" },
  { name: "Salesforce", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "CRM Platform" },
  { name: "Spotify", logo: "https://i.ibb.co.com/35332p83/preview.png", description: "Music Streaming" },
];

export default function PartnerSection() {
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Ensure auto-play works on mobile
  useEffect(() => {
    // For mobile devices, ensure auto-play is enabled
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsAutoPlay(true);
    }
  }, []);
  const [itemsPerView, setItemsPerView] = useState(5); // Number of items visible at once
  const [animationDuration, setAnimationDuration] = useState(20); // Animation duration in seconds
  const [manualControl, setManualControl] = useState(false);
  const [xPosition, setXPosition] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout and return to auto-play
  const returnToAutoPlay = () => {
    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
    }
    manualTimeoutRef.current = setTimeout(() => {
      setManualControl(false);
      setXPosition(0); // Reset position when returning to auto-play
    }, 5000); // Return to auto-play after 5 seconds
  };

  // Update items per view and animation duration based on screen size
  useEffect(() => {
    const updateSettings = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) {
          setItemsPerView(1.5); // mobile: 1.5 items to show movement
          setAnimationDuration(25); // mobile: slow continuous animation
        } else if (width < 768) {
          setItemsPerView(2); // sm: 2 items
          setAnimationDuration(12); // sm: slightly faster
        } else if (width < 1024) {
          setItemsPerView(3); // md: 3 items
          setAnimationDuration(15); // md: moderate speed
        } else if (width < 1280) {
          setItemsPerView(4); // lg: 4 items
          setAnimationDuration(18); // lg: slightly slower
        } else {
          setItemsPerView(5); // xl: 5 items
          setAnimationDuration(20); // xl: normal speed
        }
      }
    };

    updateSettings();
    window.addEventListener('resize', updateSettings);
    return () => window.removeEventListener('resize', updateSettings);
  }, []);

  
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

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mb-4">Our Trusted Partners</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Global Companies Trust Us</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">We collaborate with leading international companies to provide world-class training and placement opportunities.</p>
          <div className="h-px w-24 bg-blue-600 mx-auto opacity-30 mt-4"></div>
        </div>
        
        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            onClick={() => {
              setManualControl(true);
              const cardWidth = 100 / itemsPerView;
              const newPosition = xPosition + cardWidth;
              console.log('Left arrow clicked - cardWidth:', cardWidth, 'newPosition:', newPosition);
              setXPosition(newPosition);
              returnToAutoPlay();
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            onClick={() => {
              setManualControl(true);
              const cardWidth = 100 / itemsPerView;
              const newPosition = xPosition - cardWidth;
              console.log('Right arrow clicked - cardWidth:', cardWidth, 'newPosition:', newPosition);
              setXPosition(newPosition);
              returnToAutoPlay();
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Carousel Track */}
          <div className="overflow-hidden mx-12">
            <motion.div
              animate={isAutoPlay && !manualControl ? { x: ["0%", "-50%"] } : { x: `${xPosition}%` }}
              transition={isAutoPlay && !manualControl ? { 
                duration: animationDuration, 
                ease: "linear", 
                repeat: Infinity,
                repeatType: "loop"
              } : { duration: 0.15, ease: "easeOut" }}
              className="flex gap-4 cursor-grab active:cursor-grabbing"
              onTouchStart={() => setIsAutoPlay(false)}
              onTouchEnd={() => {
                setTimeout(() => setIsAutoPlay(true), 3000);
              }}
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
              drag="x"
              dragConstraints={{ left: -300, right: 300 }}
              dragElastic={0.3}
              dragMomentum={true}
              dragTransition={{ 
                bounceStiffness: 300, 
                bounceDamping: 30 
              }}
              onDragStart={() => {
                setIsDragging(true);
                setManualControl(true);
              }}
              onDragEnd={(e, info) => {
                setIsDragging(false);
                const dragOffset = info.offset.x;
                const velocity = info.velocity.x;
                
                // Use both offset and velocity for better detection
                if (Math.abs(dragOffset) > 20 || Math.abs(velocity) > 500) {
                  if (dragOffset > 0 || velocity > 0) {
                    setXPosition(xPosition + (100 / itemsPerView));
                  } else {
                    setXPosition(xPosition - (100 / itemsPerView));
                  }
                }
              }}
            >
              {[...PARTNERS, ...PARTNERS].map((partner, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 flex flex-col items-center space-y-4 p-4 bg-white/[0.03] rounded-3xl border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all cursor-pointer"
                  style={{ width: `${100 / itemsPerView}%` }}
                  onMouseEnter={() => setIsAutoPlay(false)}
                  onMouseLeave={() => setIsAutoPlay(true)}
                >
                  <div className="relative w-24 h-12">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-white text-center">{partner.name}</h3>
                  <p className="text-sm text-gray-400 text-center">{partner.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

                  </div>

        {/* Motivational Quote */}
        <div className="mt-16 text-center">
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

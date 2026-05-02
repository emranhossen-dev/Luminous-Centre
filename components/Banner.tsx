import React from 'react';
import { MoveRight, Zap, Video, MonitorPlay, Users, BookOpenCheck } from 'lucide-react';

const Banner = () => {
  const completionTypes = [
    { name: "প্রি-রেকর্ডেড", icon: Video },
    { name: "অনলাইন লাইভ", icon: MonitorPlay },
    { name: "অফলাইন কোর্স", icon: Users },
    { name: "সরকারি প্রজেক্ট", icon: BookOpenCheck },
  ];

  return (
    // pt-28 ensures space from the navbar on small devices
    <section className="relative min-h-[100vh] lg:min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-[#080616] border-b border-white/5 pt-28 lg:pt-20">
      
      {/* Background Neon Blobs */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-[#2F2FE4] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#162E93] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* ==========================================
            LEFT SIDE: CONTENT & TYPOGRAPHY
            ========================================== */}
        <div className="text-center lg:text-left animate-in flex flex-col items-center lg:items-start">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
            <Zap className="w-3.5 h-3.5 text-blue-400 neon-blue-glow" />
            <span className="text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em]">
              Elevate Your Potential
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-5 leading-[1.2] tracking-tight">
            <span className="block text-gray-300 font-medium text-xl md:text-2xl mb-1">দক্ষতা বৃদ্ধি করুন,</span>
            <span className="text-gradient-blue drop-shadow-[0_0_10px_rgba(47,47,228,0.3)]">
              Luminous Skills Development <br className="hidden xl:block" /> Training Center
            </span>
            <span className="text-xl md:text-2xl font-normal text-gray-400">
               - এর সাথে
            </span>
          </h1>

          <p className="max-w-lg text-gray-500 text-base md:text-lg mb-10 leading-relaxed">
            আধুনিক প্রযুক্তির সাথে তাল মিলিয়ে নিজেকে দক্ষ করে তুলুন। প্রফেশনাল মেন্টরদের সাথে শিখুন ওয়েব ডেভেলপমেন্ট, ডিজাইন এবং আরও অনেক কিছু।
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12 w-full max-w-lg lg:max-w-none">
            {completionTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm group hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300">
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span className="text-gray-400 group-hover:text-white transition-colors text-[11px] font-medium text-center tracking-wide">
                    {type.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button className="group flex items-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#2F2FE4] text-white rounded-xl text-sm font-bold hover:bg-[#162E93] transition-all transform hover:-translate-y-0.5 active:scale-95">
              কোর্সগুলো দেখুন
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 border border-white/10 text-white rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
              ফ্রি সেমিনার
            </button>
          </div>
        </div>

        {/* ==========================================
            RIGHT SIDE: VISUAL MOCKUP & DASHBOARD
            ========================================== */}
        {/* mb-16 added here to provide space at the bottom on mobile */}
        <div className="relative flex justify-center items-center h-full mt-10 lg:mt-0 mb-16 lg:mb-0">
          
          <div className="relative w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#0c0e1f] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-float">
            
            <div className="flex items-center justify-between h-8 px-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
              </div>
              <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">luminous-dev-tools</div>
            </div>
            
            <div className="relative aspect-[16/10] w-full bg-[#080616] overflow-hidden">
              <img 
                src="https://i.ibb.co.com/DPYXYY4w/dashboard.png" 
                alt="Web Development Dashboard"
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none"></div>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-2 md:right-4 px-5 py-3 rounded-2xl border border-blue-500/30 bg-[#080616]/95 backdrop-blur-xl animate-float shadow-[0_10px_30px_rgba(47,47,228,0.2)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-blue-300 text-xs font-bold tracking-wider">Web Design & Development</span>
            </div>
          </div>

          <div className="absolute -top-6 left-4 md:-left-4 px-4 py-2.5 rounded-xl border border-green-500/20 bg-[#080616]/90 backdrop-blur-lg animate-float animation-delay-2000 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Live Mentoring</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Banner;

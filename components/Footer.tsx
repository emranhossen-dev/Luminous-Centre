"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Globe, MessageSquare, Users, Camera, Mail, Phone, MapPin, 
  Heart, ArrowRight, MessageCircle
} from "lucide-react";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Home', href: '/' },
        { name: 'সকল কোর্স', href: '/courses' },
        { name: 'সরকারি কোর্স', href: '/courses/govt' },
        { name: 'অনলাইন কোর্স', href: '/courses/online' },
        { name: 'আমাদের সম্পর্কে', href: '/about' },
        { name: 'যোগাযোগ', href: '/contact' },
    ];

    const socialLinks = [
        { icon: FacebookIcon, href: 'https://www.facebook.com/luminouscentree', label: 'Facebook' },
        { icon: YoutubeIcon, href: 'https://www.youtube.com/@Luminouscentreeee', label: 'YouTube' },
        { icon: MessageCircle, href: 'https://wa.me/8801577296272', label: 'WhatsApp' },
        { icon: Mail, href: 'mailto:luminouscentree@gmail.com', label: 'Email' },
    ];

    return (
        <footer className="bg-[#05060f] border-t border-white/10">
            {/* Main Footer Content */}
            <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center md:text-left">
                    
                    {/* Institute Information */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-3">
                            <Image
                                src="https://i.ibb.co.com/d063XCPx/logo.jpg"
                                alt="Luminous Skill Development Training Center Logo"
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain rounded-xl"
                            />
                            <div className="text-center md:text-left">
                                <h3 className="text-white font-bold text-lg">Luminous Skill Development</h3>
                                <p className="text-gray-400 text-sm">Training Center</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                            আধুনিক প্রযুক্তির সাথে তাল মিলিয়ে নিজেকে দক্ষ করে তুলুন। প্রফেশনাল মেন্টরদের সাথে শিখুন ওয়েব ডেভেলপমেন্ট, ডিজাইন এবং আরও অনেক কিছু।
                        </p>
                        
                        {/* Social Media Links */}
                        <div className="flex items-center justify-center gap-3 md:justify-start">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/40 transition-all duration-300 group cursor-pointer"
                                    >
                                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg mb-6">দ্রুত লিঙ্ক</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                                        style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                                    >
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm">{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Get In Touch */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg mb-6">যোগাযোগ করুন</h4>
                        <div className="space-y-4">
                            <a 
                              href="tel:+8801577296272"
                              className="flex flex-col md:flex-row md:items-start gap-3 text-center md:text-left group cursor-pointer"
                            >
                                <Phone className="w-5 h-5 text-blue-400 mt-0.5 shrink-0 mx-auto md:mx-0 group-hover:scale-110 transition-transform" />
                                <div>
                                    <p className="text-gray-500 text-xs">কল করুন</p>
                                    <p className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">+880 1577-296272</p>
                                </div>
                            </a>

                            <a 
                              href="https://wa.me/8801577296272"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col md:flex-row md:items-start gap-3 text-center md:text-left group cursor-pointer"
                            >
                                <MessageCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0 mx-auto md:mx-0 group-hover:scale-110 transition-transform" />
                                <div>
                                    <p className="text-gray-500 text-xs">WhatsApp</p>
                                    <p className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">+880 1577-296272</p>
                                </div>
                            </a>
                            
                            <a 
                              href="mailto:luminouscentree@gmail.com"
                              className="flex flex-col md:flex-row md:items-start gap-3 text-center md:text-left group cursor-pointer"
                            >
                                <Mail className="w-5 h-5 text-purple-400 mt-0.5 shrink-0 mx-auto md:mx-0 group-hover:scale-110 transition-transform" />
                                <div>
                                    <p className="text-gray-500 text-xs">ইমেইল করুন</p>
                                    <p className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors break-all">luminouscentree@gmail.com</p>
                                </div>
                            </a>
                            
                            <div className="flex flex-col md:flex-row md:items-start gap-3 text-center md:text-left">
                                <MapPin className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0 mx-auto md:mx-0" />
                                <div>
                                    <p className="text-gray-500 text-xs">ঠিকানা</p>
                                    <p className="text-white text-xs font-medium leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                                        ৮৫/১, রোড: ৪, মোহাম্মদিয়া হাউজিং লিমিটেড, মোহাম্মদপুর, ঢাকা-১২০৭
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg mb-6">নিউজলেটার</h4>
                        <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                            আমাদের সর্বশেষ কোর্স এবং আপডেট জানতে সাবস্ক্রাইব করুন
                        </p>
                        
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="আপনার ইমেল ঠিকানা"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                                    style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                                />
                            </div>
                            <button
                                className="w-full px-4 py-3 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer shadow-lg shadow-blue-900/30"
                                style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                            >
                                সাবস্ক্রাইব করুন
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-white/10">
                <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                            <span>© {currentYear} Luminous Skill Development Training Center.</span>
                            <span>সর্বস্বত্ব সংরক্ষিত।</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs">
                            <Link
                                href="/terms-of-service"
                                className="text-gray-400 hover:text-white transition-colors duration-300"
                            >
                                শর্তাবলী
                            </Link>
                            <span className="text-gray-600">|</span>
                            <Link
                                href="/privacy-policy"
                                className="text-gray-400 hover:text-white transition-colors duration-300"
                            >
                                গোপনীয়তা নীতি
                            </Link>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <span>তৈরি করেছে</span>
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                            <span>Luminous Team</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
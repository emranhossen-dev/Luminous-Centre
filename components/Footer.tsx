"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Globe, MessageSquare, Users, Camera, Mail, Phone, MapPin, 
  Heart, ArrowRight
} from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'হোম', href: '/' },
        { name: 'সকল কোর্স', href: '/courses' },
        { name: 'সরকারি কোর্স', href: '/courses/govt' },
        { name: 'অনলাইন কোর্স', href: '/courses/online' },
        { name: 'আমাদের সম্পর্কে', href: '/about' },
        { name: 'যোগাযোগ', href: '/contact' },
    ];

    const socialLinks = [
        { icon: Globe, href: '#', label: 'Website' },
        { icon: MessageSquare, href: '#', label: 'Twitter' },
        { icon: Users, href: '#', label: 'LinkedIn' },
        { icon: Camera, href: '#', label: 'Instagram' },
    ];

    return (
        <footer className="bg-[#05060f] border-t border-white/10">
            {/* Main Footer Content */}
            <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
                    
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
                                <p className="text-gray-400 text-md">Training Center</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
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
                                        aria-label={social.label}
                                        className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group"
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
                            <div className="flex flex-col md:flex-row md:items-start gap-3 text-center md:text-left">
                                <Phone className="w-5 h-5 text-blue-400 mt-0.5 shrink-0 mx-auto md:mx-0" />
                                <div>
                                    <p className="text-gray-400 text-sm">কল করুন</p>
                                    <p className="text-white text-sm font-medium">+880 1577-296272</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-start gap-3 text-center md:text-left">
                                <Mail className="w-5 h-5 text-blue-400 mt-0.5 shrink-0 mx-auto md:mx-0" />
                                <div>
                                    <p className="text-gray-400 text-sm">ইমেল করুন</p>
                                    <p className="text-white text-sm font-medium">luminous.bd25@gmail.com</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-start gap-3 text-center md:text-left">
                                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 shrink-0 mx-auto md:mx-0" />
                                <div>
                                    <p className="text-gray-400 text-sm">ভিজিট করুন</p>
                                    <p className="text-white text-sm font-medium">
                                        85/1, Road: 4, Mohammadia Housing Limited, Mohammadpur, Dhaka-1207
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg mb-6">নিউজলেটার</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            আমাদের সর্বশেষ কোর্স এবং অফার সম্পর্কে জানতে সাবস্ক্রাইব করুন
                        </p>
                        
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="আপনার ইমেল ঠিকানা"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                            <button
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
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
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span>© {currentYear} Luminous Skill Development Training Center.</span>
                            <span>সর্বস্বত্ব সংরক্ষিত।</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
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
                        
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span>তৈরি করেছে</span>
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                            <span>Luminous Team</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
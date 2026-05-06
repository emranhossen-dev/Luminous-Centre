"use client";

import React from 'react';
import { 
  Globe, 
  Mail, 
  Link as LinkIcon,
  // Use these modern replacements for the deprecated brand icons
  Video,     // For Youtube
  Camera,    // For Instagram
  MessageSquare // For Twitter/X (or use 'Bird' if your version still has it)
} from "lucide-react";

const Footer = () => {
    const socialLinks = [
        { icon: Globe, href: "#", label: "Website" },
        { icon: Mail, href: "#", label: "Email" },
        { icon: Camera, href: "#", label: "Instagram" }, // Replaced Instagram
        { icon: MessageSquare, href: "#", label: "Twitter" }, // Replaced Twitter
        { icon: Video, href: "#", label: "Youtube" }, // Replaced Youtube
        { icon: LinkIcon, href: "#", label: "Links" }
    ];

    return (
        <footer className="bg-[#080616] pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2F2FE4] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
                    <div className="md:col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <img 
                                src="https://i.ibb.co.com/d063XCPx/logo.jpg" 
                                alt="Logo" 
                                className="h-14 w-auto object-contain rounded-xl border border-white/10 shadow-2xl" 
                            />
                            <div className="leading-none">
                                <span className="text-2xl font-black tracking-tight text-white italic">LUMINOUS</span>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Skill Development Center</p>
                            </div>
                        </div>
                        <p className="text-gray-400 max-w-sm leading-relaxed text-sm font-medium">
                            The leading skill development training center dedicated to building the future of the digital workforce through practical, hands-on learning.
                        </p>
                        
                        <div className="flex gap-4">
                            {socialLinks.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.href}
                                    aria-label={item.label}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#2F2FE4] hover:text-white hover:border-[#2F2FE4] transition-all transform hover:-translate-y-1"
                                >
                                    <item.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 uppercase tracking-widest text-xs italic">Programs</h4>
                        <ul className="text-gray-500 space-y-4 text-sm font-bold">
                            <li className="hover:text-[#60a5fa] cursor-pointer transition-colors flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#2F2FE4]"></div> Recorded Sessions
                            </li>
                            <li className="hover:text-[#60a5fa] cursor-pointer transition-colors flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#2F2FE4]"></div> Live Workshops
                            </li>
                            <li className="hover:text-[#60a5fa] cursor-pointer transition-colors flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#2F2FE4]"></div> Campus Training
                            </li>
                            <li className="hover:text-[#60a5fa] cursor-pointer transition-colors flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#2F2FE4]"></div> Free Assets
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 uppercase tracking-widest text-xs italic">Support</h4>
                        <ul className="text-gray-500 space-y-4 text-sm font-bold">
                            <li className="hover:text-[#60a5fa] cursor-pointer transition-colors">Contact Us</li>
                            <li className="hover:text-[#60a5fa] cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-[#60a5fa] cursor-pointer transition-colors">Terms of Service</li>
                            <li className="hover:text-[#60a5fa] cursor-pointer transition-colors">Career Guidelines</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
                        © 2026 LUMINOUS SKILL DEVELOPMENT TRAINING CENTER. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
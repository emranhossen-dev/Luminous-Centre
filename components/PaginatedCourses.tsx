"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Users, Radio, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Updated Mock Data with Slugs that match your new dynamic route
const ALL_COURSES = [
    {
        id: 1,
        title: "AI-Ready MERN Stack Web Development",
        batch: "Batch-13",
        rating: 4.9,
        type: "Live",
        students: "248+",
        price: 8000,
        oldPrice: 10000,
        tag: "Online",
        slug: "mern-stack-development"
    },
    {
        id: 2,
        title: "Digital Marketing for Freelancing",
        batch: "Batch-12",
        rating: 4.8,
        type: "Live",
        students: "500+",
        price: 6000,
        oldPrice: 8000,
        tag: "Online",
        slug: "digital-marketing"
    },
    {
        id: 3,
        title: "Graphic Design & Branding",
        batch: "Batch-9",
        rating: 4.7,
        type: "Offline",
        students: "150+",
        price: 7000,
        oldPrice: 9000,
        tag: "Offline",
        slug: "graphic-design"
    },
    {
        id: 4,
        title: "Professional Accounting",
        batch: "Batch-4",
        rating: 4.8,
        type: "Live",
        students: "120+",
        price: 5000,
        oldPrice: 7500,
        tag: "Online",
        slug: "accounting"
    },
    {
        id: 5,
        title: "UI/UX Design Masterclass",
        batch: "Batch-2",
        rating: 4.9,
        type: "Live",
        students: "95+",
        price: 5500,
        oldPrice: 7000,
        tag: "Online",
        slug: "ui-ux-design"
    },
];

const ITEMS_PER_PAGE = 4;

export default function PaginatedCourses() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(ALL_COURSES.length / ITEMS_PER_PAGE);

    // Logic to slice the data for the current page
    const currentData = ALL_COURSES.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-12">
            {/* Course Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentData.map((course) => (
                    <div
                        key={course.id}
                        className="group bg-[#0c0e1f] border border-white/5 rounded-[2rem] overflow-hidden hover:border-[#2F2FE4]/50 transition-all duration-500 flex flex-col shadow-2xl"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                            <Image
                                src="https://i.ibb.co.com/35332p83/preview.png"
                                alt={course.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4 px-3 py-1 bg-[#2F2FE4] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                {course.tag}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-grow space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="px-3 py-1 bg-[#006a4e]/20 border border-[#006a4e]/30 rounded-md">
                                    <span className="text-[#22c55e] text-[10px] font-black uppercase italic tracking-tighter">
                                        {course.batch}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-white text-xs font-bold">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" /> {course.rating}
                                </div>
                            </div>

                            <h3 className="text-[15px] font-bold text-gray-100 leading-tight line-clamp-2 min-h-[2.5rem]">
                                {course.title}
                            </h3>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium">
                                    <Radio size={14} className="text-[#2F2FE4] animate-pulse" /> {course.type}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium">
                                    <Users size={14} /> {course.students}
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 pt-2">
                                <span className="text-2xl font-black text-white italic">{course.price} TK</span>
                                <span className="text-xs text-gray-600 line-through font-bold">{course.oldPrice}</span>
                            </div>

                            {/* Dynamic Link to the [slug] page */}
                            <Link
                                href={`/courses/${course.slug}`}
                                className="w-full py-4 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-2xl text-center text-sm font-black transition-all transform active:scale-95 flex items-center justify-center gap-2 group/btn"
                            >
                                View Details
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modern Pagination UI */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-10">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-11 h-11 rounded-xl font-black text-sm transition-all shadow-xl ${currentPage === i + 1
                                    ? "bg-[#2F2FE4] text-white ring-4 ring-[#2F2FE4]/20"
                                    : "border border-white/10 text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Lock, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Privacy Policy',
    template: '%s | LSDTC'
  },
};

const PrivacyPolicy = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#0b0c17] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">হোমে ফিরুন</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">গোপনীয়তা নীতি</h1>
              <p className="text-white/80 text-lg">Luminous Skill Development Training Center</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Last Updated */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-12">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-blue-300 font-medium">সর্বশেষ হালনাগাদ</p>
                <p className="text-gray-400 text-sm">জানুয়ারি ১, {currentYear}</p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-400" />
              ভূমিকা
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Luminous Skill Development Training Center-এ আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই গোপনীয়তা নীতি ব্যাখ্যা করে যে আমরা কিভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, এবং সুরক্ষা করি যখন আপনি আমাদের ওয়েবসাইট, মোবাইল অ্যাপ্লিকেশন, এবং অন্যান্য ডিজিটাল প্ল্যাটফর্ম ব্যবহার করেন।
              </p>
              <p>
                আমাদের প্ল্যাটফর্ম ব্যবহার করে, আপনি এই গোপনীয়তা নীতিতে বর্ণিত তথ্য সংগ্রহ এবং ব্যবহারের সাথে সম্মত হন।
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              আমরা কি তথ্য সংগ্রহ করি
            </h2>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">ব্যক্তিগত তথ্য</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>নাম, ইমেল ঠিকানা, ফোন নম্বর</li>
                  <li>ঠিকানা এবং যোগাযোগের তথ্য</li>
                  <li>জন্ম তারিখ এবং লিঙ্গ</li>
                  <li>শিক্ষাগত যোগ্যতা</li>
                  <li>পেশাগত তথ্য</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">আর্থিক তথ্য</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>পেমেন্ট কার্ড তথ্য (এনক্রিপ্টেড)</li>
                  <li>বিলিং ঠিকানা</li>
                  <li>ট্রানজেকশন ইতিহাস</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">প্রযুক্তিগত তথ্য</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IP ঠিকানা</li>
                  <li>ব্রাউজার টাইপ এবং ভার্সন</li>
                  <li>অপারেটিং সিস্টেম</li>
                  <li>ডিভাইস তথ্য</li>
                  <li>কুকিজ এবং অনুরূপ ট্র্যাকিং প্রযুক্তি</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">ব্যবহারের তথ্য</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>কোর্স এনরোলমেন্ট তথ্য</li>
                  <li>লার্নিং প্রোগ্রেস</li>
                  <li>কুইজ এবং অ্যাসাইনমেন্ট রেজাল্ট</li>
                  <li>ওয়েবসাইট ব্যবহারের প্যাটার্ন</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              আমরা কিভাবে তথ্য ব্যবহার করি
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>আমরা সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>আমাদের শিক্ষাগত সেবা প্রদান করতে</li>
                <li>কোর্স এনরোলমেন্ট এবং ম্যানেজমেন্ট করতে</li>
                <li>পেমেন্ট প্রক্রিয়া করতে</li>
                <li>সার্টিফিকেট ইস্যু করতে</li>
                <li>কাস্টমার সাপোর্ট প্রদান করতে</li>
                <li>আমাদের সেবা উন্নত করতে</li>
                <li>যোগাযোগ করতে (ইমেল, নিউজলেটার)</li>
                <li>নিরাপত্তা এবং ফ্রড প্রতিরোধ করতে</li>
                <li>আইনগত প্রয়োজনে মেনে চলতে</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              তথ্য শেয়ারিং
            </h2>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  আমরা তথ্য শেয়ার করি:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>আপনার সম্মতিতে</li>
                  <li>পেমেন্ট প্রসেসরদের সাথে (লেনদেনের জন্য)</li>
                  <li>আইন প্রয়োগকারী সংস্থার কাছে (আইনগত প্রয়োজনে)</li>
                  <li>ব্যবসায়িক অংশীদারদের সাথে (সীমিত পরিসরে)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  আমরা তথ্য শেয়ার করি না:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>তৃতীয় পক্ষের মার্কেটিং সংস্থার সাথে</li>
                  <li>অননুমোদিত ব্যক্তিদের সাথে</li>
                  <li>আপনার সম্মতি ছাড়া</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-400" />
              তথ্য নিরাপত্তা
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষার জন্য নিম্নলিখিত ব্যবস্থা গ্রহণ করেছি:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL এনক্রিপশন ডেটা ট্রান্সমিশনের জন্য</li>
                <li>সুরক্ষিত সার্ভার এবং হোস্টিং</li>
                <li>নিয়মিত সিকিউরিটি অডিট</li>
                <li>এমপ্লয়ি ট্রেনিং এবং পলিসি</li>
                <li>অ্যাক্সেস কন্ট্রোল এবং অথেনটিকেশন</li>
                <li>ডেটা ব্যাকআপ এবং রিকভারি সিস্টেম</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              কুকিজ এবং ট্র্যাকিং
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমরা কুকিজ এবং অনুরূপ ট্র্যাকিং প্রযুক্তি ব্যবহার করি:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ওয়েবসাইট কার্যকারিতা উন্নত করতে</li>
                <li>ইউজার পছন্দ মনে রাখতে</li>
                <li>অ্যানালিটিক্স এবং পারফরম্যান্স ট্র্যাকিং করতে</li>
                <li>পার্সোনালাইজড কন্টেন্ট প্রদান করতে</li>
              </ul>
              <p>
                আপনি আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন।
              </p>
            </div>
          </section>

          {/* User Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              আপনার অধিকার
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আপনার ব্যক্তিগত তথ্যের উপর আপনার নিম্নলিখিত অধিকার রয়েছে:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>অ্যাক্সেস:</strong> আপনার তথ্য দেখার অধিকার</li>
                <li><strong>সংশোধন:</strong> ভুল তথ্য সংশোধন করার অধিকার</li>
                <li><strong>মুছে ফেলা:</strong> আপনার তথ্য মুছে ফেলার অধিকার</li>
                <li><strong>প্রতিবাদ:</strong> তথ্য প্রক্রিয়াকরণের বিরুদ্ধে প্রতিবাদ করার অধিকার</li>
                <li><strong>পোর্টেবিলিটি:</strong> তথ্য ট্রান্সফার করার অধিকার</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              তথ্য সংরক্ষণ
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমরা আপনার ব্যক্তিগত তথ্য শুধুমাত্র প্রয়োজনীয় সময়ের জন্য সংরক্ষণ করি:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>অ্যাকাউন্ট তথ্য: অ্যাকাউন্ট সক্রিয় থাকাকালীন</li>
                <li>আর্থিক তথ্য: ৭ বছর পর্যন্ত (আইনগত প্রয়োজনে)</li>
                <li>কোর্স ডেটা: ৩ বছর পর্যন্ত</li>
                <li>অ্যানালিটিক্স ডেটা: ২ বছর পর্যন্ত</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              শিশুদের গোপনীয়তা
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমাদের সেবা ১৮ বছরের কম বয়সীদের জন্য নয়। আমরা ইচ্ছাকৃতভাবে ১৮ বছরের কম বয়সী শিশুদের থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। যদি আমরা জানতে পারি যে আমরা অনিচ্ছাকৃতভাবে একটি শিশুর তথ্য সংগ্রহ করেছি, আমরা সেই তথ্য অপসারণ করব।
              </p>
            </div>
          </section>

          {/* International Data Transfer */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              আন্তর্জাতিক তথ্য ট্রান্সফার
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আপনার ব্যক্তিগত তথ্য বাংলাদেশের বাইরে ট্রান্সফার করা হতে পারে যেখানে আমাদের সার্ভার বা তৃতীয় পক্ষের সার্ভিস প্রোভাইডার অবস্থিত। আমরা নিশ্চিত করি যে আন্তর্জাতিক তথ্য ট্রান্সফার প্রযোজ্য আইন অনুযায়ী সুরক্ষিত।
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-blue-400" />
              নীতিতে পরিবর্তন
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমরা যেকোনো সময় এই গোপনীয়তা নীতি আপডেট করার অধিকার সংরক্ষণ করি। উল্লেখযোগ্য পরিবর্তনগুলো আমাদের ওয়েবসাইটে পোস্ট করা হবে এবং ইমেলের মাধ্যমে আপনাকে জানানো হবে।
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              যোগাযোগের তথ্য
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="space-y-4 text-gray-300">
                <p>
                  এই গোপনীয়তা নীতি সম্পর্কে আপনার যেকোনো প্রশ্ন থাকলে, দয়া করে আমাদের সাথে যোগাযোগ করুন:
                </p>
                <div className="space-y-2">
                  <p><strong>ইমেল:</strong> privacy@luminous-skill.com</p>
                  <p><strong>ফোন:</strong> +৮৮০ ১৭১২-৩৪৫৬৭৮</p>
                  <p><strong>ঠিকানা:</strong> ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ</p>
                </div>
                <p className="text-sm text-gray-400">
                  আপনি আমাদের ডেটা প্রোটেকশন অফিসার (DPO) এর সাথেও যোগাযোগ করতে পারেন।
                </p>
              </div>
            </div>
          </section>

          {/* Agreement */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">চুক্তির সম্মতি</h3>
              <p className="text-gray-300 leading-relaxed">
                আমাদের প্ল্যাটফর্ম ব্যবহার করে, আপনি নিশ্চিত করছেন যে আপনি এই গোপনীয়তা নীতি পড়েছেন, বুঝেছেন, এবং এর দ্বারা আবদ্ধ হতে সম্মত হয়েছেন।
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

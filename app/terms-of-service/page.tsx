import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield, Users, AlertCircle, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Terms of Service',
    template: '%s | LSDTC'
  },
};

const TermsOfService = () => {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">শর্তাবলী</h1>
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
              <BookOpen className="w-6 h-6 text-blue-400" />
              ভূমিকা
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Luminous Skill Development Training Center-এ আপনাকে স্বাগতম। এই শর্তাবলী এবং শর্তাবলী ("শর্তাবলী") Luminous Skill Development Training Center ("আমরা", "আমাদের", "আমাদের") দ্বারা পরিচালিত ওয়েবসাইট, মোবাইল অ্যাপ্লিকেশন এবং অন্যান্য ডিজিটাল প্ল্যাটফর্ম (সম্মিলিতভাবে "প্ল্যাটফর্ম") ব্যবহারের শর্তাবলী নির্ধারণ করে।
              </p>
              <p>
                আমাদের প্ল্যাটফর্মে অ্যাক্সেস করে বা ব্যবহার করে, আপনি এই শর্তাবলী দ্বারা আবদ্ধ হতে সম্মত হন। আপনি যদি এই শর্তাবলীর সাথে একমত না হন, তবে আমাদের প্ল্যাটফর্ম ব্যবহার করবেন না।
              </p>
            </div>
          </section>

          {/* Services */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              আমাদের সেবাসমূহ
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Luminous Skill Development Training Center নিম্নলিখিত ধরনের শিক্ষাগত সেবা প্রদান করে:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>অনলাইন লাইভ কোর্স</li>
                <li>প্রি-রেকর্ডেড ভিডিও কোর্স</li>
                <li>অফলাইন ক্লাসরুম ট্রেনিং</li>
                <li>সরকারি প্রকল্প ভিত্তিক প্রশিক্ষণ</li>
                <li>ওয়ার্কশপ এবং সেমিনার</li>
                <li>ক্যারিয়ার কাউন্সেলিং</li>
                <li>সার্টিফিকেশন প্রোগ্রাম</li>
              </ul>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              ব্যবহারকারীর দায়িত্ব
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমাদের প্ল্যাটফর্ম ব্যবহার করার সময়, আপনি সম্মত হন যে আপনি:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>সঠিক এবং সম্পূর্ণ তথ্য প্রদান করবেন</li>
                <li>আপনার অ্যাকাউন্টের নিরাপত্তা রক্ষা করবেন</li>
                <li>অন্য ব্যবহারকারীদের সাথে সম্মানজনক আচরণ করবেন</li>
                <li>কোর্স মেটেরিয়ালস অননুমোদিতভাবে বিতরণ করবেন না</li>
                <li>আমাদের ইন্টেলেকচুয়াল প্রপার্টি সম্মান করবেন</li>
                <li>কোনো অবৈধ বা অননুমোদিত কার্যকলাপে জড়িত থাকবেন না</li>
              </ul>
            </div>
          </section>

          {/* Payment and Fees */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              পেমেন্ট এবং ফি
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                কোর্স ফি এবং পেমেন্টের শর্তাবলী:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>সমস্ত কোর্স ফি নির্দিষ্ট সময়ের মধ্যে পরিশোধ করতে হবে</li>
                <li>ফি পরিশোধের জন্য আমরা বিভিন্ন পেমেন্ট গেটওয়ে সমর্থন করি</li>
                <li>কোর্স শুরুর আগে রিফান্ড নীতি প্রযোজ্য হতে পারে</li>
                <li>কোর্স শুরুর পরে ফি ফেরতযোগ্য নয়</li>
                <li>ইনস্টলমেন্ট পেমেন্ট অপশন নির্দিষ্ট কোর্সের জন্য উপলব্ধ</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              ইন্টেলেকচুয়াল প্রপার্টি
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমাদের প্ল্যাটফর্মের সমস্ত কন্টেন্ট, যার মধ্যে রয়েছে:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>কোর্স মেটেরিয়ালস এবং ভিডিও লেকচার</li>
                <li>টেক্সট, গ্রাফিক্স, লোগো, এবং ইমেজ</li>
                <li>সফটওয়্যার এবং টুলস</li>
                <li>ওয়েবসাইট ডিজাইন এবং লেআউট</li>
              </ul>
              <p>
                এগুলো Luminous Skill Development Training Center-এর সম্পত্তি এবং কপিরাইট, ট্রেডমার্ক, এবং অন্যান্য ইন্টেলেকচুয়াল প্রপার্টি আইন দ্বারা সুরক্ষিত।
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              গোপনীয়তা
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। আমরা কিভাবে আপনার তথ্য সংগ্রহ, ব্যবহার, এবং সুরক্ষা করি তা জানতে আমাদের <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">গোপনীয়তা নীতি</Link> পড়ুন।
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-blue-400" />
              দায়বদ্ধতার সীমাবদ্ধতা
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Luminous Skill Development Training Center-এর দায়বদ্ধতা সর্বোচ্চ আপনার প্রদত্ত কোর্স ফি পর্যন্ত সীমাবদ্ধ থাকবে। আমরা পরোক্ষ, আনুষঙ্গিক, বা ফলস্বরূপ ক্ষতির জন্য দায়ী থাকব না।
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-blue-400" />
              চুক্তির সমাপ্তি
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমরা যেকোনো সময় আমাদের বিবেচনার ভিত্তিতে আপনার অ্যাকাউন্ট স্থগিত বা বন্ধ করার অধিকার সংরক্ষণ করি, বিশেষ করে যদি আপনি এই শর্তাবলী লঙ্ঘন করেন।
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              শর্তাবলীতে পরিবর্তন
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                আমরা যেকোনো সময় এই শর্তাবলী আপডেট করার অধিকার সংরক্ষণ করি। পরিবর্তনগুলো আমাদের ওয়েবসাইটে পোস্ট করার পর কার্যকর হবে।
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
                  এই শর্তাবলী সম্পর্কে আপনার যেকোনো প্রশ্ন থাকলে, দয়া করে আমাদের সাথে যোগাযোগ করুন:
                </p>
                <div className="space-y-2">
                  <p><strong>ইমেল:</strong> info@luminous-skill.com</p>
                  <p><strong>ফোন:</strong> +৮৮০ ১৭১২-৩৪৫৬৭৮</p>
                  <p><strong>ঠিকানা:</strong> ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ</p>
                </div>
              </div>
            </div>
          </section>

          {/* Agreement */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">চুক্তির সম্মতি</h3>
              <p className="text-gray-300 leading-relaxed">
                আমাদের প্ল্যাটফর্ম ব্যবহার করে, আপনি নিশ্চিত করছেন যে আপনি এই শর্তাবলী পড়েছেন, বুঝেছেন, এবং এর দ্বারা আবদ্ধ হতে সম্মত হয়েছেন।
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

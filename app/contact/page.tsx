"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, Mail, MapPin, Clock, Send, MessageSquare, 
  CheckCircle2, Loader2, Globe, HelpCircle, ChevronDown, ChevronUp,
  MessageCircle, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const FAQS = [
  {
    q: "সরকারি আইটি প্রজেক্টে (NSDA/ASSETS) কীভাবে ভর্তি হব?",
    a: "আমাদের ওয়েবসাইটের Apply link-এ গিয়ে অথবা সরাসরি আমাদের মোহাম্মদপুর অফিসে এসে আবেদন ফরম পূরণ করতে পারবেন। বাছাই প্রক্রিয়ার মাধ্যমে নির্বাচিতদের মেসেজের মাধ্যমে জানানো হয়।"
  },
  {
    q: "পেইড কোর্সের ফি কীভাবে প্রদান করব?",
    a: "পেইড কোর্সের ক্ষেত্রে bKash, Nagad, ব্যাংক ট্রান্সফার বা সরাসরি অফিসে এসে প্রথম কিস্তি বা নগদ ফি পরিশোধ করে ভর্তি সম্পন্ন করতে পারবেন।"
  },
  {
    q: "ক্লাসগুলো কি অনলাইন নাকি অফলাইন?",
    a: "আমাদের অফলাইন (ল্যাবভিত্তিক), অনলাইন (লাইভ জুম ক্লাস) এবং রেকর্ডেড—তিন ধরণের কোর্সই এভেলেবল আছে। আপনি সুবিধামত সিলেক্ট করতে পারবেন।"
  },
  {
    q: "কোর্স শেষে কি সার্টিফাইড করা হবে?",
    a: "হ্যাঁ, ৮০% উপস্থিতি এবং প্রজেক্ট সাবমিট করা সম্পন্ন হলে লুমিনাস সেন্টার থেকে প্রফেশনাল সার্টিফিকেট প্রদান করা হয়। NSDA সরকারি কোর্সে মিলবে সরকারি সার্টিফিকেট।"
  },
  {
    q: "ক্লাসের বাইরের সময়ে কোনো সাপোর্ট পাওয়া যাবে?",
    a: "হ্যাঁ! আমাদের মেন্টরগণ ক্লাসের বাইরেও ডেডিকেটেড ডিসকর্ড/ফেসবুক সাপোর্ট গ্রুপে ১:১ প্রশ্নের উত্তর ও টেকনিক্যাল হেল্প দিয়ে থাকেন।"
  }
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: 'course-inquiry', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error('নাম, ফোন নম্বর ও বার্তা অবশ্যই প্রদান করুন');
      return;
    }
    setSending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setSent(true);
        toast.success('আপনার বার্তা সফলভাবে পাঠানো হয়েছে!');
        setForm({ name: '', phone: '', email: '', subject: 'course-inquiry', message: '' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'বার্তা পাঠানো সম্ভব হয়নি।');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি! আবার চেষ্টা করুন।');
    } finally {
      setSending(false);
    }
  };


  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#05060f] text-white">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/6 rounded-full blur-[130px]" />
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#60a5fa] text-xs font-bold uppercase tracking-[0.2em]">
            <MessageSquare size={14} />
            Contact LSDTC
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
            যোগাযোগ ও{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
              পরামর্শ
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            যেকোনো তথ্য, ভর্তি সহায়তা বা প্রশ্নের জন্য সরাসরি কল করুন, ইমেইল করুন অথবা অফিসে চলে আসুন।
          </p>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: MapPin,
              title: "ক্যাম্পাস ঠিকানা",
              value: "৮৫/১, রোড: ৪, মোহাম্মদিয়া হাউজিং লিমিটেড",
              desc: "মোহাম্মদপুর, ঢাকা-১২০৭",
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
              href: undefined,
            },
            {
              icon: Phone,
              title: "ফোন নম্বর",
              value: "+880 1577-296272",
              desc: "সরাসরি ফোনকল করুন",
              color: "text-green-400",
              bg: "bg-green-500/10 border-green-500/20",
              href: "tel:+8801577296272",
            },
            {
              icon: MessageCircle,
              title: "WhatsApp সাপোর্ট",
              value: "+880 1577-296272",
              desc: "মেসেজ পাঠাতে ক্লিক করুন",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
              href: "https://wa.me/8801577296272",
            },
            {
              icon: Mail,
              title: "ইমেইল অ্যাড্রেস",
              value: "luminouscentree@gmail.com",
              desc: "ইমেইল পাঠাতে ক্লিক করুন",
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
              href: "mailto:luminouscentree@gmail.com",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            const Card = (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group h-full">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${item.bg} group-hover:scale-105 transition-transform`}>
                  <Icon size={20} className={item.color} />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                  {item.title}
                </h3>
                <p className="text-white font-bold text-sm md:text-base mb-1 break-all group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                  {item.value}
                </p>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            );

            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="block h-full cursor-pointer">
                    {Card}
                  </a>
                ) : Card}
              </motion.div>
            );
          })}
        </div>

        {/* Main Content: Form & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start mb-16">
          
          {/* Left 3 cols: Detailed Contact Form */}
          <div className="lg:col-span-3 bg-[#0c0e1f] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
              সরাসরি বার্তা পাঠান
            </h2>
            <p className="text-gray-400 text-sm mb-8" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
              নিচের ফর্মটি পূরণ করে আপনার বার্তা পাঠান। আমাদের টিম শীঘ্রই যোগাযোগ করবে।
            </p>

            {sent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <h3 className="text-2xl font-black text-white">ধন্যবাদ! বার্তাটি পাঠানো হয়েছে।</h3>
                <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                  আমরা অতি দ্রুত আপনার প্রদত্ত ফোন নম্বর বা ইমেইলে যোগাযোগ করব।
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/10 cursor-pointer"
                >
                  আরেকটি বার্তা পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="আপনার পূর্ণ নাম"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="01577-296272"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                      ইমেইল (যদি থাকে)
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="luminouscentree@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      যোগাযোগের কারণ
                    </label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                      style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                    >
                      <option value="course-inquiry" className="bg-[#0c0e1f]">পেইড কোর্স সংক্রান্ত তথ্য</option>
                      <option value="govt-project" className="bg-[#0c0e1f]">সরকারি প্রজেক্ট (NSDA/ASSETS)</option>
                      <option value="admission" className="bg-[#0c0e1f]">ভর্তি প্রক্রিয়া</option>
                      <option value="seminar" className="bg-[#0c0e1f]">ফ্রি সেমিনার</option>
                      <option value="other" className="bg-[#0c0e1f]">অন্যান্য</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                    আপনার মন্তব্য / প্রশ্ন *
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="আপনার প্রশ্ন বিস্তারিত লিখুন..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                    style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#2F2FE4] hover:bg-[#162E93] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-900/30"
                  style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                >
                  {sending ? <><Loader2 size={18} className="animate-spin" /> সাবমিট হচ্ছে...</> : <><Send size={18} /> মেসেজ পাঠান</>}
                </button>
              </form>
            )}
          </div>

          {/* Right 2 cols: Map & Direct Quick Connect */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Action Box */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/20 via-[#0c0e1f] to-purple-900/20 border border-blue-500/20 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">সরাসরি কথা বলুন</h3>
                  <p className="text-gray-400 text-xs">আমাদের কাউন্সিলরের সাথে</p>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                কোর্সের বিষয়ে যেকোনো তথ্যের জন্য সরাসরি কল করতে পারেন অথবা WhatsApp-এ মেসেজ দিতে পারেন।
              </p>
              <div className="space-y-3 pt-2">
                <a
                  href="tel:+8801577296272"
                  className="flex items-center justify-center gap-2 py-3.5 bg-[#00a651] hover:bg-[#008f45] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-green-900/30"
                >
                  <Phone size={16} /> কল করুন: +880 1577-296272
                </a>
                <a
                  href="https://wa.me/8801577296272"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
                >
                  <MessageCircle size={16} className="text-green-400" /> WhatsApp মেসেজ পাঠান
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[4/3] bg-white/5">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.635423777835!2d90.35417967479228!3d23.760376888394337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf004c5b2889%3A0xb1b46f31c3c2b620!2sLuminous%20Skill%20Development%20Training%20Centre!5e0!3m2!1sen!2sbd!4v1786465046887!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Luminous Skill Development Training Centre Map Location"
              />

            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
              <HelpCircle size={14} /> FAQ
            </div>
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
              সাধারণ জিজ্ঞাসাসমূহ
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer gap-4"
                  >
                    <span className="font-bold text-white text-base" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={18} className="text-blue-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-gray-400 text-sm leading-relaxed border-t border-white/5" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

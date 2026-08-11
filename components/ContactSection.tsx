"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Phone, Mail, MapPin, Clock, 
  CheckCircle2, Loader2, MessageSquare, MessageCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error('নাম, ফোন নম্বর ও বার্তা অবশ্যই দিতে হবে।');
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
        toast.success('আপনার বার্তা সফলভাবে পাঠানো হয়েছে! এডমিন শীঘ্রই যোগাযোগ করবে।');
        setForm({ name: '', phone: '', email: '', subject: '', message: '' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'বার্তা পাঠাতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      toast.error('নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setSending(false);
    }
  };


  const CONTACT_INFO = [
    {
      icon: MapPin,
      label: "ঠিকানা",
      value: "৮৫/১, রোড: ৪, মোহাম্মদিয়া হাউজিং লিমিটেড, মোহাম্মদপুর, ঢাকা-১২০৭",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      href: undefined,
    },
    {
      icon: Phone,
      label: "ফোনকল",
      value: "+880 1577-296272",
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
      href: "tel:+8801577296272",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "+880 1577-296272",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      href: "https://wa.me/8801577296272",
    },
    {
      icon: Mail,
      label: "ইমেইল",
      value: "luminouscentree@gmail.com",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      href: "mailto:luminouscentree@gmail.com",
    },
  ];

  return (
    <section id="contact" className="relative w-full overflow-hidden py-10 lg:py-14">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c17] via-[#080616] to-[#05060f] z-0" />
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-[-5%] w-[30%] h-[50%] bg-blue-600/8 rounded-full blur-[110px] -translate-y-1/2 animate-blob" />
        <div className="absolute top-1/2 right-[-5%] w-[25%] h-[40%] bg-purple-600/6 rounded-full blur-[100px] -translate-y-1/2 animate-blob animation-delay-2000" />
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-3">
            <MessageSquare size={12} /> যোগাযোগ করুন
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">
            আমাদের সাথে{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">
              কথা বলুন
            </span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            কোর্স সম্পর্কে জানতে, ভর্তির বিষয়ে সিদ্ধান্ত নিতে বা যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-stretch">

          {/* LEFT: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 flex flex-col justify-between space-y-4 h-full"
          >
            <div className="space-y-3">
              {CONTACT_INFO.map((info, idx) => {
                const Icon = info.icon;
                const Content = (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${info.bg} group-hover:scale-105 transition-transform`}>
                      <Icon size={18} className={info.color} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                        {info.label}
                      </div>
                      <div className="text-white font-medium text-xs md:text-sm break-all group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                        {info.value}
                      </div>
                    </div>
                  </div>
                );

                return info.href ? (
                  <a key={idx} href={info.href} target={info.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="block cursor-pointer">
                    {Content}
                  </a>
                ) : (
                  <div key={idx}>{Content}</div>
                );
              })}
            </div>

            {/* Map embed */}
            <div className="rounded-2xl overflow-hidden border border-white/5 flex-1 min-h-[200px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.635423777835!2d90.35417967479228!3d23.760376888394337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf004c5b2889%3A0xb1b46f31c3c2b620!2sLuminous%20Skill%20Development%20Training%20Centre!5e0!3m2!1sen!2sbd!4v1786465046887!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Luminous Skill Development Training Centre Location"
              />

            </div>
          </motion.div>

          {/* RIGHT: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 h-full flex flex-col"
          >
            <div className="bg-[#0c0e1f] border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl h-full flex flex-col justify-between">
              {sent ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-white text-xl font-black">বার্তা পাঠানো হয়েছে!</h3>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                    আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-all cursor-pointer"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-white font-black text-xl mb-4" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                    বার্তা পাঠান
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                        আপনার নাম *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="আপনার পূর্ণ নাম"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                        style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                        ফোন নম্বর *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="01577-296272"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block">
                      ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="luminouscentree@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      বিষয়
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                      style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                    >
                      <option value="" className="bg-[#0c0e1f]">বিষয় নির্বাচন করুন</option>
                      <option value="course-inquiry" className="bg-[#0c0e1f]">কোর্স সম্পর্কে জানতে চাই</option>
                      <option value="govt-project" className="bg-[#0c0e1f]">সরকারি প্রকল্প (NSDA) সম্পর্কে</option>
                      <option value="admission" className="bg-[#0c0e1f]">ভর্তির বিষয়ে</option>
                      <option value="other" className="bg-[#0c0e1f]">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                      আপনার বার্তা *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="আপনার প্রশ্ন বা মন্তব্য লিখুন..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                      style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2F2FE4] hover:bg-[#162E93] disabled:opacity-60 text-white rounded-xl font-black text-sm transition-all transform active:scale-95 shadow-lg shadow-blue-900/30 cursor-pointer"
                    style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                  >
                    {sending ? (
                      <><Loader2 size={18} className="animate-spin" /> পাঠানো হচ্ছে...</>
                    ) : (
                      <><Send size={18} /> বার্তা পাঠান</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

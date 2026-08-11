'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, Calendar, Trash2, CheckCircle2, 
  Circle, Search, Filter, RefreshCw, User, MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '@/components/AdminLayout';

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        toast.error('মেসেজ ডাটা লোড করতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('নেটওয়ার্ক ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (msg: ContactMessage) => {
    try {
      const newStatus = !msg.is_read;
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, is_read: newStatus })
      });

      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: newStatus } : m));
        if (selectedMessage?.id === msg.id) {
          setSelectedMessage(prev => prev ? { ...prev, is_read: newStatus } : null);
        }
        toast.success(newStatus ? 'মেসেজটি পঠিত (Read) হিসেবে চিহ্নিত করা হয়েছে' : 'মেসেজটি অপঠিত (Unread) করা হয়েছে');
      }
    } catch (err) {
      toast.error('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মেসেজটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
        toast.success('মেসেজটি মুছে ফেলা হয়েছে');
      } else {
        toast.error('মেসেজ মোছা সম্ভব হয়নি');
      }
    } catch (err) {
      toast.error('ত্রুটি ঘটেছে');
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.phone.includes(search) ||
      (msg.email && msg.email.toLowerCase().includes(search.toLowerCase())) ||
      msg.message.toLowerCase().includes(search.toLowerCase());
    
    if (filterRead === 'unread') return matchesSearch && !msg.is_read;
    if (filterRead === 'read') return matchesSearch && msg.is_read;
    return matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0e1f] p-6 rounded-2xl border border-white/10 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">ব্যবহারকারীদের বার্তা (User Messages)</h1>
                <p className="text-xs text-gray-400">ওয়েবসাইট থেকে আসা প্রশ্ন ও বার্তার তালিকা</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              অপঠিত: {unreadCount} টি
            </span>
            <button
              onClick={fetchMessages}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0c0e1f] p-4 rounded-2xl border border-white/10">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম, ফোন বা বার্তা দিয়ে খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRead}
              onChange={e => setFilterRead(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              <option value="all" className="bg-[#0c0e1f]">সকল বার্তা ({messages.length})</option>
              <option value="unread" className="bg-[#0c0e1f]">অপঠিত বার্তা ({unreadCount})</option>
              <option value="read" className="bg-[#0c0e1f]">পঠিত বার্তা ({messages.length - unreadCount})</option>
            </select>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Messages List (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-20 text-center text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">লোড হচ্ছে...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center bg-[#0c0e1f] rounded-2xl border border-white/10 text-gray-400 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                <p className="font-bold text-sm">কোনো বার্তা পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredMessages.map(msg => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.is_read) toggleReadStatus(msg);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 shadow-lg'
                        : msg.is_read
                        ? 'bg-[#0c0e1f]/60 border-white/5 hover:border-white/20'
                        : 'bg-[#0c0e1f] border-blue-500/30 hover:border-blue-500/50'
                    }`}
                  >
                    {!msg.is_read && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    )}

                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-white text-sm truncate">{msg.name}</h4>
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {new Date(msg.created_at).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs text-blue-400 font-medium mb-1 truncate">📞 {msg.phone}</p>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{msg.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Message Detail View (7 cols) */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="bg-[#0c0e1f] rounded-2xl border border-white/10 p-6 shadow-2xl space-y-6 sticky top-24">
                
                {/* Header & Actions */}
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedMessage.is_read ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {selectedMessage.is_read ? 'পঠিত (Read)' : 'অপঠিত (Unread)'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(selectedMessage.created_at).toLocaleString('bn-BD')}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white">{selectedMessage.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReadStatus(selectedMessage)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
                      title={selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {selectedMessage.is_read ? <Circle className="w-4 h-4 text-gray-400" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </button>
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Meta info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">মোবাইল নম্বর</p>
                    <a href={`tel:${selectedMessage.phone}`} className="text-sm font-bold text-green-400 hover:underline flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {selectedMessage.phone}
                    </a>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">ইমেইল অ্যাড্রেস</p>
                    {selectedMessage.email ? (
                      <a href={`mailto:${selectedMessage.email}`} className="text-sm font-bold text-purple-400 hover:underline flex items-center gap-1.5 break-all">
                        <Mail className="w-3.5 h-3.5" /> {selectedMessage.email}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">প্রদান করা হয়নি</span>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">বার্তা বিবরণী:</p>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Quick Reply CTA */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00a651] hover:bg-[#008f45] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" /> সরাসরী কল করুন
                  </a>
                  <a
                    href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp চ্যাট
                  </a>
                </div>

              </div>
            ) : (
              <div className="bg-[#0c0e1f] rounded-2xl border border-white/10 p-12 text-center text-gray-500 space-y-3">
                <Mail className="w-12 h-12 mx-auto text-gray-600" />
                <h3 className="text-white font-bold text-base">একটি বার্তা নির্বাচন করুন</h3>
                <p className="text-xs text-gray-400">বাম পাশের তালিকা থেকে যেকোনো বার্তার উপর ক্লিক করে বিস্তারিত দেখুন।</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

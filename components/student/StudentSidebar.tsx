import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Video, 
  BookOpen, 
  PlayCircle, 
  FolderOpen, 
  FileText,
  ChevronRight,
  User,
  HelpCircle,
  X
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/student' },
  { id: 'class-joining', label: 'Class Joining', icon: Video, href: '/student/class-joining' },
  { id: 'my-courses', label: 'My Courses', icon: BookOpen, href: '/student/my-courses' },
  { id: 'recording', label: 'Recording', icon: PlayCircle, href: '/student/recording' },
  { id: 'resources', label: 'Resources', icon: FolderOpen, href: '/student/resources' },
  { id: 'assignments', label: 'Assignments', icon: FileText, href: '/student/assignments' },
  { id: 'quiz', label: 'Quiz / Assessments', icon: HelpCircle, href: '/student/quiz' },
  { id: 'build-my-cv', label: 'Build My CV', icon: FileText, href: '/student/build-my-cv' },
  { id: 'profile', label: 'My Profile', icon: User, href: '/student/profile' },
];

interface StudentSidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function StudentSidebar({
  activeTab,
  setActiveTab,
  isOpen = false,
  onClose
}: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={`w-72 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-white/5 fixed lg:relative lg:translate-x-0 top-0 left-0 z-50 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Institute Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 mb-4 shrink-0">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-500/20 group-hover:border-emerald-500/40 transition-all shrink-0">
            <img src="/logo.jpg" alt="Luminous Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Luminous SDTC</h1>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">Training Centre</p>
          </div>
        </div>
        
        {/* Close Button for Mobile Drawer */}
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto overscroll-contain custom-scrollbar pb-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname === '/student' && item.id === 'dashboard');
          const Icon = item.icon;

          const handleClick = () => {
            if (onClose) onClose();
          };

          return (
            <Link key={item.id} href={item.href} onClick={handleClick}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' 
                    : 'hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

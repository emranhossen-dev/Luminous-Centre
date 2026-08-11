import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  RefreshCcw, 
  HelpCircle, 
  FileText, 
  Settings,
  Shield,
  PhoneCall,
  User,
  GraduationCap,
  Camera,
  Building2,
  MessageSquareQuote,
  Mail
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
}

export const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard Access', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'messages', label: 'User Messages', icon: Mail, href: '/admin/messages' },
  { id: 'courses', label: 'Course Management', icon: BookOpen, href: '/admin/courses' },
  { id: 'students', label: 'Student Management', icon: Users, href: '/admin/students' },
  { id: 'mentors', label: 'Mentor Management', icon: GraduationCap, href: '/admin/mentors' },
  { id: 'seminar', label: 'Seminar Applications', icon: PhoneCall, href: '/admin/seminar' },
  { id: 'enrollments', label: 'Enrollments', icon: Users, href: '/admin/enrollments' },
  { id: 'gallery', label: 'Gallery Management', icon: Camera, href: '/admin/gallery' },
  { id: 'partners', label: 'Trusted Partners', icon: Building2, href: '/admin/partners' },
  { id: 'testimonials', label: 'Student Feedback', icon: MessageSquareQuote, href: '/admin/testimonials' },

  { id: 'staff', label: 'Staff Management', icon: Shield, href: '/admin/staff' },
  { id: 'cycles', label: 'Academic Cycles', icon: RefreshCcw, href: '/admin/cycles' },
  { id: 'quizzes', label: 'Quiz Center', icon: HelpCircle, href: '/admin/quizzes' },
  { id: 'assignments', label: 'Assignments', icon: FileText, href: '/admin/assignments' },
  { id: 'settings', label: 'Platform Settings', icon: Settings, href: '/admin/settings' },
  { id: 'profile', label: 'My Profile', icon: User, href: '/admin/profile' },
];



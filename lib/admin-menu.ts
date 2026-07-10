import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  RefreshCcw, 
  HelpCircle, 
  FileText, 
  Settings,
  Shield,
  PhoneCall
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
}

export const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard Access', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'courses', label: 'Course Management', icon: BookOpen, href: '/admin/courses' },
  { id: 'students', label: 'Student Management', icon: Users, href: '/admin/students' },
  { id: 'seminar', label: 'Seminar Applications', icon: PhoneCall, href: '/admin/seminar' },
  { id: 'enrollments', label: 'Enrollments', icon: Users, href: '/admin/enrollments' },
  { id: 'staff', label: 'Staff Management', icon: Shield, href: '/admin/staff' },
  { id: 'cycles', label: 'Academic Cycles', icon: RefreshCcw, href: '/admin/cycles' },
  { id: 'quizzes', label: 'Quiz Center', icon: HelpCircle, href: '/admin/quizzes' },
  { id: 'assignments', label: 'Assignments', icon: FileText, href: '/admin/assignments' },
  { id: 'settings', label: 'Platform Settings', icon: Settings, href: '/admin/settings' },
];

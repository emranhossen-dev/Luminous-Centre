"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { 
  BookOpen, Users, Award, FileText, Plus, CheckCircle, XCircle, 
  Search, Eye, Settings, HelpCircle, ChevronRight, LogOut, Loader2, Save,
  PlayCircle, Sun, Moon, User, Menu, X, Bell, Sparkles, Copy, Download
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MentorRecordings from '@/components/mentor/MentorRecordings';
import MentorAssignments from '@/components/mentor/MentorAssignments';
import ProfileComponent from '@/components/ProfileComponent';
import MentorCurriculumVideos from '@/components/mentor/MentorCurriculumVideos';

interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  price: number;
  enrolledStudents: number;
  thumbnailUrl?: string | null;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  progress: number;
  courseTitle: string;
  enrolledAt: string;
}

interface Quiz {
  id: string;
  title: string;
  slug: string;
  description: string;
  courseId: number;
  courseTitle: string;
  duration: number;
  passingScore: number;
  status: string;
  questionsCount: number;
}

interface QuizAttempt {
  id: string;
  studentName: string;
  studentEmail: string;
  quizTitle: string;
  courseTitle: string;
  score: number;
  totalMarks: number;
  passed: boolean;
  submittedAt: string;
}

interface Question {
  id?: string;
  question: string;
  questionType: string;
  marks: number;
  explanation: string;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
}

export default function MentorDashboard({ params }: { params: Promise<{ tab?: string[] }> }) {
  const resolvedParams = React.use(params);
  const tabParam = resolvedParams.tab?.[0] || 'overview';
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [mentorUser, setMentorUser] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("light", savedTheme === "light");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
    // Load mentor info
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setMentorUser(JSON.parse(userStr)); } catch {}
    }
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadNotifications(data.unreadCount || 0);
        setNotificationsList(data.notifications || []);
      }
    } catch {}
  };


  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  const [activeTab, rawSetActiveTab] = useState<'overview' | 'courses' | 'students' | 'quizzes' | 'attempts' | 'recordings' | 'assignments' | 'profile'>(tabParam as any);

  useEffect(() => {
    if (tabParam) {
      rawSetActiveTab(tabParam as any);
    }
  }, [tabParam]);

  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/');
      const tabFromPath = parts[2];
      if (tabFromPath) {
        rawSetActiveTab(tabFromPath as any);
      } else {
        rawSetActiveTab('overview');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const setActiveTab = (tab: any) => {
    rawSetActiveTab(tab);
    localStorage.setItem('mentorActiveTab', tab);
    const path = tab === 'overview' ? '/mentor' : `/mentor/${tab}`;
    window.history.pushState(null, '', path);
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCurriculumCourse, setSelectedCurriculumCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalAttempts: 0
  });
  // Modal states
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [questionsList, setQuestionsList] = useState<any[]>([]);

  const openQuestionModal = async (quiz: any) => {
    setSelectedQuiz(quiz);
    setIsQuestionModalOpen(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mentor/quizzes/${quiz.id}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.questions || [];
        if (list.length === 0) {
          list.push({
            question: '',
            questionType: 'mcq',
            marks: 1.0,
            explanation: '',
            options: [
              { optionText: '', isCorrect: true },
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false }
            ]
          });
        }
        setQuestionsList(list);
      } else {
        setQuestionsList([]);
      }
    } catch (e) {
      console.error(e);
      setQuestionsList([]);
    } finally {
      setLoading(false);
    }
  };

  const parseBulkQuestions = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            question: item.question || 'Untitled Question',
            questionType: item.questionType || 'mcq',
            marks: Number(item.marks || 1.0),
            explanation: item.explanation || '',
            options: (item.options || []).map((o: any) => ({
              optionText: typeof o === 'string' ? o : (o.optionText || o.text || ''),
              isCorrect: typeof o === 'string' ? false : Boolean(o.isCorrect || o.correct)
            }))
          }));
        }
      } catch (e) {
        throw new Error('Invalid JSON format: ' + (e as Error).message);
      }
    }

    // Parse custom Text Format
    const questions: any[] = [];
    const blocks = trimmed.split(/(?:\r?\n){2,}/); // split by blank lines
    
    for (const block of blocks) {
      if (!block.trim()) continue;
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let questionText = '';
      const options: any[] = [];
      let explanation = '';
      let marks = 1.0;

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith('question:') || lower.startsWith('q:')) {
          questionText = line.replace(/^(question:|q:)\s*/i, '').trim();
        } else if (lower.startsWith('explanation:')) {
          explanation = line.replace(/^explanation:\s*/i, '').trim();
        } else if (lower.startsWith('marks:')) {
          marks = parseFloat(line.replace(/^marks:\s*/i, '')) || 1.0;
        } else if (line.match(/^\d+\.\s/)) {
          questionText = line.replace(/^\d+\.\s*/, '').trim();
        } else {
          const isCorrect = line.startsWith('*') || line.startsWith('[x]') || line.startsWith('(x)');
          let cleanText = line;
          if (isCorrect) {
            cleanText = line.replace(/^(\*|\[x\]|\(x\))\s*/i, '').trim();
          }
          cleanText = cleanText.replace(/^[a-d\d][\)\.]\s*/i, '').trim();
          
          options.push({
            optionText: cleanText,
            isCorrect
          });
        }
      }

      if (questionText) {
        questions.push({
          question: questionText,
          questionType: 'mcq',
          marks,
          explanation,
          options: options.length > 0 ? options : [
            { optionText: 'True', isCorrect: true },
            { optionText: 'False', isCorrect: false }
          ]
        });
      }
    }

    if (questions.length === 0) {
      throw new Error('No valid questions found. Please check your format.');
    }

    return questions;
  };

  // Search & filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Form states
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    courseId: '',
    duration: '30',
    passingScore: '50'
  });

  const [newQuestion, setNewQuestion] = useState<Question>({
    question: '',
    questionType: 'mcq',
    marks: 1.0,
    explanation: '',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ]
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let authorized = false;

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.roleName === 'mentor' || user.roleName === 'admin') {
          authorized = true;
        }
      } catch (e) {}
    }

    if (!authorized) {
      setIsAuthorized(false);
      router.push('/login');
    } else {
      setIsAuthorized(true);
      fetchMentorData();
      fetchUnreadNotifications();
    }
  }, [router]);

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // 1. Fetch courses
      const coursesRes = await fetch('/api/mentor/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        const coursesList = cData.courses || [];
        setCourses(coursesList);

        if (coursesList.length === 1) {
          setSelectedCurriculumCourse(coursesList[0]);
        } else if (coursesList.length > 1) {
          const lastCourseId = localStorage.getItem('lastSelectedCourseId');
          if (lastCourseId) {
            const matched = coursesList.find((c: any) => c.id === parseInt(lastCourseId));
            if (matched) {
              setSelectedCurriculumCourse(matched);
            }
          }
        }
      }

      // 2. Fetch students
      const studentsRes = await fetch('/api/mentor/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (studentsRes.ok) {
        const sData = await studentsRes.json();
        setStudents(sData.students || []);
      }

      // 3. Fetch stats
      const statsRes = await fetch('/api/mentor/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statData = await statsRes.json();
        setStats({
          totalStudents: statData.totalStudents || 0,
          totalCourses: statData.totalCourses || 0,
          totalQuizzes: statData.totalQuizzes || 0,
          totalAttempts: statData.totalAttempts || 0
        });
      }

      // 4. Fetch quizzes
      const quizzesRes = await fetch('/api/mentor/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (quizzesRes.ok) {
        const qData = await quizzesRes.json();
        setQuizzes(qData.quizzes || []);
      }

      // 5. Fetch attempts
      const attemptsRes = await fetch('/api/mentor/quizzes/attempts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (attemptsRes.ok) {
        const attData = await attemptsRes.json();
        setAttempts(attData.attempts || []);
      }
    } catch (error) {
      console.error('Failed to fetch mentor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.title || !newQuiz.courseId) {
      toast.error('Title and Course are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mentor/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newQuiz.title,
          description: newQuiz.description,
          courseId: parseInt(newQuiz.courseId),
          duration: parseInt(newQuiz.duration),
          passingScore: parseFloat(newQuiz.passingScore)
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Quiz created successfully! 🎉');
        setIsQuizModalOpen(false);
        setNewQuiz({
          title: '',
          description: '',
          courseId: '',
          duration: '30',
          passingScore: '50'
        });
        fetchMentorData();
      } else {
        toast.error(data.error || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Quiz creation failed:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  const handleParseAndLoad = () => {
    if (!bulkText.trim()) {
      toast.error('Please paste some text/JSON first.');
      return;
    }
    try {
      const parsed = parseBulkQuestions(bulkText);
      setQuestionsList(prev => {
        const filtered = prev.filter(q => q.question.trim() !== '');
        return [...filtered, ...parsed];
      });
      setIsBulkMode(false); // Switch tab automatically!
      setBulkText(''); // Clear input
      toast.success(`Loaded ${parsed.length} questions into the manual editor! Feel free to edit or add more.`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to parse questions.');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    if (questionsList.length === 0) {
      toast.error('Please add at least one question.');
      return;
    }

    // Validate all questions in questionsList
    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      if (!q.question.trim()) {
        toast.error(`Question #${i + 1} text is empty.`);
        return;
      }
      const emptyOption = q.options.some((o: any) => !o.optionText.trim());
      if (emptyOption) {
        toast.error(`Please fill in all option fields for Question #${i + 1}.`);
        return;
      }
      const hasCorrect = q.options.some((o: any) => o.isCorrect);
      if (!hasCorrect) {
        toast.error(`Please select a correct option for Question #${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mentor/quizzes/${selectedQuiz.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionsList)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('All questions updated and saved successfully! 📝');
        setIsQuestionModalOpen(false);
        fetchMentorData();
      } else {
        toast.error(data.error || 'Failed to save questions');
      }
    } catch (error) {
      console.error('Save questions failed:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          student.lastName.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          student.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesCourse = courseFilter ? student.courseTitle === courseFilter : true;
    return matchesSearch && matchesCourse;
  });

  const sidebarLinks = [
    { tab: 'overview', label: 'Dashboard', icon: Settings },
    { tab: 'courses', label: 'My Courses', icon: BookOpen },
    { tab: 'students', label: 'My Students', icon: Users },
    { tab: 'quizzes', label: 'Quizzes', icon: HelpCircle },
    { tab: 'attempts', label: 'Quiz Attempts', icon: Award },
    { tab: 'recordings', label: 'Class Recordings', icon: PlayCircle },
    { tab: 'assignments', label: 'Assignments', icon: FileText },
    { tab: 'profile', label: 'My Profile', icon: User },
  ];

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return null;
  }
  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-blue-500/20 shrink-0">
            <img src="/logo.jpg" alt="Luminous" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text">
            Luminous SDTC
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 rounded-xl transition border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-black">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <button 
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await fetch('/api/notifications', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ markAllRead: true })
                          });
                          fetchUnreadNotifications();
                        } catch {}
                      }}
                      className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                  {notificationsList.length === 0 ? (
                    <div className="py-6 px-4 text-xs text-slate-500 text-center">
                      No notifications
                    </div>
                  ) : (
                    notificationsList.map((notif: any) => (
                      <div 
                        key={notif.id} 
                        onClick={async () => {
                          if (notif.readStatus) return;
                          try {
                            const token = localStorage.getItem('token');
                            await fetch('/api/notifications', {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ notificationId: notif.id })
                            });
                            fetchUnreadNotifications();
                          } catch {}
                        }}
                        className={`p-3 text-left transition-colors cursor-pointer ${
                          notif.readStatus 
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400' 
                            : 'bg-blue-500/5 dark:bg-blue-500/5 hover:bg-blue-500/10 dark:hover:bg-blue-500/10 font-bold text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <p className="text-xs">{notif.title}</p>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{notif.message}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mentor Profile Card */}
          <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {mentorUser?.firstName ? mentorUser.firstName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold leading-none text-slate-800 dark:text-slate-100">{mentorUser ? `${mentorUser.firstName || ''} ${mentorUser.lastName || ''}`.trim() : 'Mentor'}</p>
              <p className="text-[10px] leading-none text-slate-500 dark:text-slate-400 mt-0.5">Mentor</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 rounded-xl transition border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/login" className="p-2 hover:bg-red-500/10 hover:text-red-600 dark:bg-slate-800/80 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-xl transition border border-slate-200 dark:border-slate-700/50 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-400">
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden min-w-0 flex-col md:flex-row relative">
        
        {/* Desktop Sidebar Nav */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 gap-1.5 overflow-y-auto h-full shrink-0">
          <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 px-3 mb-2">Main Menu</p>
          {sidebarLinks.map(link => (
            <button 
              key={link.tab}
              onClick={() => { setSelectedCurriculumCourse(null); setActiveTab(link.tab as any); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === link.tab 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              <span>{link.label}</span>
            </button>
          ))}
        </aside>

        {/* Mobile Sidebar Slide-Over Drawer */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
              />
              
              {/* Drawer Panel */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-slate-950 p-4 border-r border-slate-200 dark:border-slate-800 flex flex-col gap-2 md:hidden shadow-2xl h-full"
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Main Menu</span>
                  <button 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-xl text-slate-400 hover:text-slate-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {sidebarLinks.map(link => (
                  <button
                    key={link.tab}
                    onClick={() => {
                      setSelectedCurriculumCourse(null);
                      setActiveTab(link.tab as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                      activeTab === link.tab
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <link.icon className="w-5 h-5 shrink-0" />
                    <span>{link.label}</span>
                  </button>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing dashboard data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-400 font-medium">Welcome back! Here is a summary of your LMS stats.</p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition shadow-lg">
                      <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Students</p>
                        <h4 className="text-2xl font-black text-white mt-1">{stats.totalStudents}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 hover:border-green-500/30 transition shadow-lg">
                      <div className="p-3.5 bg-green-600/10 border border-green-500/20 text-green-400 rounded-xl">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">My Courses</p>
                        <h4 className="text-2xl font-black text-white mt-1">{stats.totalCourses}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 hover:border-purple-500/30 transition shadow-lg">
                      <div className="p-3.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quizzes Created</p>
                        <h4 className="text-2xl font-black text-white mt-1">{stats.totalQuizzes}</h4>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition shadow-lg">
                      <div className="p-3.5 bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded-xl">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quiz Attempts</p>
                        <h4 className="text-2xl font-black text-white mt-1">{stats.totalAttempts}</h4>
                      </div>
                    </div>
                  </div>

                  {/* Overview Lists */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Student Activity */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-white text-lg">My Students</h3>
                        <button onClick={() => setActiveTab('students')} className="text-xs text-blue-400 hover:text-blue-300 font-bold transition flex items-center gap-1">
                          View All <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="divide-y divide-slate-800/85">
                        {students.slice(0, 4).length === 0 ? (
                          <p className="text-sm text-slate-500 py-6 text-center">No students enrolled yet.</p>
                        ) : (
                          students.slice(0, 4).map(student => (
                            <div key={student.id} className="py-3.5 flex items-center justify-between">
                              <div>
                                <h5 className="font-bold text-slate-200 text-sm">{student.firstName} {student.lastName}</h5>
                                <p className="text-xs text-slate-500 mt-1">{student.courseTitle}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-900/30">
                                  {student.progress}% Progress
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Quick Quizzes List */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-white text-lg">Quizzes</h3>
                        <button onClick={() => setActiveTab('quizzes')} className="text-xs text-blue-400 hover:text-blue-300 font-bold transition flex items-center gap-1">
                          Manage Quizzes <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="divide-y divide-slate-800/85">
                        {quizzes.slice(0, 4).length === 0 ? (
                          <p className="text-sm text-slate-500 py-6 text-center">No quizzes created yet.</p>
                        ) : (
                          quizzes.slice(0, 4).map(quiz => (
                            <div key={quiz.id} className="py-3.5 flex items-center justify-between">
                              <div>
                                <h5 className="font-bold text-slate-200 text-sm">{quiz.title}</h5>
                                <p className="text-xs text-slate-500 mt-1">{quiz.courseTitle}</p>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                  {quiz.questionsCount} Questions
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: MY COURSES */}
              {activeTab === 'courses' && (
                <motion.div 
                  key="courses" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {selectedCurriculumCourse ? (
                    <MentorCurriculumVideos 
                      course={selectedCurriculumCourse} 
                      onBack={() => {
                        if (courses.length > 1) {
                          localStorage.removeItem('lastSelectedCourseId');
                          setSelectedCurriculumCourse(null);
                        } else {
                          setActiveTab('overview');
                        }
                      }}
                    />
                  ) : (
                    <>
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Teaching Courses</h2>
                        <p className="text-slate-400 font-medium">Courses where you are assigned as the mentor.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {courses.length === 0 ? (
                          <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                            No assigned courses found.
                          </div>
                        ) : (
                          courses.map(course => (
                            <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:-translate-y-1 hover:border-slate-700 transition duration-300">
                              <div className="h-44 bg-slate-800 relative">
                                {course.thumbnailUrl ? (
                                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-indigo-950 text-indigo-400 font-bold">
                                    No Thumbnail
                                  </div>
                                )}
                                <span className="absolute top-3 right-3 text-[10px] font-bold tracking-widest uppercase bg-slate-950/80 px-2.5 py-1 rounded-full text-slate-300 border border-slate-800/80">
                                  {course.category}
                                </span>
                              </div>
                              <div className="p-6 space-y-4">
                                <h4 className="font-extrabold text-white text-lg leading-tight h-12 overflow-hidden">{course.title}</h4>
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-t border-slate-800/60 pt-4">
                                  <span>STUDENTS: <span className="text-white">{course.enrolledStudents}</span></span>
                                  <span>STATUS: <span className={`uppercase ${course.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}>{course.status}</span></span>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedCurriculumCourse(course);
                                    localStorage.setItem('lastSelectedCourseId', course.id.toString());
                                  }}
                                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white hover:text-blue-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                                >
                                  <PlayCircle className="w-4 h-4" /> Curriculum & Video Lessons
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* TAB 3: MY STUDENTS */}
              {activeTab === 'students' && (
                <motion.div 
                  key="students" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">My Students</h2>
                    <p className="text-slate-400 font-medium">Students currently enrolled in your courses.</p>
                  </div>

                  {/* Filter bar */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-950/60 border border-slate-800 p-4 rounded-2xl shadow-lg">
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        placeholder="Search student name or email..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition"
                      />
                    </div>
                    
                    <select
                      value={courseFilter}
                      onChange={e => setCourseFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500 transition w-full md:w-56"
                    >
                      <option value="">All Courses</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Table */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Enrolled Course</th>
                          <th className="px-6 py-4">Progress</th>
                          <th className="px-6 py-4">Phone</th>
                          <th className="px-6 py-4">Date Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                              No students found.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="px-6 py-4.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center font-bold text-slate-300">
                                    {student.firstName ? student.firstName.charAt(0) : 'S'}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-white text-sm leading-snug">{student.firstName} {student.lastName}</h5>
                                    <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-slate-300 font-medium font-sans">
                                {student.courseTitle}
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="flex items-center gap-3 w-40">
                                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/30">
                                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${student.progress}%` }}></div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-300">{student.progress}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-slate-400 text-xs font-mono">
                                {student.phone || '-'}
                              </td>
                              <td className="px-6 py-4.5 text-slate-400 text-xs font-semibold">
                                {new Date(student.enrolledAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: QUIZZES */}
              {activeTab === 'quizzes' && (
                <motion.div 
                  key="quizzes" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Quiz Management</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Create quizzes and add questions manually or via bulk JSON import.</p>
                    </div>
                    <button 
                      onClick={() => setIsQuizModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Create New Quiz
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {quizzes.length === 0 ? (
                      <div className="py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                        <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">No quizzes yet.</p>
                        <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Click "Create New Quiz" to get started.</p>
                      </div>
                    ) : (
                      quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-300 dark:hover:border-slate-700 transition duration-200 shadow-sm">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{quiz.title}</h4>
                              <span className="bg-emerald-100 dark:bg-green-950/40 text-emerald-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-green-900/30 uppercase">{quiz.status}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-400">
                              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {quiz.courseTitle}</span>
                              <span>• ⏱ {quiz.duration} min</span>
                              <span>• 🎯 Pass: {quiz.passingScore}%</span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold">• {quiz.questionsCount} Questions</span>
                            </div>
                          </div>
                          <button
                            onClick={() => openQuestionModal(quiz)}
                            className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" /> Manage Questions
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 5: ATTEMPTS */}
              {activeTab === 'attempts' && (
                <motion.div 
                  key="attempts" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Quiz Attempts Log</h2>
                    <p className="text-slate-400 font-medium">Tracking scores and pass/fail states of student submissions.</p>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Quiz Title</th>
                          <th className="px-6 py-4">Course</th>
                          <th className="px-6 py-4">Score</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Attempt Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {attempts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                              No quiz attempts logged yet.
                            </td>
                          </tr>
                        ) : (
                          attempts.map(attempt => (
                            <tr key={attempt.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="px-6 py-4.5">
                                <div>
                                  <h5 className="font-bold text-white text-sm leading-snug">{attempt.studentName}</h5>
                                  <p className="text-xs text-slate-500 mt-0.5">{attempt.studentEmail}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-slate-200 font-semibold text-sm">
                                {attempt.quizTitle}
                              </td>
                              <td className="px-6 py-4.5 text-slate-400 text-xs font-semibold font-sans">
                                {attempt.courseTitle}
                              </td>
                              <td className="px-6 py-4.5 font-bold text-sm text-slate-300">
                                {attempt.score} / {attempt.totalMarks}
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  attempt.passed 
                                    ? 'bg-green-950/40 text-green-400 border-green-900/30' 
                                    : 'bg-red-950/40 text-red-400 border-red-900/30'
                                }`}>
                                  {attempt.passed ? (
                                    <><CheckCircle className="w-3.5 h-3.5" /> Pass</>
                                  ) : (
                                    <><XCircle className="w-3.5 h-3.5" /> Fail</>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-slate-500 text-xs font-semibold text-right">
                                {new Date(attempt.submittedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: CLASS RECORDINGS */}
              {activeTab === 'recordings' && (
                <motion.div 
                  key="recordings" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                >
                  <MentorRecordings />
                </motion.div>
              )}

              {/* TAB 7: ASSIGNMENTS */}
              {activeTab === 'assignments' && (
                <motion.div 
                  key="assignments" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                >
                  <MentorAssignments />
                </motion.div>
              )}

              {/* TAB 8: PROFILE */}
              {activeTab === 'profile' && (
                <motion.div 
                  key="profile" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                >
                  <ProfileComponent />
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </main>
      </div>

      {/* MODAL 1: CREATE QUIZ */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600/5 to-indigo-600/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded-xl">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Create New Quiz</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure quiz settings for one of your courses.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleCreateQuiz} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quiz Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., HTML & CSS Midterm Exam"
                  value={newQuiz.title}
                  onChange={e => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-700 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                <textarea 
                  placeholder="Instructions for students taking this quiz..."
                  value={newQuiz.description}
                  onChange={e => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-700 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration (min)</label>
                  <input 
                    type="number" required min={1}
                    value={newQuiz.duration}
                    onChange={e => setNewQuiz(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pass Score (%)</label>
                  <input 
                    type="number" required min={1} max={100}
                    value={newQuiz.passingScore}
                    onChange={e => setNewQuiz(prev => ({ ...prev, passingScore: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course *</label>
                  <select
                    required
                    value={newQuiz.courseId}
                    onChange={e => setNewQuiz(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
                  >
                    <option value="">Select...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: MANAGE QUESTIONS */}
      {isQuestionModalOpen && selectedQuiz && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded-xl">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedQuiz.title}</h3>
                  <p className="text-xs text-slate-500">{selectedQuiz.courseTitle} • {selectedQuiz.questionsCount} existing questions</p>
                </div>
              </div>
              <button onClick={() => setIsQuestionModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="px-6 pt-4 shrink-0">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 w-fit">
                <button
                  onClick={() => setIsBulkMode(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    !isBulkMode ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  ✏️ Manual Add
                </button>
                <button
                  onClick={() => setIsBulkMode(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isBulkMode ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  📋 Bulk Import (JSON)
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {isBulkMode ? (
                /* BULK IMPORT TAB */
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> JSON Bulk Import</h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">Paste a JSON array of questions below. Each question must have: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">question</code>, <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">options</code> (array), <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">marks</code>, and <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">explanation</code>.</p>
                      </div>
                      <button
                        onClick={() => {
                          const sample = JSON.stringify([
                            {
                              "question": "What does HTML stand for?",
                              "questionType": "mcq",
                              "marks": 1,
                              "explanation": "HTML stands for HyperText Markup Language, the standard language for creating web pages.",
                              "options": [
                                { "optionText": "HyperText Markup Language", "isCorrect": true },
                                { "optionText": "High Tech Modern Language", "isCorrect": false },
                                { "optionText": "Home Tool Markup Language", "isCorrect": false },
                                { "optionText": "Hyperlink and Text Markup Language", "isCorrect": false }
                              ]
                            },
                            {
                              "question": "Which CSS property is used to change text color?",
                              "questionType": "mcq",
                              "marks": 1,
                              "explanation": "The 'color' property in CSS is used to set the text color of an element.",
                              "options": [
                                { "optionText": "font-color", "isCorrect": false },
                                { "optionText": "text-color", "isCorrect": false },
                                { "optionText": "color", "isCorrect": true },
                                { "optionText": "foreground-color", "isCorrect": false }
                              ]
                            }
                          ], null, 2);
                          navigator.clipboard.writeText(sample).then(() => toast.success('Sample JSON copied to clipboard! 📋'));
                        }}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Sample JSON
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paste JSON Array Below</label>
                      {bulkText && (
                        <button onClick={() => setBulkText('')} className="text-[10px] text-slate-400 hover:text-red-400 transition cursor-pointer">Clear</button>
                      )}
                    </div>
                    <textarea
                      value={bulkText}
                      onChange={e => setBulkText(e.target.value)}
                      placeholder={`Paste your JSON array here...\n\nExample:\n[\n  {\n    "question": "Your question here?",\n    "marks": 1,\n    "explanation": "Explanation...",\n    "options": [\n      { "optionText": "Option A", "isCorrect": true },\n      { "optionText": "Option B", "isCorrect": false }\n    ]\n  }\n]`}
                      rows={12}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-700 transition font-mono resize-none"
                    />
                  </div>
                  <button
                    onClick={handleParseAndLoad}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Parse & Load into Editor
                  </button>
                </div>
              ) : (
                /* MANUAL ADD TAB */
                <div className="space-y-5">
                  {questionsList.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No questions yet. Add your first question below.</p>
                    </div>
                  )}
                  {questionsList.map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 px-2.5 py-1 rounded-lg">Question {qIdx + 1}</span>
                        <button
                          onClick={() => setQuestionsList(prev => prev.filter((_, i) => i !== qIdx))}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={q.question}
                        onChange={e => setQuestionsList(prev => prev.map((item, i) => i === qIdx ? { ...item, question: e.target.value } : item))}
                        placeholder="Enter your question here..."
                        rows={2}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition resize-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt: any, oIdx: number) => (
                          <div key={oIdx} className={`flex items-center gap-2 p-2.5 rounded-xl border transition cursor-pointer ${
                            opt.isCorrect 
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/50' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                            onClick={() => setQuestionsList(prev => prev.map((item, i) => i === qIdx ? {
                              ...item,
                              options: item.options.map((o: any, oi: number) => ({ ...o, isCorrect: oi === oIdx }))
                            } : item))}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                              opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {opt.isCorrect && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <input
                              value={opt.optionText}
                              onChange={e => {
                                e.stopPropagation();
                                setQuestionsList(prev => prev.map((item, i) => i === qIdx ? {
                                  ...item,
                                  options: item.options.map((o: any, oi: number) => oi === oIdx ? { ...o, optionText: e.target.value } : o)
                                } : item));
                              }}
                              onClick={e => e.stopPropagation()}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none placeholder:text-slate-400"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Explanation</label>
                          <input
                            value={q.explanation}
                            onChange={e => setQuestionsList(prev => prev.map((item, i) => i === qIdx ? { ...item, explanation: e.target.value } : item))}
                            placeholder="Explain the correct answer..."
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 transition"
                          />
                        </div>
                        <div className="w-20 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Marks</label>
                          <input
                            type="number" min={0.5} step={0.5}
                            value={q.marks}
                            onChange={e => setQuestionsList(prev => prev.map((item, i) => i === qIdx ? { ...item, marks: parseFloat(e.target.value) || 1 } : item))}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setQuestionsList(prev => [...prev, {
                      question: '', questionType: 'mcq', marks: 1, explanation: '',
                      options: [
                        { optionText: '', isCorrect: true },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false }
                      ]
                    }])}
                    className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 text-slate-400 dark:text-slate-500 hover:text-blue-500 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Another Question
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-200">{questionsList.length}</span> question{questionsList.length !== 1 ? 's' : ''} ready to save
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddQuestion as any}
                  disabled={loading || questionsList.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All Questions
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  BookOpen, Users, Award, FileText, Plus, CheckCircle, XCircle, 
  Search, Eye, Settings, HelpCircle, ChevronRight, LogOut, Loader2, Save 
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function MentorDashboard() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'quizzes' | 'attempts'>('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
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
      notFound();
    } else {
      setIsAuthorized(true);
      fetchMentorData();
    }
  }, []);

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
        setCourses(cData.courses || []);
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

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    if (!newQuestion.question) {
      toast.error('Question text is required');
      return;
    }

    // Validate options
    const emptyOption = newQuestion.options.some(o => !o.optionText);
    if (emptyOption) {
      toast.error('Please fill in all option fields');
      return;
    }

    const hasCorrect = newQuestion.options.some(o => o.isCorrect);
    if (!hasCorrect) {
      toast.error('Please select at least one correct option');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mentor/quizzes/${selectedQuiz.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newQuestion)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Question added successfully! 📝');
        setIsQuestionModalOpen(false);
        // Reset question form
        setNewQuestion({
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
        fetchMentorData();
      } else {
        toast.error(data.error || 'Failed to add question');
      }
    } catch (error) {
      console.error('Add question failed:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          student.lastName.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          student.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesCourse = courseFilter ? student.courseTitle === courseFilter : true;
    return matchesSearch && matchesCourse;
  });

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            L
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Luminous LMS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              M
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold leading-none text-slate-200">Mentor Portal</p>
            </div>
          </div>
          <Link href="/login" className="p-2 bg-slate-800/80 hover:bg-red-950/30 hover:text-red-400 rounded-xl transition border border-slate-700/50 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 px-3 mb-2">Main Menu</p>
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <Settings className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('courses')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'courses' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <BookOpen className="w-5 h-5" /> My Courses
          </button>
          <button 
            onClick={() => setActiveTab('students')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'students' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <Users className="w-5 h-5" /> My Students
          </button>
          <button 
            onClick={() => setActiveTab('quizzes')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'quizzes' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <HelpCircle className="w-5 h-5" /> Quizzes
          </button>
          <button 
            onClick={() => setActiveTab('attempts')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'attempts' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <Award className="w-5 h-5" /> Quiz Attempts
          </button>
        </aside>

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
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                      <h2 className="text-3xl font-black text-white tracking-tight">Quiz Management</h2>
                      <p className="text-slate-400 font-medium">Create and manage multiple-choice quizzes for your courses.</p>
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
                      <div className="py-20 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-500 uppercase tracking-widest font-bold">
                        No quizzes created yet. Click "Create New Quiz" to start.
                      </div>
                    ) : (
                      quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition duration-200">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-extrabold text-white leading-snug">{quiz.title}</h4>
                              <span className="bg-green-950/40 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-900/30 uppercase">
                                {quiz.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-500">
                              <span>COURSE: <span className="text-slate-300">{quiz.courseTitle}</span></span>
                              <span>•</span>
                              <span>DURATION: <span className="text-slate-300">{quiz.duration} Mins</span></span>
                              <span>•</span>
                              <span>PASS SCORE: <span className="text-slate-300">{quiz.passingScore}%</span></span>
                              <span>•</span>
                              <span>QUESTIONS: <span className="text-blue-400">{quiz.questionsCount}</span></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-center">
                            <button
                              onClick={() => {
                                setSelectedQuiz(quiz);
                                setIsQuestionModalOpen(true);
                              }}
                              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700/50 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Question
                            </button>
                          </div>
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

            </AnimatePresence>
          )}
        </main>
      </div>

      {/* MODAL 1: CREATE QUIZ */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-extrabold text-white">Create New Quiz</h3>
              <p className="text-xs text-slate-400 mt-1">Configure quiz settings for one of your courses.</p>
            </div>
            
            <form onSubmit={handleCreateQuiz} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Quiz Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., HTML & CSS Midterm"
                  value={newQuiz.title}
                  onChange={e => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Description</label>
                <textarea 
                  placeholder="Provide instruction details for students..."
                  value={newQuiz.description}
                  onChange={e => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Duration (Mins) *</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    value={newQuiz.duration}
                    onChange={e => setNewQuiz(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Passing Score (%) *</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={newQuiz.passingScore}
                    onChange={e => setNewQuiz(prev => ({ ...prev, passingScore: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Course *</label>
                  <select
                    required
                    value={newQuiz.courseId}
                    onChange={e => setNewQuiz(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
                  >
                    <option value="">Select...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button 
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-bold transition border border-slate-700/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: ADD QUESTION */}
      {isQuestionModalOpen && selectedQuiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-slate-800 flex-shrink-0">
              <h3 className="text-xl font-extrabold text-white">Add MCQ Question</h3>
              <p className="text-xs text-slate-400 mt-1">Quiz: <span className="text-blue-400 font-bold">{selectedQuiz.title}</span></p>
            </div>
            
            <form onSubmit={handleAddQuestion} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar-main">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Question Text *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Which of the following is not a HTML5 semantic element?"
                  value={newQuestion.question}
                  onChange={e => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Question Type</label>
                  <select
                    value={newQuestion.questionType}
                    onChange={e => setNewQuestion(prev => ({ ...prev, questionType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Marks / Score *</label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={newQuestion.marks}
                    onChange={e => setNewQuestion(prev => ({ ...prev, marks: parseFloat(e.target.value) || 1.0 }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-3 pt-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Options (Select the correct one)</span>
                </label>
                
                {newQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-950/40 p-3 border border-slate-800 rounded-xl">
                    <input 
                      type="radio"
                      name="correct-option"
                      checked={option.isCorrect}
                      onChange={() => {
                        const updated = newQuestion.options.map((o, oIdx) => ({
                          ...o,
                          isCorrect: oIdx === idx
                        }));
                        setNewQuestion(prev => ({ ...prev, options: updated }));
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <input 
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                      value={option.optionText}
                      onChange={e => {
                        const updated = [...newQuestion.options];
                        updated[idx].optionText = e.target.value;
                        setNewQuestion(prev => ({ ...prev, options: updated }));
                      }}
                      className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 p-0"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Explanation / Feedback</label>
                <textarea 
                  placeholder="Explain why the option is correct (shown to students post-quiz)..."
                  value={newQuestion.explanation}
                  onChange={e => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-bold transition border border-slate-700/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { HelpCircle, Clock, CheckCircle2, ChevronRight, Play, Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  courseTitle: string;
  questionsCount: number;
  attemptScore: number | null;
  attemptStatus: string | null;
}

export default function StudentQuizzesList() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/student/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    router.push(`/student/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-slate-500 mt-4 text-sm font-medium">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Quizzes</h1>
        <p className="text-slate-400 text-sm">Assess your understanding and earn passing grades for enrolled courses.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No quizzes available</h3>
          <p className="text-slate-500 text-sm">
            Quizzes will appear here when assigned by your course instructors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz, index) => {
            const isCompleted = quiz.attemptStatus === 'submitted' || quiz.attemptStatus === 'completed';
            const isPassed = isCompleted && quiz.attemptScore !== null && quiz.attemptScore >= quiz.passingScore;
            
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 transition flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Course Title Badge */}
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      {quiz.courseTitle}
                    </span>
                    {isCompleted && (
                      <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                        isPassed 
                          ? 'text-green-400 bg-green-500/10 border border-green-500/20' 
                          : 'text-red-400 bg-red-500/10 border border-red-500/20'
                      }`}>
                        <CheckCircle2 size={12} />
                        {isPassed ? 'Passed' : 'Failed'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {quiz.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-3 bg-white/5 p-3 rounded-xl text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Questions</p>
                      <p className="text-sm font-extrabold text-white mt-0.5">{quiz.questionsCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Duration</p>
                      <p className="text-sm font-extrabold text-white mt-0.5">{quiz.duration} Mins</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Passing Score</p>
                      <p className="text-sm font-extrabold text-white mt-0.5">{Math.round(quiz.passingScore)}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    {isCompleted ? (
                      <div className="text-xs text-slate-400">
                        Your Score: <span className={`font-bold text-sm ${isPassed ? 'text-green-400' : 'text-red-400'}`}>{quiz.attemptScore}%</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        <span>Ready to attempt</span>
                      </div>
                    )}
                  </div>
                  
                  {isCompleted ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-slate-800 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-700/30 cursor-not-allowed"
                    >
                      Attempted
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(quiz.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      <Play size={12} className="fill-current" />
                      Start Quiz
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

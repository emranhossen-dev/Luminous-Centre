'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StudentQuizAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);

  // Load Quiz data
  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      setPageLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/student/quizzes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQuiz(data.quiz);
        setQuestions(data.questions || []);
        setTimeLeft(data.quiz.duration * 60);
      } else {
        toast.error(data.error || 'Failed to load quiz');
      }
    } catch (e) {
      console.error('Quiz details load error:', e);
      toast.error('Network error. Failed to load quiz.');
    } finally {
      setPageLoading(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || attemptResult) return;
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          clearInterval(timerId);
          handleAutoSubmit();
          return 0;
        }
        return prev !== null ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, attemptResult]);

  // Tab Switching Warning Effect
  useEffect(() => {
    if (attemptResult) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const count = prev + 1;
          toast.warning(`Security Alert: Tab switch detected (${count}/3)`);
          if (count >= 3) {
            handleAutoSubmit();
          }
          return count;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attemptResult]);

  const handleOptionChange = (questionId: string, optionId: string, isMultiple: boolean) => {
    if (isMultiple) {
      setAnswers(prev => {
        const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
        const next = current.includes(optionId) 
          ? current.filter(id => id !== optionId) 
          : [...current, optionId];
        return { ...prev, [questionId]: next };
      });
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    }
  };

  const handleAutoSubmit = async () => {
    toast.error('Time limit exceeded or security violation. Auto-submitting...', { autoClose: 2000 });
    await submitQuiz(true);
  };

  const submitQuiz = async (force: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitWarning(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/student/quizzes/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (res.ok) {
        setAttemptResult(data);
        toast.success('Quiz submitted successfully!');
      } else {
        toast.error(data.error || 'Failed to submit quiz');
      }
    } catch (e) {
      console.error('Quiz submission error:', e);
      toast.error('Network error. Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f18] text-slate-100">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-slate-500 mt-4 text-sm font-bold uppercase tracking-wider">Syncing Quiz Portal...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f18] text-slate-100 p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Quiz Not Found</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">The quiz you are trying to access is unavailable or draft.</p>
        <button onClick={() => router.push('/student?tab=quiz')} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition">
          Go Back
        </button>
      </div>
    );
  }

  // Render Attempt Result Screen
  if (attemptResult) {
    return (
      <div className="min-h-screen bg-[#0a0f18] text-slate-100 p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-xl bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">{quiz.title}</h1>
            <p className="text-slate-400 text-sm">Attempt Completed Successfully!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <div className="p-3 text-center border-r border-white/5">
              <p className="text-xs text-slate-500 uppercase font-black">Your Score</p>
              <p className="text-2xl font-black text-white mt-1">
                {attemptResult.score} <span className="text-xs font-semibold text-slate-500">/ {attemptResult.totalMarks}</span>
              </p>
            </div>
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500 uppercase font-black">Status</p>
              <p className={`text-lg font-black mt-1.5 uppercase ${attemptResult.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {attemptResult.passed ? 'Passed' : 'Failed'}
              </p>
            </div>
          </div>

          <div className="text-slate-400 text-xs text-center max-w-xs mx-auto">
            {attemptResult.passed 
              ? 'Great job! You have satisfied the minimum passing score requirements for this assessment.' 
              : 'You did not meet the passing score requirement. Contact your mentor for instructions.'
            }
          </div>

          <div className="pt-4 border-t border-white/5 flex gap-4 justify-center">
            <button
              onClick={() => router.push('/student?tab=quiz')}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-100 p-4 sm:p-6 md:p-8 relative">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Sticky Header with Timer */}
        <div className="sticky top-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4 z-40">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight text-center sm:text-left">{quiz.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5 text-center sm:text-left">🔒 Active Assessment Mode. Do not switch tabs.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden xs:inline">Time Left</span>
              <div className={`flex items-center gap-2 font-mono text-lg font-black px-4 py-2 bg-slate-950 rounded-xl border border-white/5 ${timeLeft && timeLeft < 180 ? 'text-rose-500 border-rose-500/20 animate-pulse' : 'text-emerald-400'}`}>
                <Clock className="w-4 h-4" />
                {timeLeft !== null ? formatTime(timeLeft) : '00:00'}
              </div>
            </div>
            
            <button 
              onClick={() => setShowSubmitWarning(true)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/10 active:scale-[0.98] cursor-pointer"
            >
              Submit Quiz
            </button>
          </div>
        </div>

        {/* Security / Tab Switch Banner */}
        {tabSwitches > 0 && (
          <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-2xl flex gap-3 text-rose-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-extrabold uppercase tracking-wide">Security Warning:</strong> Tab switch detected ({tabSwitches}/3). Switching 3 times will trigger auto-submission.
            </div>
          </div>
        )}

        {/* Quiz Questions List */}
        <div className="space-y-6">
          {questions.map((q, index) => {
            const isMultiple = q.questionType === 'multiple_select';
            return (
              <div key={q.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4 hover:border-emerald-500/10 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-lg font-bold text-white leading-relaxed">
                    <span className="text-slate-500 mr-2 font-black">{index + 1}.</span> {q.question}
                  </h3>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-950 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap">
                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>
                
                {isMultiple && (
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    * Multiple select (select all that apply)
                  </p>
                )}

                <div className="space-y-3 pt-2">
                  {q.options.map((opt: any) => {
                    const isSelected = isMultiple 
                      ? Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.id)
                      : answers[q.id] === opt.id;
                    
                    return (
                      <label 
                        key={opt.id} 
                        className={`flex items-center gap-3.5 p-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' 
                            : 'border-white/5 bg-slate-950/20 text-slate-350 hover:bg-slate-950/40 hover:text-slate-100 hover:border-white/10'
                        }`}
                      >
                        <input 
                          type={isMultiple ? 'checkbox' : 'radio'} 
                          name={`question_${q.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => handleOptionChange(q.id, opt.id, isMultiple)}
                          className="w-4 h-4 text-emerald-500 bg-slate-950 border-white/10 focus:ring-emerald-500 focus:ring-offset-slate-900 rounded-md"
                        />
                        <span className="leading-relaxed">{opt.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowSubmitWarning(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Submit Your Assessment?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Make sure you have reviewed all answers. Once submitted, your score will be graded automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
              <button
                onClick={() => setShowSubmitWarning(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={() => submitQuiz(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Confirm & Submit <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

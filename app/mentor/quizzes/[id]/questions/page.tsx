"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Users, Award, FileText, Plus, HelpCircle, ChevronRight, LogOut, Loader2, Save,
  PlayCircle, Sun, Moon, Trash2, ArrowLeft, Settings
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Option {
  optionText: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  questionType: string;
  marks: number;
  explanation: string;
  options: Option[];
}

export default function QuizQuestionsBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [quizTitle, setQuizTitle] = useState('Quiz');
  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("light", savedTheme === "light");
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    fetchQuizAndQuestions();
  }, [quizId]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const fetchQuizAndQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch quiz details
      const quizRes = await fetch('/api/mentor/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        const found = (quizData.quizzes || []).find((q: any) => q.id === quizId);
        if (found) {
          setQuizTitle(found.title);
        }
      }

      // Fetch questions
      const res = await fetch(`/api/mentor/quizzes/${quizId}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
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
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarClick = (tab: string) => {
    localStorage.setItem('mentorActiveTab', tab);
    router.push('/mentor');
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

    const questions: any[] = [];
    const blocks = trimmed.split(/(?:\r?\n){2,}/);
    
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
      setIsBulkMode(false);
      setBulkText('');
      toast.success(`Loaded ${parsed.length} questions into the editor! 🎉`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to parse questions.');
    }
  };

  const handleSaveAllQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questionsList.length === 0) {
      toast.error('Please add at least one question.');
      return;
    }

    // Validation checks
    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      if (!q.question.trim()) {
        toast.error(`Question #${i + 1} text is empty.`);
        return;
      }
      const emptyOption = q.options.some(o => !o.optionText.trim());
      if (emptyOption) {
        toast.error(`Please fill in all option fields for Question #${i + 1}.`);
        return;
      }
      const hasCorrect = q.options.some(o => o.isCorrect);
      if (!hasCorrect) {
        toast.error(`Please select a correct option for Question #${i + 1}.`);
        return;
      }
    }

    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mentor/quizzes/${quizId}/questions`, {
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
        setTimeout(() => {
          handleSidebarClick('quizzes');
        }, 1500);
      } else {
        toast.error(data.error || 'Failed to save questions');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-blue-500/20 shrink-0">
            <img src="/logo.jpg" alt="Luminous" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text">
            Luminous SDTC
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              M
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold leading-none text-slate-700 dark:text-slate-200">Mentor Portal</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 rounded-xl transition border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/login" className="p-2 bg-slate-105 hover:bg-red-500/10 hover:text-red-650 dark:bg-slate-800/80 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-xl transition border border-slate-200 dark:border-slate-700/50 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-400">
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 px-3 mb-2">Main Menu</p>
          <button 
            onClick={() => handleSidebarClick('overview')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Settings className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => handleSidebarClick('courses')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-100"
          >
            <BookOpen className="w-5 h-5" /> My Courses
          </button>
          <button 
            onClick={() => handleSidebarClick('students')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-655 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-100"
          >
            <Users className="w-5 h-5" /> My Students
          </button>
          <button 
            onClick={() => handleSidebarClick('quizzes')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-blue-600 text-white shadow-lg shadow-blue-500/10"
          >
            <HelpCircle className="w-5 h-5" /> Quizzes
          </button>
          <button 
            onClick={() => handleSidebarClick('attempts')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-100"
          >
            <Award className="w-5 h-5" /> Quiz Attempts
          </button>
          <button 
            onClick={() => handleSidebarClick('recordings')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-100"
          >
            <PlayCircle className="w-5 h-5" /> Class Recordings
          </button>
          <button 
            onClick={() => handleSidebarClick('assignments')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-100"
          >
            <FileText className="w-5 h-5" /> Assignments
          </button>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 space-y-8 bg-slate-100/50 dark:bg-slate-900/10 overflow-y-auto">
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Link href="/mentor" onClick={() => handleSidebarClick('quizzes')} className="hover:text-blue-500 transition">Quizzes</Link>
                <ChevronRight size={12} />
                <span className="text-slate-500">Question Builder</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Quiz Builder: <span className="text-blue-400">{quizTitle}</span>
              </h2>
            </div>
            
            <button
              onClick={() => handleSidebarClick('quizzes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Quizzes
            </button>
          </div>

          {/* Builder Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Import Side Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Import Mode Tabs */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Bulk Import (AI)</h4>
                  <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-lg">
                    <button
                      onClick={() => setIsBulkMode(false)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${!isBulkMode ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      Off
                    </button>
                    <button
                      onClick={() => setIsBulkMode(true)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${isBulkMode ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      On
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste raw text or JSON arrays directly from AI engines like Gemini or ChatGPT to automatically populate the editor.
                  </p>

                  <textarea
                    rows={8}
                    disabled={!isBulkMode}
                    placeholder={isBulkMode ? `[JSON Format]
[
  {
    "question": "What is JS?",
    "options": [
      { "optionText": "Scripting language", "isCorrect": true },
      { "optionText": "Style sheet", "isCorrect": false }
    ]
  }
]

-- OR [Text Format] --
Question: Next tag for paragraphs?
*a) <p>
b) <div>` : "Turn 'On' Bulk Import to paste questions..."}
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition disabled:opacity-40"
                  />

                  {isBulkMode && (
                    <button
                      type="button"
                      onClick={handleParseAndLoad}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 cursor-pointer text-center"
                    >
                      Parse & Load into Editor
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Visual Editor Panel */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSaveAllQuestions} className="space-y-6">
                <div className="space-y-6">
                  {questionsList.map((q, qIdx) => (
                    <motion.div
                      key={qIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl"
                    >
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Question #{qIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionsList(prev => prev.filter((_, idx) => idx !== qIdx));
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Question Text *</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g., Which of the following is not a HTML5 semantic element?"
                          value={q.question}
                          onChange={e => {
                            const updated = [...questionsList];
                            updated[qIdx].question = e.target.value;
                            setQuestionsList(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Question Type</label>
                          <select
                            value={q.questionType || 'mcq'}
                            onChange={e => {
                              const updated = [...questionsList];
                              updated[qIdx].questionType = e.target.value;
                              setQuestionsList(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-blue-500 transition"
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
                            value={q.marks}
                            onChange={e => {
                              const updated = [...questionsList];
                              updated[qIdx].marks = parseFloat(e.target.value) || 1.0;
                              setQuestionsList(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                          />
                        </div>
                      </div>

                      {/* Options Section */}
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                          <span>Options (Select the correct answer)</span>
                        </label>
                        
                        {(q.options || []).map((option: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-slate-950/40 p-3 border border-slate-850 rounded-xl hover:border-slate-800 transition">
                            <input 
                              type="radio"
                              name={`correct-option-${qIdx}`}
                              checked={option.isCorrect}
                              onChange={() => {
                                const updated = [...questionsList];
                                updated[qIdx].options = updated[qIdx].options.map((o: any, oIdx: number) => ({
                                  ...o,
                                  isCorrect: oIdx === idx
                                }));
                                setQuestionsList(updated);
                              }}
                              className="w-4 h-4 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <input 
                              type="text"
                              required
                              placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                              value={option.optionText}
                              onChange={e => {
                                const updated = [...questionsList];
                                updated[qIdx].options[idx].optionText = e.target.value;
                                setQuestionsList(updated);
                              }}
                              className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 p-0"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Explanation / Feedback</label>
                        <textarea 
                          placeholder="Explain why the answer is correct (shown to students post-submission)..."
                          value={q.explanation || ''}
                          onChange={e => {
                            const updated = [...questionsList];
                            updated[qIdx].explanation = e.target.value;
                            setQuestionsList(updated);
                          }}
                          rows={2}
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-700 transition"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionsList(prev => [
                        ...prev,
                        {
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
                        }
                      ]);
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-950/60 hover:bg-slate-950 border border-dashed border-slate-800 hover:border-slate-700 text-blue-400 hover:text-blue-300 font-bold rounded-xl text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add Another Question
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      type="button"
                      onClick={() => handleSidebarClick('quizzes')}
                      className="flex-1 sm:flex-none px-5 py-3 bg-slate-850 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={saveLoading}
                      className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Save All Questions ({questionsList.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

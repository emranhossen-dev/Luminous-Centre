'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function StudentQuizAttemptPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    // In a real app, fetch quiz data from API here using params.id
    // Mocking the fetch for demonstration
    setQuiz({ id: params.id, title: 'JavaScript Fundamentals', duration: 30 });
    setQuestions([
      { id: 'q1', question: 'What is a closure in JS?', options: [{id: 'o1', text: 'Function scope'}, {id: 'o2', text: 'Lexical env'}] },
      { id: 'q2', question: 'Which keyword defines a constant?', options: [{id: 'o3', text: 'var'}, {id: 'o4', text: 'const'}] },
    ]);
    setTimeLeft(30 * 60); // 30 mins in seconds
  }, [params.id]);

  // Timer Effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timerId);
          handleSubmit(); // auto submit when time's up
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Prevent Tab Abuse Effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const count = prev + 1;
          toast.error(`Warning: Tab switch detected (${count}/3)`);
          if (count >= 3) {
            handleSubmit(); // Auto submit on 3rd violation
          }
          return count;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    // Auto Save logic would go here: e.g., POST /api/student/quiz/autosave
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // API call to evaluate and store attempt
      console.log('Submitting answers:', answers);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Quiz submitted successfully!');
      router.push('/student/courses');
    } catch (e) {
      toast.error('Failed to submit quiz.');
      setIsSubmitting(false);
    }
  };

  if (!quiz) return <div className="p-12 text-center">Loading quiz...</div>;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Sticky Header with Timer */}
      <div className="sticky top-4 bg-white p-4 rounded-xl shadow-lg border flex justify-between items-center z-50">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500">Do not refresh or switch tabs.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Time Left</span>
            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft && timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              <Clock className="w-5 h-5" />
              {timeLeft !== null ? formatTime(timeLeft) : '00:00'}
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {tabSwitches > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">
            <strong>Warning:</strong> You have switched tabs {tabSwitches} time(s). Switching 3 times will automatically submit your quiz and may result in a failing grade.
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              <span className="text-gray-400 mr-2">{index + 1}.</span> {q.question}
            </h3>
            
            <div className="space-y-3 pl-6">
              {q.options.map((opt: any) => (
                <label 
                  key={opt.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === opt.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input 
                    type="radio" 
                    name={`question_${q.id}`}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => handleOptionChange(q.id, opt.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

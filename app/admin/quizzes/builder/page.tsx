'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Settings, LayoutList } from 'lucide-react';
import { toast } from 'react-toastify';
import { createQuiz } from './actions';

export default function QuizBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      duration: 30,
      passing_score: 80,
      attempt_limit: 1,
      shuffle_questions: false,
      shuffle_options: false,
      show_answers: false,
      status: 'draft',
      questions: [
        { question: '', question_type: 'mcq', marks: 1, options: [{ text: '', is_correct: true }, { text: '', is_correct: false }] }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Find the correct option using the selected radio button index
      const formattedData = {
        ...data,
        questions: data.questions.map((q: any, i: number) => {
          // Get the selected index from the form data
          const formElement = document.querySelector(`input[name="correct_${i}"]:checked`) as HTMLInputElement;
          const selectedOptionIndex = formElement ? parseInt(formElement.value || '0', 10) : 0;
          
          return {
            ...q,
            options: q.options.map((opt: any, optIndex: number) => ({
              text: opt.text,
              is_correct: optIndex === selectedOptionIndex
            }))
          };
        })
      };

      const result = await createQuiz(formattedData);
      
      if (result.success) {
        toast.success('Quiz saved successfully!');
        router.push('/admin/quizzes');
      } else {
        toast.error(result.error || 'Failed to save quiz');
      }
    } catch (err) {
      toast.error('Failed to save quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Quiz Builder</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center"
          >
            {isSubmitting ? <span className="animate-spin mr-2">⏳</span> : <Save className="w-4 h-4 mr-2" />}
            Save Quiz
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button 
          onClick={() => setStep(1)} 
          className={`px-4 py-2 font-medium text-sm border-b-2 ${step === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          1. Basic Info
        </button>
        <button 
          onClick={() => setStep(2)} 
          className={`px-4 py-2 font-medium text-sm border-b-2 ${step === 2 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <span className="flex items-center"><Settings className="w-4 h-4 mr-2"/> 2. Settings</span>
        </button>
        <button 
          onClick={() => setStep(3)} 
          className={`px-4 py-2 font-medium text-sm border-b-2 ${step === 3 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <span className="flex items-center"><LayoutList className="w-4 h-4 mr-2"/> 3. Question Builder</span>
        </button>
      </div>

      <form className="space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quiz Title *</label>
                <input 
                  {...register('title')} 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. JavaScript Fundamentals"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Slug *</label>
                <input 
                  {...register('slug')} 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="javascript-fundamentals"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea 
                {...register('description')} 
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this quiz covers..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Duration (Minutes)</label>
                <input 
                  type="number"
                  {...register('duration')} 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Passing Score (%)</label>
                <input 
                  type="number"
                  {...register('passing_score')} 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Attempt Limit</label>
                <input 
                  type="number"
                  {...register('attempt_limit')} 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('shuffle_questions')} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Shuffle Questions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('shuffle_options')} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Shuffle Options</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('show_answers')} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Show Answers After Submission</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Question Builder */}
        {step === 3 && (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white p-6 rounded-xl border shadow-sm relative group">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 flex items-center justify-center cursor-move border-r rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="ml-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow space-y-2">
                      <label className="text-sm font-medium text-gray-700">Question {index + 1}</label>
                      <input 
                        {...register(`questions.${index}.question` as const)}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your question here..."
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <label className="text-sm font-medium text-gray-700">Marks</label>
                      <input 
                        type="number"
                        {...register(`questions.${index}.marks` as const)}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="mt-7 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Options for MCQ */}
                  <div className="space-y-2 pl-4 border-l-2 border-blue-100">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Options (Check correct answer)</label>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map(optIndex => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name={`correct_${index}`}
                            value={optIndex}
                            defaultChecked={optIndex === 0}
                            className="w-4 h-4 text-blue-600"
                          />
                          <input 
                            {...register(`questions.${index}.options.${optIndex}.text` as any)}
                            className="flex h-9 w-full sm:w-2/3 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button 
              type="button" 
              onClick={() => append({ question: '', question_type: 'mcq', marks: 1, options: [] })}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add New Question
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

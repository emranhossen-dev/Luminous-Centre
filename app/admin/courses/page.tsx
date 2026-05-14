"use client";

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/admin/CourseCard';
import { Course } from '@/types/course';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [curriculumModal, setCurriculumModal] = useState<{ open: boolean; courseId: number | null; courseTitle: string; loading: boolean; existingData: any[] }>({
    open: false,
    courseId: null,
    courseTitle: '',
    loading: false,
    existingData: []
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        console.error('Failed to fetch courses:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (courseId: number, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Refresh courses list
        fetchCourses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update course status');
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Failed to update course status');
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/courses/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // First check if course has enrollments
      const enrollmentsResponse = await fetch(`/api/admin/courses/${id}/enrollments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        
        if (enrollmentsData.count > 0) {
          // Course has enrollments, show options
          const action = confirm(
            `This course has ${enrollmentsData.count} enrolled students.\n\n` +
            `Click OK to remove all enrollments and delete the course.\n` +
            `Click CANCEL to keep the course and enrollments.`
          );
          
          if (!action) return;
          
          // Remove enrollments first
          const deleteEnrollmentsResponse = await fetch(`/api/admin/courses/${id}/enrollments`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!deleteEnrollmentsResponse.ok) {
            const error = await deleteEnrollmentsResponse.json();
            alert('Failed to remove enrollments: ' + (error.error || 'Unknown error'));
            return;
          }
        }
      }
      
      // Now delete the course
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Refresh courses list
        fetchCourses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleAddCurriculum = async (courseId: number, courseTitle: string) => {
    console.log('Opening curriculum modal for course:', courseId, courseTitle);
    setCurriculumModal({ open: true, courseId, courseTitle, loading: true, existingData: [] });
    
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Token:', token ? 'exists' : 'missing');
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Curriculum data received:', data);
        setCurriculumModal(prev => ({ ...prev, loading: false, existingData: data.modules || [] }));
      } else {
        console.error('Response not ok:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error data:', errorData);
        setCurriculumModal(prev => ({ ...prev, loading: false, existingData: [] }));
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      setCurriculumModal(prev => ({ ...prev, loading: false, existingData: [] }));
    }
  };

  
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Course Management</h2>
          <p className="text-gray-500 font-medium">Design and deploy premium learning experiences</p>
        </div>
        <button 
          onClick={() => router.push('/admin/courses/add-course')}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[20px] font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" /> Launch Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Syncing courses...</div>
        ) : (
          courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onDelete={() => handleDelete(course.id)} 
              onStatusUpdate={(status) => handleStatusUpdate(course.id, status)}
              onAddCurriculum={() => handleAddCurriculum(course.id, course.title)}
            />
          ))
        )}
      </div>

      {/* Curriculum Modal */}
      {curriculumModal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Course Curriculum</h3>
                <p className="text-gray-400">{curriculumModal.courseTitle}</p>
              </div>
              <button
                onClick={() => setCurriculumModal({ open: false, courseId: null, courseTitle: '', loading: false, existingData: [] })}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <CurriculumForm
              courseId={curriculumModal.courseId!}
              existingData={curriculumModal.existingData}
              loading={curriculumModal.loading}
              onClose={() => setCurriculumModal({ open: false, courseId: null, courseTitle: '', loading: false, existingData: [] })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Curriculum Form Component
function CurriculumForm({ courseId, existingData, loading: initialLoading, onClose }: { courseId: number; existingData: any[]; loading: boolean; onClose: () => void }) {
  const [modules, setModules] = useState(() => {
    if (existingData && existingData.length > 0) {
      return existingData.map((m: any, index: number) => ({
        id: m.id || Date.now() + index,
        title: m.title || '',
        topics: m.topics && m.topics.length > 0 ? m.topics.map((t: any) => t.topic_name || '') : [''],
        achievements: m.achievements && m.achievements.length > 0 ? m.achievements.map((a: any) => a.achievement_text || '') : ['']
      }));
    }
    return [{ id: 1, title: '', topics: [''], achievements: [''] }];
  });
  const [loading, setLoading] = useState(false);

  // Update modules when existingData changes
  useEffect(() => {
    console.log('existingData changed:', existingData);
    if (existingData && existingData.length > 0) {
      const mappedModules = existingData.map((m: any, index: number) => ({
        id: m.id || Date.now() + index,
        title: m.title || '',
        topics: m.topics && m.topics.length > 0 ? m.topics.map((t: any) => t.topic_name || '') : [''],
        achievements: m.achievements && m.achievements.length > 0 ? m.achievements.map((a: any) => a.achievement_text || '') : ['']
      }));
      console.log('Setting modules:', mappedModules);
      setModules(mappedModules);
    }
  }, [existingData]);

  const addModule = () => {
    setModules([...modules, { id: Date.now(), title: '', topics: [''], achievements: [''] }]);
  };

  const removeModule = (id: number) => {
    if (modules.length > 1) {
      setModules(modules.filter(m => m.id !== id));
    }
  };

  const addTopic = (moduleId: number) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, topics: [...m.topics, ''] } : m
    ));
  };

  const removeTopic = (moduleId: number, topicIndex: number) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, topics: m.topics.filter((_, i) => i !== topicIndex) } : m
    ));
  };

  const addAchievement = (moduleId: number) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, achievements: [...m.achievements, ''] } : m
    ));
  };

  const removeAchievement = (moduleId: number, achievementIndex: number) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, achievements: m.achievements.filter((_, i) => i !== achievementIndex) } : m
    ));
  };

  const updateModuleTitle = (moduleId: number, title: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, title } : m
    ));
  };

  const updateTopic = (moduleId: number, topicIndex: number, value: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, topics: m.topics.map((t, i) => i === topicIndex ? value : t) } : m
    ));
  };

  const updateAchievement = (moduleId: number, achievementIndex: number, value: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, achievements: m.achievements.map((a, i) => i === achievementIndex ? value : a) } : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const modulesData = modules.map((m, index) => ({
        title: m.title,
        order_index: index,
        topics: m.topics.filter(t => t.trim()).map((t, i) => ({ topic_name: t, order_index: i })),
        achievements: m.achievements.filter(a => a.trim()).map((a, i) => ({ achievement_text: a, order_index: i }))
      })).filter(m => m.title.trim());

      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modules: modulesData })
      });

      if (response.ok) {
        alert('Curriculum saved successfully!');
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save curriculum');
      }
    } catch (error) {
      console.error('Error saving curriculum:', error);
      alert('Failed to save curriculum');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-400">Loading curriculum...</span>
        </div>
      ) : (
        modules.map((module, moduleIndex) => (
          <div key={module.id} className="border border-slate-700 rounded-xl p-6 space-y-4 bg-slate-800/50">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-purple-400">Module {moduleIndex + 1}</span>
              {modules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeModule(module.id)}
                  className="ml-auto text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Remove Module
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Module Title</label>
              <input
                type="text"
                value={module.title}
                onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                placeholder="e.g., Web Foundation (HTML, CSS) and GitHub"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Topics to Cover</label>
                <button
                  type="button"
                  onClick={() => addTopic(module.id)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  + Add Topic
                </button>
              </div>
              {module.topics.map((topic, topicIndex) => (
                <div key={topicIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => updateTopic(module.id, topicIndex, e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                    placeholder="e.g., HTML Semantic Tags"
                  />
                  {module.topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopic(module.id, topicIndex)}
                      className="px-3 py-2 text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">What You Will Be Able To Do</label>
                <button
                  type="button"
                  onClick={() => addAchievement(module.id)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  + Add Achievement
                </button>
              </div>
              {module.achievements.map((achievement, achievementIndex) => (
                <div key={achievementIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateAchievement(module.id, achievementIndex, e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                    placeholder="e.g., ওয়েব পেজের গঠন কীভাবে হয়"
                  />
                  {module.achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAchievement(module.id, achievementIndex)}
                      className="px-3 py-2 text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <button
        type="button"
        onClick={addModule}
        className="w-full py-3 border-2 border-dashed border-purple-500/50 rounded-lg text-purple-400 hover:bg-purple-500/10 font-medium transition-colors"
      >
        + Add Another Module
      </button>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-800 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Curriculum'}
        </button>
      </div>
    </form>
  );
}

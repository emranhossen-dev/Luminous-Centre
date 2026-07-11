"use client";

import React, { useState, useEffect, use } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CurriculumPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [courseSlug] = useState(resolvedParams.slug);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'individual' | 'bulk'>('individual');
  const [existingData, setExistingData] = useState<any[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [curriculumSubtitle, setCurriculumSubtitle] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [courseSlug]);

  const fetchCourseData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Fetching course data for slug:', courseSlug);

      // Fetch all courses from admin API to find the course by slug
      const coursesResponse = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log('All courses:', coursesData.courses);
        const course = coursesData.courses.find((c: any) => c.slug === courseSlug);

        if (course) {
          console.log('Found course:', course);
          setCourseTitle(course.title);
          setCourseId(course.id);

          // Fetch existing curriculum using the course ID
          const curriculumResponse = await fetch(`/api/admin/courses/${course.id}/curriculum`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (curriculumResponse.ok) {
            const data = await curriculumResponse.json();
            console.log('Curriculum data received:', data);
            setExistingData(data.modules || []);
            setCurriculumSubtitle(data.curriculum_subtitle || '');
          } else {
            console.error('Curriculum fetch failed:', curriculumResponse.status);
          }
        } else {
          console.error('Course not found with slug:', courseSlug);
        }
      } else {
        console.error('Courses fetch failed:', coursesResponse.status);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/courses');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Course Curriculum</h1>
            <p className="text-gray-400">{courseTitle}</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8 bg-slate-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setMode('individual')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              mode === 'individual'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Individual Form
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              mode === 'bulk'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bulk JSON Upload
          </button>
        </div>

        {/* Content based on mode */}
        {mode === 'individual' ? (
          <IndividualForm 
            courseId={courseId} 
            existingData={existingData} 
            curriculumSubtitle={curriculumSubtitle}
            setCurriculumSubtitle={setCurriculumSubtitle}
          />
        ) : (
          <BulkUpload 
            courseId={courseId} 
            existingData={existingData} 
            curriculumSubtitle={curriculumSubtitle}
            setCurriculumSubtitle={setCurriculumSubtitle}
          />
        )}
      </div>
    </div>
  );
}

// Individual Form Component
function IndividualForm({ 
  courseId, 
  existingData, 
  curriculumSubtitle, 
  setCurriculumSubtitle 
}: { 
  courseId: number | null; 
  existingData: any[]; 
  curriculumSubtitle: string;
  setCurriculumSubtitle: (val: string) => void;
}) {
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
    if (existingData && existingData.length > 0) {
      const mappedModules = existingData.map((m: any, index: number) => ({
        id: m.id || Date.now() + index,
        title: m.title || '',
        topics: m.topics && m.topics.length > 0 ? m.topics.map((t: any) => t.topic_name || '') : [''],
        achievements: m.achievements && m.achievements.length > 0 ? m.achievements.map((a: any) => a.achievement_text || '') : ['']
      }));
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
    if (!courseId) {
      alert('Course ID not found');
      return;
    }
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
        body: JSON.stringify({ 
          modules: modulesData,
          curriculum_subtitle: curriculumSubtitle
        })
      });

      if (response.ok) {
        alert('Curriculum saved successfully!');
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
    <div className="space-y-8">
      {/* Curriculum Subtitle Input */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Curriculum Subtitle / Short Description
        </label>
        <textarea
          value={curriculumSubtitle}
          onChange={(e) => setCurriculumSubtitle(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 min-h-[100px]"
          placeholder="Short description that appears under the 'Course Curriculum' title"
        />
        <p className="mt-2 text-xs text-gray-500">
          This description appears right below the "Course Curriculum" heading on the public course page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
      {modules.map((module, moduleIndex) => (
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
      ))}

      <button
        type="button"
        onClick={addModule}
        className="w-full py-3 border-2 border-dashed border-purple-500/50 rounded-lg text-purple-400 hover:bg-purple-500/10 font-medium transition-colors"
      >
        + Add Another Module
      </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Curriculum'}
      </button>
    </form>
  </div>
);
}

// Bulk Upload Component
function BulkUpload({ 
  courseId, 
  existingData,
  curriculumSubtitle,
  setCurriculumSubtitle
}: { 
  courseId: number | null; 
  existingData: any[];
  curriculumSubtitle: string;
  setCurriculumSubtitle: (val: string) => void;
}) {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingData && existingData.length > 0) {
      const formattedData = existingData.map((m: any) => ({
        title: m.title,
        topics: m.topics?.map((t: any) => t.topic_name) || [],
        achievements: m.achievements?.map((a: any) => a.achievement_text) || []
      }));
      setJsonInput(JSON.stringify(formattedData, null, 2));
    }
  }, [existingData]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError('');
  };

  const validateJson = () => {
    try {
      const data = JSON.parse(jsonInput);
      
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of modules');
      }

      for (const module of data) {
        if (!module.title || typeof module.title !== 'string') {
          throw new Error('Each module must have a title');
        }
        if (!Array.isArray(module.topics)) {
          throw new Error('Each module must have a topics array');
        }
        if (!Array.isArray(module.achievements)) {
          throw new Error('Each module must have an achievements array');
        }
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseId) {
      alert('Course ID not found');
      return;
    }

    const validatedData = validateJson();
    if (!validatedData) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const modulesData = validatedData.map((m, index) => ({
        title: m.title,
        order_index: index,
        topics: m.topics.filter((t: string) => t.trim()).map((t: string, i: number) => ({ topic_name: t, order_index: i })),
        achievements: m.achievements.filter((a: string) => a.trim()).map((a: string, i: number) => ({ achievement_text: a, order_index: i }))
      }));

      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          modules: modulesData,
          curriculum_subtitle: curriculumSubtitle
        })
      });

      if (response.ok) {
        alert('Curriculum saved successfully!');
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

  const loadSample = () => {
    const sample = [
      {
        "title": "Web Foundation (HTML, CSS) and GitHub",
        "topics": [
          "HTML Semantic Tags",
          "CSS Flexbox and Grid",
          "Git and GitHub Basics"
        ],
        "achievements": [
          "Create structured web pages",
          "Style web pages with modern CSS",
          "Manage code with Git"
        ]
      },
      {
        "title": "JavaScript Fundamentals",
        "topics": [
          "Variables and Data Types",
          "Functions and Scope",
          "DOM Manipulation"
        ],
        "achievements": [
          "Write clean JavaScript code",
          "Manipulate web pages dynamically",
          "Understand JavaScript core concepts"
        ]
      }
    ];
    setJsonInput(JSON.stringify(sample, null, 2));
    setError('');
  };

  return (
    <div className="space-y-8">
      {/* Curriculum Subtitle Input */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Curriculum Subtitle / Short Description
        </label>
        <textarea
          value={curriculumSubtitle}
          onChange={(e) => setCurriculumSubtitle(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 min-h-[100px]"
          placeholder="Short description that appears under the 'Course Curriculum' title"
        />
        <p className="mt-2 text-xs text-gray-500">
          This description appears right below the "Course Curriculum" heading on the public course page.
        </p>
      </div>

      <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">JSON Format</h3>
        <p className="text-gray-400 mb-4">
          Upload curriculum data in JSON format. Each module should have a title, topics array, and achievements array.
        </p>
        <button
          type="button"
          onClick={loadSample}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium"
        >
          Load Sample Format
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <textarea
          value={jsonInput}
          onChange={handleJsonChange}
          className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-mono text-sm"
          placeholder='[
  {
    "title": "Module Title",
    "topics": ["Topic 1", "Topic 2"],
    "achievements": ["Achievement 1", "Achievement 2"]
  }
]'
        />
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Curriculum'}
      </button>
    </div>
  </div>
);
}

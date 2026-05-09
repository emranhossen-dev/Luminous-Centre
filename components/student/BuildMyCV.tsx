"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code
} from 'lucide-react';

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  skills: string[];
  achievements: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export default function BuildMyCV() {
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'achievements'>('personal');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCVData();
  }, []);

  const fetchCVData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/cv', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCvData(data.cv || cvData);
      }
    } catch (error) {
      console.error('Failed to fetch CV data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCVData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cvData),
      });

      if (response.ok) {
        setIsEditing(false);
        alert('CV saved successfully!');
      } else {
        alert('Failed to save CV');
      }
    } catch (error) {
      console.error('Save CV error:', error);
    }
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        title: '',
        company: '',
        duration: '',
        description: ''
      }]
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        degree: '',
        institution: '',
        year: '',
        description: ''
      }]
    }));
  };

  const addAchievement = () => {
    setCvData(prev => ({
      ...prev,
      achievements: [...prev.achievements, {
        id: Date.now().toString(),
        title: '',
        description: ''
      }]
    }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading CV data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Build My CV</h1>
          <p className="text-slate-400">Create and manage your professional resume.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <button
              onClick={saveCVData}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Save size={16} />
              Save CV
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Edit size={16} />
              Edit CV
            </button>
          )}
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20'
                      : 'hover:bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6">
            {/* Personal Info */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.fullName}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={cvData.personalInfo.email}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={cvData.personalInfo.phone}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.location}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Professional Summary</label>
                  <textarea
                    value={cvData.personalInfo.summary}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, summary: e.target.value }
                    }))}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  />
                </div>
              </motion.div>
            )}

            {/* Skills */}
            {activeTab === 'skills' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Skills</h2>
                  <button
                    onClick={() => {
                      const newSkill = prompt('Enter new skill:');
                      if (newSkill) {
                        setCvData(prev => ({
                          ...prev,
                          skills: [...prev.skills, newSkill]
                        }));
                      }
                    }}
                    disabled={!isEditing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Add Skill
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {cvData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/10 rounded-xl">
                      <span className="text-sm text-white">{skill}</span>
                      {isEditing && (
                        <button
                          onClick={() => setCvData(prev => ({
                            ...prev,
                            skills: prev.skills.filter((_, i) => i !== index)
                          }))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Experience */}
            {activeTab === 'experience' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Work Experience</h2>
                  <button
                    onClick={addExperience}
                    disabled={!isEditing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Add Experience
                  </button>
                </div>
                {cvData.experience.map((exp, index) => (
                  <div key={exp.id} className="bg-slate-800/50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => setCvData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) =>
                              i === index ? { ...item, title: e.target.value } : item
                            )
                          }))}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => setCvData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) =>
                              i === index ? { ...item, company: e.target.value } : item
                            )
                          }))}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => setCvData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) =>
                              i === index ? { ...item, duration: e.target.value } : item
                            )
                          }))}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => setCvData(prev => ({
                          ...prev,
                          experience: prev.experience.map((item, i) =>
                            i === index ? { ...item, description: e.target.value } : item
                          )
                        }))}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-xl text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      />
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => setCvData(prev => ({
                          ...prev,
                          experience: prev.experience.filter((_, i) => i !== index)
                        }))}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Other tabs would follow similar pattern... */}
            {activeTab === 'education' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Education</h2>
                  <button
                    onClick={addEducation}
                    disabled={!isEditing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Add Education
                  </button>
                </div>
                <p className="text-slate-500">Add your educational background...</p>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Achievements</h2>
                  <button
                    onClick={addAchievement}
                    disabled={!isEditing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Add Achievement
                  </button>
                </div>
                <p className="text-slate-500">Add your achievements and awards...</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

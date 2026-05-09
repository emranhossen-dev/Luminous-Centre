"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourseBannerFormData, Feature } from "@/types/course-banner";
import { ClientAuth } from "@/lib/client-auth";
import { Save, Plus, Trash2, ArrowLeft } from "lucide-react";

// Default form data matching the JSON structure
const DEFAULT_FORM_DATA: CourseBannerFormData = {
  banner: {
    badge: "Online Course",
    title: "AI-Ready MERN Stack Web Development",
    description: "আমাদের এই কোর্সটি ডিজাইন করা হয়েছে আপনাকে একজন প্রফেশনাল ফুল-স্ট্যাক ডেভেলপার হিসেবে গড়ে তোলার জন্য। যেখানে আমরা ফ্রন্টএন্ড থেকে ব্যাকএন্ড পর্যন্ত সবকিছুই রিয়েল-লাইফ প্রোজেক্টের মাধ্যমে শিখব।",
    pricing: {
      current: 8000,
      regular: 10000,
      currency: "TK"
    },
    stats: {
      classes: "60+",
      projects: "12+"
    },
    enrollment: {
      deadlineDate: "2026-05-22T23:59:59Z",
      startDate: "2026-06-01T10:00:00Z",
      thumbnailUrl: "https://your-storage.com/video-thumb.png"
    },
    videoSection: {
      videoUrl: "https://www.youtube.com/embed/example-id",
      label: "Course Preview Video"
    },
    learningOutcomes: {
      sectionTitle: "কোর্স থেকে যা শিখবেন",
      features: [
        { id: 1, title: "প্রফেশনাল স্কিল", subtitle: "ইন্ডাস্ট্রি স্ট্যান্ডার্ড", icon: "TrendingUp" },
        { id: 2, title: "রিয়েল প্রোজেক্ট", subtitle: "১২+ প্রোজেক্ট তৈরি", icon: "CheckSquare" },
        { id: 3, title: "জব প্লেসমেন্ট", subtitle: "ক্যারিয়ার গাইডলাইন", icon: "Users" },
        { id: 4, title: "সার্টিফিকেট", subtitle: "ভেরিফাইড সার্টিফিকেট", icon: "Award" }
      ]
    }
  }
};

export default function CourseEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CourseBannerFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      const resolvedParams = await params;
      if (!mounted) return;

      // Check authentication
      if (!ClientAuth.isAuthenticated()) {
        router.push(`/auth/login?redirect=course-edit&course=${resolvedParams.slug}`);
        return;
      }

      setSlug(resolvedParams.slug);
      
      // In a real app, fetch existing course data here
      // const courseData = await fetchCourseBannerData(resolvedParams.slug);
      // setFormData(courseData);
      
      setLoading(false);
    };

    initializePage();
    return () => { mounted = false; };
  }, [params, router]);

  const handleInputChange = (path: string, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleFeatureChange = (index: number, field: keyof Feature, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      banner: {
        ...prev.banner,
        learningOutcomes: {
          ...prev.banner.learningOutcomes,
          features: prev.banner.learningOutcomes.features.map((feature, i) =>
            i === index ? { ...feature, [field]: value } : feature
          )
        }
      }
    }));
  };

  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now(),
      title: "",
      subtitle: "",
      icon: ""
    };
    
    setFormData(prev => ({
      ...prev,
      banner: {
        ...prev.banner,
        learningOutcomes: {
          ...prev.banner.learningOutcomes,
          features: [...prev.banner.learningOutcomes.features, newFeature]
        }
      }
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      banner: {
        ...prev.banner,
        learningOutcomes: {
          ...prev.banner.learningOutcomes,
          features: prev.banner.learningOutcomes.features.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, save to API
      // await saveCourseBannerData(slug, formData);
      console.log("Saving course data:", formData);
      
      // Show success message
      alert("Course data saved successfully!");
      
      // Redirect back to course page
      router.push(`/courses/${slug}`);
    } catch (error) {
      console.error("Error saving course data:", error);
      alert("Error saving course data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080616] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080616] text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/courses/${slug}`)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">Edit Course Banner</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#00a651] hover:bg-[#008c44] px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="bg-[#121821] rounded-lg p-6 border border-[#1e293b]">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Badge</label>
                  <input
                    type="text"
                    value={formData.banner.badge}
                    onChange={(e) => handleInputChange('banner.badge', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.banner.title}
                    onChange={(e) => handleInputChange('banner.title', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.banner.description}
                    onChange={(e) => handleInputChange('banner.description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-[#121821] rounded-lg p-6 border border-[#1e293b]">
              <h2 className="text-xl font-semibold mb-4">Pricing</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Price</label>
                  <input
                    type="number"
                    value={formData.banner.pricing.current}
                    onChange={(e) => handleInputChange('banner.pricing.current', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Regular Price</label>
                  <input
                    type="number"
                    value={formData.banner.pricing.regular}
                    onChange={(e) => handleInputChange('banner.pricing.regular', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <input
                    type="text"
                    value={formData.banner.pricing.currency}
                    onChange={(e) => handleInputChange('banner.pricing.currency', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#121821] rounded-lg p-6 border border-[#1e293b]">
              <h2 className="text-xl font-semibold mb-4">Stats</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Classes</label>
                  <input
                    type="text"
                    value={formData.banner.stats.classes}
                    onChange={(e) => handleInputChange('banner.stats.classes', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Projects</label>
                  <input
                    type="text"
                    value={formData.banner.stats.projects}
                    onChange={(e) => handleInputChange('banner.stats.projects', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment and Video */}
          <div className="space-y-6">
            <div className="bg-[#121821] rounded-lg p-6 border border-[#1e293b]">
              <h2 className="text-xl font-semibold mb-4">Enrollment</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline Date</label>
                  <input
                    type="datetime-local"
                    value={formData.banner.enrollment.deadlineDate.slice(0, 16)}
                    onChange={(e) => handleInputChange('banner.enrollment.deadlineDate', e.target.value + ':00Z')}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.banner.enrollment.startDate.slice(0, 16)}
                    onChange={(e) => handleInputChange('banner.enrollment.startDate', e.target.value + ':00Z')}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.banner.enrollment.thumbnailUrl}
                    onChange={(e) => handleInputChange('banner.enrollment.thumbnailUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="bg-[#121821] rounded-lg p-6 border border-[#1e293b]">
              <h2 className="text-xl font-semibold mb-4">Video Section</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL</label>
                  <input
                    type="url"
                    value={formData.banner.videoSection.videoUrl}
                    onChange={(e) => handleInputChange('banner.videoSection.videoUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Label</label>
                  <input
                    type="text"
                    value={formData.banner.videoSection.label}
                    onChange={(e) => handleInputChange('banner.videoSection.label', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                  />
                </div>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-[#121821] rounded-lg p-6 border border-[#1e293b]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Learning Outcomes</h2>
                <button
                  onClick={addFeature}
                  className="flex items-center gap-2 bg-[#00a651] hover:bg-[#008c44] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <input
                  type="text"
                  value={formData.banner.learningOutcomes.sectionTitle}
                  onChange={(e) => handleInputChange('banner.learningOutcomes.sectionTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-[#080616] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651] mb-4"
                />
              </div>

              <div className="space-y-4">
                {formData.banner.learningOutcomes.features.map((feature, index) => (
                  <div key={feature.id} className="bg-[#080616] rounded-lg p-4 border border-[#1e293b]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Feature {index + 1}</span>
                      <button
                        onClick={() => removeFeature(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={feature.title}
                        onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                        className="px-3 py-2 bg-[#121821] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                      />
                      <input
                        type="text"
                        placeholder="Subtitle"
                        value={feature.subtitle}
                        onChange={(e) => handleFeatureChange(index, 'subtitle', e.target.value)}
                        className="px-3 py-2 bg-[#121821] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                      />
                      <input
                        type="text"
                        placeholder="Icon (Lucide icon name)"
                        value={feature.icon}
                        onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                        className="px-3 py-2 bg-[#121821] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#00a651]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

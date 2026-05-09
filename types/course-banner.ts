export interface Feature {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

export interface BannerRow {
  id?: string;
  badge: string;
  title: string;
  description: string;
  current_price: number;
  regular_price: number;
  currency: string;
  classes_count: string;
  projects_count: string;
  enrollment_deadline: string;
  class_start_date: string;
  thumbnail_url: string;
  video_url: string;
  learning_outcomes: Feature[];
  updated_at?: string;
  course_id?: number;
}

export interface CourseBannerFormData {
  banner: {
    badge: string;
    title: string;
    description: string;
    pricing: {
      current: number;
      regular: number;
      currency: string;
    };
    stats: {
      classes: string;
      projects: string;
    };
    enrollment: {
      deadlineDate: string;
      startDate: string;
      thumbnailUrl: string;
    };
    videoSection: {
      videoUrl: string;
      label: string;
    };
    learningOutcomes: {
      sectionTitle: string;
      features: Feature[];
    };
  };
}

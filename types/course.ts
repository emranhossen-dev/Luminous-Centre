// Course form data interface - what the admin inputs
export interface CourseFormData {
  title: string;
  slug: string;
  thumbnail_url: string;
  category: 'online' | 'offline' | 'recorded' | 'project';
  price: number | string;
  old_price: number | string;
  description: string;
  access_type: 'paid' | 'free';
  status: 'draft' | 'published';
  featured: boolean;
  batch: string; // The numeric input (e.g., "4")
  enrollment_ends: string;
  class_starts: string;
  selected_days: string[]; // e.g., ["Sat", "Mon", "Wed"]
  course_outline_url: string;
}

// Clean version sent to Database
export interface CourseSubmission extends Omit<CourseFormData, 'batch' | 'price' | 'old_price'> {
  batch: string;          // Formatted as "Batch-04"
  price: number;
  old_price: number;
  selected_days: string[]; // Formatted as ["Sat", "Mon"]
  course_outline_url: string; // PDF outline URL
}

// Course display interface
export interface Course {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  category: string;
  price: number;
  old_price: number;
  description: string;
  access_type: string;
  status: string;
  featured: boolean;
  batch: string;
  enrollment_ends: string;
  class_starts: string;
  selected_days: string[];
  created_at: string;
  updated_at: string;
  enrollmentCount?: number;
  createdBy?: string;
}

// Course details page API structure
export interface CourseData {
  id: string;
  slug: string;
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
  course_outline_url?: string;
  category: 'online' | 'offline' | 'recorded' | 'project';
  batch?: string;
  learning_outcomes: Array<{
    title: string;
    subtitle: string;
    icon: string;
  }>;
}

export interface LearningOutcome {
  title: string;
  subtitle: string;
  icon: string;
}

// Course details update form data
export interface CourseDetailsFormData {
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
  learning_outcomes: LearningOutcome[];
}

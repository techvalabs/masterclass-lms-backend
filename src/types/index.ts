// Core Types for Real Estate Masterclass LMS Backend
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string; // Optional for response objects
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  email_verified_at?: Date;
  verification_token?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  last_login_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  location?: string;
  timezone: string;
  notification_preferences?: NotificationPreferences;
  marketing_consent: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  course_updates: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
  digest_frequency: 'daily' | 'weekly' | 'never';
}

export interface Instructor {
  id: string;
  user_id: string;
  bio: string;
  expertise: string[];
  rating: number;
  total_ratings: number;
  students_count: number;
  courses_count: number;
  total_earnings: number;
  commission_rate: number;
  is_verified: boolean;
  verification_date?: Date;
  created_at: Date;
  updated_at: Date;
  user?: User; // Populated user data
}

// Course Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  thumbnail?: string;
  preview_video?: string;
  instructor_id: string;
  category_id: string;
  price: number;
  original_price?: number;
  currency: string;
  duration_minutes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  tags?: string[];
  features?: string[];
  learning_objectives?: string[];
  prerequisites?: string[];
  target_audience?: string[];
  rating: number;
  total_ratings: number;
  students_count: number;
  is_paid: boolean;
  is_published: boolean;
  is_featured: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
  instructor?: Instructor;
  category?: Category;
  modules?: Module[];
  total_lessons?: number;
  user_enrollment?: Enrollment;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  sort_order: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
  lessons?: Lesson[];
  lesson_count?: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  video_duration_seconds: number;
  video_provider?: 'local' | 'youtube' | 'vimeo' | 'wistia';
  video_id?: string;
  transcript?: string;
  sort_order: number;
  is_free: boolean;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
  resources?: Resource[];
  quiz?: Quiz;
  user_progress?: LessonProgress;
}

export interface Resource {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'link';
  file_path?: string;
  file_size?: number;
  file_mime_type?: string;
  external_url?: string;
  download_count: number;
  sort_order: number;
  is_downloadable: boolean;
  created_at: Date;
  updated_at: Date;
}

// Progress and Enrollment Types
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_date: Date;
  completion_date?: Date;
  progress_percentage: number;
  last_accessed_at?: Date;
  last_lesson_id?: string;
  time_spent_minutes: number;
  is_completed: boolean;
  completion_rate: number;
  created_at: Date;
  updated_at: Date;
  course?: Course;
  certificate?: Certificate;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  completion_percentage: number;
  time_spent_seconds: number;
  video_position_seconds: number;
  first_accessed_at: Date;
  completed_at?: Date;
  last_accessed_at: Date;
  lesson?: Lesson;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  certificate_number: string;
  issued_date: Date;
  completion_score?: number;
  certificate_url?: string;
  certificate_path?: string;
  verification_code: string;
  is_verified: boolean;
  metadata?: any;
  created_at: Date;
  user?: User;
  course?: Course;
}

// Rating and Review Types
export interface CourseRating {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review?: string;
  is_public: boolean;
  is_verified_purchase: boolean;
  helpful_votes: number;
  reported_count: number;
  instructor_reply?: string;
  instructor_reply_date?: Date;
  created_at: Date;
  updated_at: Date;
  user?: User;
}

// Payment Types
export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method?: string;
  payment_provider?: string;
  payment_transaction_id?: string;
  tax_amount: number;
  discount_amount: number;
  coupon_code?: string;
  billing_details?: any;
  payment_metadata?: any;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  course_id: string;
  price: number;
  original_price?: number;
  discount_amount: number;
  quantity: number;
  created_at: Date;
  course?: Course;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  user_limit?: number;
  applicable_courses?: string[];
  applicable_categories?: string[];
  starts_at?: Date;
  expires_at?: Date;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Quiz Types
export interface Quiz {
  id: string;
  lesson_id?: string;
  course_id: string;
  title: string;
  description?: string;
  instructions?: string;
  time_limit_minutes?: number;
  attempts_allowed: number;
  passing_score: number;
  randomize_questions: boolean;
  show_correct_answers: boolean;
  is_required: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  questions?: QuizQuestion[];
  user_attempts?: QuizAttempt[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: 'multiple_choice' | 'single_choice' | 'true_false' | 'text' | 'essay';
  options?: string[];
  correct_answers?: string[];
  explanation?: string;
  points: number;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  attempt_number: number;
  score?: number;
  total_points: number;
  earned_points: number;
  is_passed: boolean;
  is_completed: boolean;
  started_at: Date;
  completed_at?: Date;
  time_taken_seconds?: number;
  answers?: any;
  quiz?: Quiz;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  metadata?: any;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

// System Types
export interface SystemSetting {
  id: string;
  key: string;
  value?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_public: boolean;
  group_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: Date;
}

export interface FileUpload {
  id: string;
  user_id?: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  storage_driver: string;
  entity_type?: string;
  entity_id?: string;
  is_processed: boolean;
  metadata?: any;
  created_at: Date;
}

// Authentication Types
export interface AuthUser extends JwtPayload {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  is_active: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'student' | 'instructor';
  marketing_consent?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface RefreshTokenPayload {
  user_id: string;
  token_id: string;
  expires_at: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  query?: string;
  category?: string;
  level?: string;
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  is_free?: boolean;
  instructor?: string;
  tags?: string[];
}

// Database Types
export interface DatabaseConnection {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  timeout: number;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  affectedRows?: number;
  insertId?: string;
}

// File Upload Types
export interface UploadOptions {
  allowedTypes?: string[];
  maxSize?: number;
  destination?: string;
  generateThumbnail?: boolean;
  processVideo?: boolean;
}

export interface ProcessedFile {
  id: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  url: string;
  thumbnail_url?: string;
  metadata?: any;
}

// Email Types
export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  templateData?: any;
  html?: string;
  text?: string;
  attachments?: any[];
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  variables?: string[];
}

// Cache Types
export interface CacheOptions {
  key: string;
  data: any;
  ttl?: number;
}

// Error Types
export interface ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Analytics Types
export interface AnalyticsData {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue: number;
  active_students: number;
  course_completions: number;
  popular_courses: Course[];
  recent_enrollments: Enrollment[];
  revenue_by_month: { month: string; revenue: number }[];
  user_growth: { date: string; count: number }[];
}

export interface CourseAnalytics {
  course_id: string;
  total_enrollments: number;
  total_completions: number;
  completion_rate: number;
  average_rating: number;
  total_revenue: number;
  engagement_metrics: {
    average_watch_time: number;
    completion_by_lesson: { lesson_id: string; completion_rate: number }[];
    drop_off_points: { lesson_id: string; drop_off_rate: number }[];
  };
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

// Background Job Types
export interface Job {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  max_attempts: number;
  created_at: Date;
  processed_at?: Date;
  completed_at?: Date;
  error?: string;
}

// Configuration Types
export interface AppConfig {
  app: {
    name: string;
    version: string;
    port: number;
    env: string;
    debug: boolean;
  };
  database: DatabaseConnection;
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  jwt: {
    secret: string;
    refresh_secret: string;
    expires_in: string;
    refresh_expires_in: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    from_name: string;
  };
  upload: {
    path: string;
    max_size: number;
    allowed_types: {
      images: string[];
      videos: string[];
      documents: string[];
    };
  };
  security: {
    bcrypt_rounds: number;
    rate_limit: {
      window_ms: number;
      max_requests: number;
    };
    cors_origin: string;
  };
}

export default {
  User,
  Course,
  Module,
  Lesson,
  Enrollment,
  AuthUser,
  AuthRequest,
  ApiResponse
};
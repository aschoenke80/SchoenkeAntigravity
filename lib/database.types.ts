export type UserRole = 'admin' | 'instructor' | 'student'

export interface User {
  id: string
  email: string
  name: string
  student_id_number?: string | null
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor_id: string
  cover_image?: string
  is_published: boolean
  created_at: string
  updated_at: string
  instructor?: User
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  student?: User
  course?: Course
}

export interface CourseMaterial {
  id: string
  course_id: string
  file_name: string
  file_url: string
  extracted_text: string
  uploaded_at: string
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'identification' | 'short_answer'

export interface ExamQuestion {
  id: string
  question: string
  type: QuestionType
  options?: string[]
  correct_answer: string
  points: number
}

export interface Exam {
  id: string
  course_id: string
  title: string
  description: string
  questions: ExamQuestion[]
  is_published: boolean
  time_limit_minutes?: number
  created_at: string
  updated_at: string
  course?: Course
}

export interface ExamSubmission {
  id: string
  exam_id: string
  student_id: string
  answers: Record<string, string>
  score: number
  total_points: number
  submitted_at: string
  exam?: Exam
  student?: User
}

// =====================================================
// MODULES & LESSONS
// =====================================================
export interface Module {
  id: string
  course_id: string
  title: string
  description?: string
  sort_order: number
  created_at: string
  updated_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content?: string
  content_type: 'text' | 'pdf' | 'video'
  video_url?: string
  pdf_material_id?: string
  sort_order: number
  duration_minutes?: number
  created_at: string
  updated_at: string
}

// =====================================================
// PROGRESS TRACKING
// =====================================================
export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  completed: boolean
  completed_at?: string
  created_at: string
}

// =====================================================
// GAMIFICATION
// =====================================================
export interface Badge {
  id: string
  name: string
  description?: string
  icon: string
  criteria: string
  xp_reward: number
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface XPLog {
  id: string
  user_id: string
  amount: number
  reason: string
  reference_id?: string
  created_at: string
}

// =====================================================
// DISCUSSION FORUM
// =====================================================
export interface Discussion {
  id: string
  course_id: string
  user_id: string
  title: string
  content: string
  is_pinned: boolean
  likes_count: number
  replies_count: number
  created_at: string
  updated_at: string
  user?: User
}

export interface DiscussionReply {
  id: string
  discussion_id: string
  user_id: string
  content: string
  likes_count: number
  created_at: string
  user?: User
}

// =====================================================
// NOTIFICATIONS
// =====================================================
export type NotificationType = 'info' | 'success' | 'warning' | 'exam' | 'course' | 'badge'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  link?: string
  is_read: boolean
  created_at: string
}

// =====================================================
// CERTIFICATES
// =====================================================
export interface Certificate {
  id: string
  student_id: string
  course_id: string
  issued_at: string
  certificate_number: string
  course?: Course
}

// =====================================================
// AI CHAT
// =====================================================
export interface ChatMessage {
  id: string
  course_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// =====================================================
// FLASHCARDS & PRACTICE QUIZZES
// =====================================================
export interface Flashcard {
  front: string
  back: string
}

export interface FlashcardSet {
  id: string
  course_id: string
  user_id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  cards: Flashcard[]
  created_at: string
}

export interface PracticeQuiz {
  id: string
  course_id: string
  user_id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: ExamQuestion[]
  score?: number
  total_points?: number
  completed_at?: string
  created_at: string
}

// =====================================================
// QUESTION BANK
// =====================================================
export interface QuestionBankItem {
  id: string
  course_id: string
  question: string
  type: QuestionType
  options?: string[]
  correct_answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  tags?: string[]
  created_at: string
}

import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import StudentCourseDetailClient from './StudentCourseDetailClient'
import { getStudentCourseProgress } from '@/app/actions/progress'

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(['student'])
  const { id } = await params

  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('*, users(name)')
    .eq('id', id)
    .single()

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>📚</p>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Course not found</h2>
      </div>
    )
  }

  // Check enrollment
  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('student_id', session.userId)
    .eq('course_id', id)
    .single()

  const hasEnrolled = !!enrollment

  // Fetch modules with lessons
  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', id)
    .order('sort_order', { ascending: true })

  const sortedModules = (modules || []).map((m: any) => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }))

  const { data: materials } = await supabaseAdmin
    .from('course_materials')
    .select('id, file_name, uploaded_at')
    .eq('course_id', id)
    .order('uploaded_at', { ascending: false })

  const { data: exams } = await supabaseAdmin
    .from('exams')
    .select('id, title, questions, time_limit_minutes, is_published')
    .eq('course_id', id)
    .eq('is_published', true)

  const { data: submissions } = await supabaseAdmin
    .from('exam_submissions')
    .select('exam_id')
    .eq('student_id', session.userId)

  const completedExamIds = submissions?.map(s => s.exam_id) || []

  // Get lesson progress
  const allLessonIds = sortedModules.flatMap((m: any) => m.lessons.map((l: any) => l.id))
  let completedLessonIds: string[] = []
  if (allLessonIds.length > 0) {
    const { data: progressData } = await supabaseAdmin
      .from('lesson_progress')
      .select('lesson_id')
      .eq('student_id', session.userId)
      .eq('completed', true)
      .in('lesson_id', allLessonIds)

    completedLessonIds = progressData?.map(p => p.lesson_id) || []
  }

  const progress = await getStudentCourseProgress(session.userId, id)

  // Get chat history
  const { data: chatMessages } = await supabaseAdmin
    .from('chat_messages')
    .select('role, content')
    .eq('course_id', id)
    .eq('user_id', session.userId)
    .order('created_at', { ascending: true })
    .limit(50)

  return (
    <div className="animate-fade-in">
      <Link href="/dashboard/student/courses"
        style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '16px', display: 'inline-block' }}>
        ← Back to Courses
      </Link>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{course.title}</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '24px' }}>
        By {(course.users as { name: string })?.name}
      </p>

      <StudentCourseDetailClient
        course={{
          id: course.id,
          title: course.title,
          description: course.description,
          instructor_name: (course.users as { name: string })?.name || 'Unknown',
        }}
        modules={sortedModules}
        materials={materials || []}
        exams={exams || []}
        completedExamIds={completedExamIds}
        completedLessonIds={completedLessonIds}
        progress={progress}
        chatHistory={(chatMessages as any) || []}
        hasEnrolled={hasEnrolled}
      />
    </div>
  )
}

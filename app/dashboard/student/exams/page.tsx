import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function StudentExamsPage() {
  const session = await requireAuth(['student'])

  // Get enrolled courses
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('course_id')
    .eq('student_id', session.userId)

  const enrolledCourseIds = enrollments?.map(e => e.course_id) || []

  // Get published exams for enrolled courses
  let exams: Record<string, unknown>[] = []
  if (enrolledCourseIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('exams')
      .select('*, courses(title)')
      .in('course_id', enrolledCourseIds)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    exams = data || []
  }

  // Get submissions
  const { data: submissions } = await supabaseAdmin
    .from('exam_submissions')
    .select('exam_id')
    .eq('student_id', session.userId)

  const submittedExamIds = new Set(submissions?.map(s => s.exam_id) || [])

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>My Exams</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '32px' }}>
        Take exams from your enrolled courses
      </p>

      {exams.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {exams.map((exam) => {
            const isSubmitted = submittedExamIds.has(exam.id as string)
            return (
              <div key={exam.id as string} className="glass-card" style={{
                padding: '20px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '12px'
              }}>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{exam.title as string}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>
                    {(exam.courses as { title: string })?.title} · {(exam.questions as unknown[]).length} questions
                    {exam.time_limit_minutes ? ` · ${exam.time_limit_minutes} min` : null}
                  </p>
                </div>
                {isSubmitted ? (
                  <span className="badge badge-accent">Completed ✓</span>
                ) : (
                  <Link href={`/dashboard/student/exams/${exam.id}`} className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                    Take Exam →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📝</p>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No exams available</h3>
          <p style={{ color: 'var(--color-surface-400)' }}>
            Enroll in courses to see available exams
          </p>
          <Link href="/dashboard/student/courses" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  )
}

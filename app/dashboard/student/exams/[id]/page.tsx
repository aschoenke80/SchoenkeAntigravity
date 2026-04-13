import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ExamTakingClient from './ExamTakingClient'

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(['student'])
  const { id } = await params

  const { data: exam } = await supabaseAdmin
    .from('exams')
    .select('*, courses(title)')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!exam) notFound()

  // Check if already submitted
  const { data: existing } = await supabaseAdmin
    .from('exam_submissions')
    .select('id, score, total_points')
    .eq('exam_id', id)
    .eq('student_id', session.userId)
    .single()

  if (existing) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '60px' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>✅</p>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Exam Already Submitted</h2>
          <p style={{ color: 'var(--color-surface-400)', marginBottom: '20px' }}>
            You have already completed this exam.
          </p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary-400)', marginBottom: '8px' }}>
            {existing.score}/{existing.total_points}
          </p>
          <p style={{ color: 'var(--color-surface-500)' }}>
            {existing.total_points > 0 ? Math.round((existing.score / existing.total_points) * 100) : 0}% Score
          </p>
        </div>
      </div>
    )
  }

  // Prepare questions without correct answers for the client
  const safeQuestions = (exam.questions as { id: string; question: string; type: string; options?: string[]; points: number }[]).map(
    (q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
    })
  )

  return (
    <ExamTakingClient
      examId={exam.id}
      examTitle={exam.title}
      courseTitle={(exam.courses as { title: string })?.title}
      questions={safeQuestions}
      timeLimitMinutes={exam.time_limit_minutes}
    />
  )
}

import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ExamBuilderClient from './ExamBuilderClient'

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth(['instructor'])
  const { id } = await params

  const { data: exam } = await supabaseAdmin
    .from('exams')
    .select('*, courses(id, title, instructor_id)')
    .eq('id', id)
    .single()

  if (!exam) notFound()

  // Get materials for AI generation
  const { data: materials } = await supabaseAdmin
    .from('course_materials')
    .select('id, file_name, extracted_text')
    .eq('course_id', (exam.courses as { id: string }).id)

  // Get submissions
  const { data: submissions } = await supabaseAdmin
    .from('exam_submissions')
    .select('*, users(name, email)')
    .eq('exam_id', id)
    .order('submitted_at', { ascending: false })

  return (
    <div className="animate-fade-in">
      <Link href="/dashboard/instructor/exams"
        style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '16px', display: 'inline-block' }}>
        ← Back to Exams
      </Link>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{exam.title}</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`badge ${exam.is_published ? 'badge-accent' : 'badge-warning'}`}>
            {exam.is_published ? 'Published' : 'Draft'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>
            {(exam.courses as { title: string })?.title}
          </span>
        </div>
      </div>

      <ExamBuilderClient
        exam={exam}
        materials={materials || []}
        submissions={submissions || []}
      />
    </div>
  )
}

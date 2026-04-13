import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function InstructorExamsPage() {
  const session = await requireAuth(['instructor'])

  const { data: exams } = await supabaseAdmin
    .from('exams')
    .select('*, courses!inner(title, instructor_id)')
    .eq('courses.instructor_id', session.userId)
    .order('created_at', { ascending: false })

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>My Exams</h1>
        <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
          Manage exams across all your courses
        </p>
      </div>

      {exams && exams.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/dashboard/instructor/exams/${exam.id}`}
              className="glass-card"
              style={{
                padding: '20px', textDecoration: 'none', color: 'inherit',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{exam.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>
                  {(exam.courses as { title: string })?.title} · {(exam.questions as unknown[]).length} questions
                </p>
              </div>
              <span className={`badge ${exam.is_published ? 'badge-accent' : 'badge-warning'}`}>
                {exam.is_published ? 'Published' : 'Draft'}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📝</p>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No exams yet</h3>
          <p style={{ color: 'var(--color-surface-400)', marginBottom: '24px' }}>
            Create exams from your course pages
          </p>
          <Link href="/dashboard/instructor/courses" className="btn-primary">Go to Courses</Link>
        </div>
      )}
    </div>
  )
}

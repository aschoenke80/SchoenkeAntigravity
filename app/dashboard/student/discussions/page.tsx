import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function StudentDiscussionsPage() {
  const session = await requireAuth(['student', 'instructor'])

  let courseIds: string[] = []

  if (session.role === 'instructor') {
    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('instructor_id', session.userId)
    courseIds = courses?.map(c => c.id) || []
  } else {
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('student_id', session.userId)
    courseIds = enrollments?.map(e => e.course_id) || []
  }

  let discussions: any[] = []
  if (courseIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('discussions')
      .select('*, users(name), courses(title)')
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })
      .limit(50)

    discussions = data || []
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Discussions</h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>Join conversations with your classmates</p>
        </div>
        <Link href="/dashboard/student/discussions/new" className="btn-primary">
          New Discussion
        </Link>
      </div>

      {discussions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {discussions.map((d) => (
            <Link
              key={d.id}
              href={`/dashboard/student/discussions/${d.id}`}
              className="glass-card"
              style={{ padding: '20px', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {d.is_pinned && <span style={{ fontSize: '12px', color: '#f59e0b' }}>📌</span>}
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{d.title}</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '8px', lineHeight: 1.5 }}>
                    {d.content?.slice(0, 150)}{d.content?.length > 150 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-surface-500)' }}>
                    <span>by {d.users?.name}</span>
                    <span>in {d.courses?.title}</span>
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="badge badge-accent" style={{ flexShrink: 0 }}>
                  {d.replies_count || 0} replies
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>💬</p>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No discussions yet</h2>
          <p style={{ color: 'var(--color-surface-500)', marginBottom: '16px' }}>
            Start a conversation with your classmates
          </p>
          <Link href="/dashboard/student/discussions/new" className="btn-primary">
            Start Discussion
          </Link>
        </div>
      )}
    </div>
  )
}

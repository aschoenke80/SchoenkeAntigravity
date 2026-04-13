import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function InstructorDiscussionsPage() {
  const session = await requireAuth(['instructor'])

  // Get courses the instructor owns
  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('id, title')
    .eq('instructor_id', session.userId)

  const courseIds = courses?.map(c => c.id) || []

  let discussions: any[] = []
  if (courseIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('discussions')
      .select('*, users(name, role), courses(title)')
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })
      .limit(50)

    discussions = data || []
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Course Discussions</h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>View and respond to student discussions</p>
        </div>
        <Link href="/dashboard/instructor/discussions/new" className="btn-primary">
          New Discussion
        </Link>
      </div>

      {discussions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {discussions.map((d) => (
            <Link
              key={d.id}
              href={`/dashboard/instructor/discussions/${d.id}`}
              className="glass-card"
              style={{ padding: '20px', textDecoration: 'none', color: 'inherit', display: 'block' }}
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
                    <span className="badge" style={{ padding: '1px 6px', fontSize: '10px', background: d.users?.role === 'instructor' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)', color: d.users?.role === 'instructor' ? '#f59e0b' : '#818cf8' }}>
                      {d.users?.role === 'instructor' ? 'Instructor' : 'Student'}
                    </span>
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
          <p style={{ color: 'var(--color-surface-500)' }}>
            Students haven&apos;t started any discussions in your courses yet
          </p>
        </div>
      )}
    </div>
  )
}

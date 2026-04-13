import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function StudentDashboard() {
  const session = await requireAuth(['student'])

  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('*, courses(*, users(name))')
    .eq('student_id', session.userId)

  const { data: submissions } = await supabaseAdmin
    .from('exam_submissions')
    .select('*, exams(title, course_id)')
    .eq('student_id', session.userId)
    .order('submitted_at', { ascending: false })
    .limit(5)

  // Get user XP
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('xp_total')
    .eq('id', session.userId)
    .single()

  // Get user badges
  const { data: userBadges } = await supabaseAdmin
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', session.userId)
    .order('earned_at', { ascending: false })
    .limit(5)

  // Get user rank
  const { data: studentsAbove } = await supabaseAdmin
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'student')
    .gt('xp_total', userData?.xp_total || 0)

  const rank = (studentsAbove as any)?.length !== undefined ? (studentsAbove as any).length + 1 : null

  const enrolledCount = enrollments?.length || 0
  const completedExams = submissions?.length || 0
  const avgScore = submissions && submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.total_points > 0 ? (s.score / s.total_points) * 100 : 0), 0) / submissions.length)
    : 0

  const stats = [
    { label: 'Enrolled Courses', value: enrolledCount, icon: '📚', color: '#6366f1' },
    { label: 'Exams Taken', value: completedExams, icon: '✅', color: '#10b981' },
    { label: 'Average Score', value: `${avgScore}%`, icon: '📊', color: '#f59e0b' },
    { label: 'Total XP', value: userData?.xp_total || 0, icon: '⚡', color: '#8b5cf6' },
  ]

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            Welcome, {session.name} 🎓
          </h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
            Browse courses, take exams, and track your progress
          </p>
        </div>
        <Link href="/dashboard/student/courses" className="btn-primary">
          Browse Courses
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '8px' }}>{stat.label}</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
              </div>
              <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled Courses */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>My Courses</h2>
        {enrollments && enrollments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {enrollments.map((enrollment: Record<string, unknown>) => {
              const course = enrollment.courses as Record<string, unknown> | null
              return (
                <Link
                  key={enrollment.id as string}
                  href={`/dashboard/student/courses/${(course as Record<string, unknown>)?.id}`}
                  style={{
                    padding: '20px', borderRadius: '12px', textDecoration: 'none',
                    background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.06)',
                    transition: 'all 0.2s', color: 'inherit', display: 'block'
                  }}
                >
                  <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>
                    {(course as Record<string, unknown>)?.title as string}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-surface-500)', marginBottom: '12px' }}>
                    {((course as Record<string, unknown>)?.description as string)?.slice(0, 100)}...
                  </p>
                  <span className="badge badge-accent">Enrolled</span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-surface-500)' }}>
            <p style={{ marginBottom: '16px' }}>You haven&apos;t enrolled in any courses yet.</p>
            <Link href="/dashboard/student/courses" className="btn-primary">Browse Courses</Link>
          </div>
        )}
      </div>

      {/* Recent Scores */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Recent Exam Scores</h2>
        {submissions && submissions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 500 }}>{sub.exams?.title}</td>
                    <td>
                      <span className={`badge ${(sub.score / sub.total_points) >= 0.7 ? 'badge-accent' : 'badge-danger'}`}>
                        {sub.score}/{sub.total_points} ({Math.round((sub.score / sub.total_points) * 100)}%)
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-surface-500)' }}>
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-surface-500)' }}>
            No exam submissions yet
          </p>
        )}
      </div>

      {/* Recent Badges */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Badges</h2>
          <Link href="/dashboard/student/leaderboard" style={{ fontSize: '13px', color: 'var(--color-primary-400)', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>
        {userBadges && userBadges.length > 0 ? (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {userBadges.map((ub: any) => (
              <div key={ub.id} style={{
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '24px' }}>{ub.badges?.icon || '🏅'}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{ub.badges?.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-surface-500)' }}>
                    {new Date(ub.earned_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-surface-500)' }}>
            Complete lessons and participate to earn badges!
          </p>
        )}
      </div>
    </div>
  )
}

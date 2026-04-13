import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export default async function ScoresPage() {
  const session = await requireAuth(['student'])

  const { data: submissions } = await supabaseAdmin
    .from('exam_submissions')
    .select('*, exams(title, questions, courses(title))')
    .eq('student_id', session.userId)
    .order('submitted_at', { ascending: false })

  const totalExams = submissions?.length || 0
  const avgPct = totalExams > 0
    ? Math.round(
        submissions!.reduce((acc, s) =>
          acc + (s.total_points > 0 ? (s.score / s.total_points) * 100 : 0), 0
        ) / totalExams
      )
    : 0

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>My Scores</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '32px' }}>
        Review your exam performance
      </p>

      {/* Summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        <div className="stat-card">
          <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '8px' }}>Exams Taken</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#6366f1' }}>{totalExams}</p>
        </div>
        <div className="stat-card">
          <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '8px' }}>Average Score</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: avgPct >= 70 ? '#10b981' : avgPct >= 50 ? '#f59e0b' : '#ef4444' }}>
            {avgPct}%
          </p>
        </div>
      </div>

      {/* Scores list */}
      {submissions && submissions.length > 0 ? (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const pct = sub.total_points > 0 ? Math.round((sub.score / sub.total_points) * 100) : 0
                  return (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 500 }}>{sub.exams?.title}</td>
                      <td style={{ color: 'var(--color-surface-400)' }}>
                        {(sub.exams?.courses as { title: string })?.title}
                      </td>
                      <td>{sub.score}/{sub.total_points}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '60px', height: '6px', borderRadius: '3px',
                            background: 'rgba(148,163,184,0.1)', overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${pct}%`, height: '100%', borderRadius: '3px',
                              background: pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
                              transition: 'width 0.5s'
                            }} />
                          </div>
                          <span className={`badge ${pct >= 70 ? 'badge-accent' : pct >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-surface-500)', fontSize: '13px' }}>
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📊</p>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No scores yet</h3>
          <p style={{ color: 'var(--color-surface-400)' }}>Take exams to see your scores here</p>
        </div>
      )}
    </div>
  )
}

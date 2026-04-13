import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export default async function AdminDashboard() {
  await requireAuth(['admin'])

  const { count: userCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
  const { count: courseCount } = await supabaseAdmin.from('courses').select('*', { count: 'exact', head: true })
  const { count: examCount } = await supabaseAdmin.from('exams').select('*', { count: 'exact', head: true })
  const { count: submissionCount } = await supabaseAdmin.from('exam_submissions').select('*', { count: 'exact', head: true })

  const stats = [
    { label: 'Total Users', value: userCount || 0, icon: '👥', color: '#6366f1' },
    { label: 'Total Courses', value: courseCount || 0, icon: '📚', color: '#10b981' },
    { label: 'Total Exams', value: examCount || 0, icon: '📝', color: '#f59e0b' },
    { label: 'Submissions', value: submissionCount || 0, icon: '📊', color: '#ef4444' },
  ]

  const { data: recentUsers } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
          Manage users, courses, and monitor platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '8px' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </p>
              </div>
              <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Recent Users
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers?.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 500 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'instructor' ? 'primary' : 'accent'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-surface-500)' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-surface-500)' }}>
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

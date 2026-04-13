'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

interface AnalyticsProps {
  stats: {
    totalStudents: number
    totalInstructors: number
    totalCourses: number
    totalExams: number
    totalSubmissions: number
  }
  coursesData: { name: string; enrolled: number }[]
  scoreDistribution: { range: string; count: number }[]
  recentActivity: { date: string; submissions: number }[]
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AdminAnalyticsClient({ stats, coursesData, scoreDistribution, recentActivity }: AnalyticsProps) {
  const statCards = [
    { label: 'Students', value: stats.totalStudents, color: '#6366f1', icon: '🎓' },
    { label: 'Instructors', value: stats.totalInstructors, color: '#10b981', icon: '👨‍🏫' },
    { label: 'Courses', value: stats.totalCourses, color: '#f59e0b', icon: '📚' },
    { label: 'Exams', value: stats.totalExams, color: '#8b5cf6', icon: '📝' },
    { label: 'Submissions', value: stats.totalSubmissions, color: '#06b6d4', icon: '✅' },
  ]

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Analytics</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '24px' }}>
        Platform performance overview
      </p>

      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px', marginBottom: '24px'
      }}>
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--color-surface-400)', marginBottom: '4px' }}>{s.label}</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Enrollment by course */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Enrollment by Course</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={coursesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#e2e8f0' }}
                />
                <Bar dataKey="enrolled" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score distribution */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Score Distribution</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={scoreDistribution} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={100} label>
                  {scoreDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Exam Submissions (Last 14 Days)</h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={recentActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="submissions" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

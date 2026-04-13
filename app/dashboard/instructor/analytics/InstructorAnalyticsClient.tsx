'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

interface InstructorAnalyticsProps {
  stats: {
    totalCourses: number
    totalStudents: number
    totalExams: number
    avgScore: number
  }
  courseEnrollments: { name: string; enrolled: number }[]
  courseCompletionData: { name: string; completed: number; inProgress: number }[]
  recentScores: { date: string; avgScore: number }[]
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444']

export default function InstructorAnalyticsClient({ stats, courseEnrollments, courseCompletionData, recentScores }: InstructorAnalyticsProps) {
  const statCards = [
    { label: 'My Courses', value: stats.totalCourses, color: '#6366f1', icon: '📚' },
    { label: 'Total Students', value: stats.totalStudents, color: '#10b981', icon: '🎓' },
    { label: 'Total Exams', value: stats.totalExams, color: '#f59e0b', icon: '📝' },
    { label: 'Avg Score', value: `${stats.avgScore}%`, color: '#8b5cf6', icon: '📊' },
  ]

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Analytics</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '24px' }}>
        Performance overview for your courses
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Students per Course</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={courseEnrollments}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#e2e8f0' }} />
                <Bar dataKey="enrolled" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Average Scores Over Time</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={recentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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

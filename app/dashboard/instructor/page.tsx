import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function InstructorDashboard() {
  const session = await requireAuth(['instructor'])

  const { count: courseCount } = await supabaseAdmin
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('instructor_id', session.userId)

  const { count: examCount } = await supabaseAdmin
    .from('exams')
    .select('*, courses!inner(*)', { count: 'exact', head: true })
    .eq('courses.instructor_id', session.userId)

  const { data: recentCourses } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('instructor_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: materialCount } = await supabaseAdmin
    .from('course_materials')
    .select('*, courses!inner(*)', { count: 'exact', head: true })
    .eq('courses.instructor_id', session.userId)

  const stats = [
    { label: 'My Courses', value: courseCount || 0, icon: '📚', color: '#6366f1' },
    { label: 'My Exams', value: examCount || 0, icon: '📝', color: '#10b981' },
    { label: 'Materials', value: materialCount || 0, icon: '📄', color: '#f59e0b' },
  ]

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            Welcome, {session.name} 👋
          </h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
            Manage your courses, upload materials, and create exams
          </p>
        </div>
        <Link href="/dashboard/instructor/courses/new" className="btn-primary">
          + New Course
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

      {/* Recent Courses */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Courses</h2>
          <Link href="/dashboard/instructor/courses" style={{ fontSize: '13px', fontWeight: 500 }}>
            View All →
          </Link>
        </div>
        {recentCourses && recentCourses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentCourses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/instructor/courses/${course.id}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px', borderRadius: '12px', textDecoration: 'none',
                  background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.06)',
                  transition: 'all 0.2s', color: 'inherit'
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{course.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>
                    {course.description?.slice(0, 80)}...
                  </p>
                </div>
                <span className={`badge ${course.is_published ? 'badge-accent' : 'badge-warning'}`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-surface-500)' }}>
            <p style={{ marginBottom: '16px' }}>No courses yet. Create your first course!</p>
            <Link href="/dashboard/instructor/courses/new" className="btn-primary">+ Create Course</Link>
          </div>
        )}
      </div>
    </div>
  )
}

import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function InstructorCoursesPage() {
  const session = await requireAuth(['instructor'])

  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('*, enrollments(count)')
    .eq('instructor_id', session.userId)
    .order('created_at', { ascending: false })

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>My Courses</h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
            Create and manage your courses
          </p>
        </div>
        <Link href="/dashboard/instructor/courses/new" className="btn-primary">+ New Course</Link>
      </div>

      {courses && courses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/instructor/courses/${course.id}`}
              className="glass-card"
              style={{ padding: '24px', textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className={`badge ${course.is_published ? 'badge-accent' : 'badge-warning'}`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{course.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', lineHeight: 1.6, marginBottom: '16px' }}>
                {course.description?.slice(0, 120)}...
              </p>
              <div style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                📚 {(course.enrollments as unknown as { count: number }[])?.[0]?.count || 0} students enrolled
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📚</p>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No courses yet</h3>
          <p style={{ color: 'var(--color-surface-400)', marginBottom: '24px' }}>
            Create your first course to get started
          </p>
          <Link href="/dashboard/instructor/courses/new" className="btn-primary">+ Create Course</Link>
        </div>
      )}
    </div>
  )
}

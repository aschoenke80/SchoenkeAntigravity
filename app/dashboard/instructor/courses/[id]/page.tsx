import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CourseDetailClient from './CourseDetailClient'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth(['instructor'])
  const { id } = await params

  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course) notFound()

  const { data: materials } = await supabaseAdmin
    .from('course_materials')
    .select('*')
    .eq('course_id', id)
    .order('uploaded_at', { ascending: false })

  const { data: exams } = await supabaseAdmin
    .from('exams')
    .select('*')
    .eq('course_id', id)
    .order('created_at', { ascending: false })

  // Fetch modules with lessons
  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', id)
    .order('sort_order', { ascending: true })

  // Sort lessons within each module
  const sortedModules = (modules || []).map((m: any) => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }))

  const { count: enrollmentCount } = await supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', id)

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard/instructor/courses"
          style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '16px', display: 'inline-block' }}>
          ← Back to Courses
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{course.title}</h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className={`badge ${course.is_published ? 'badge-accent' : 'badge-warning'}`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>
                {enrollmentCount || 0} students enrolled
              </span>
            </div>
          </div>
        </div>
      </div>

      <CourseDetailClient
        course={course}
        materials={materials || []}
        exams={exams || []}
        modules={sortedModules}
      />
    </div>
  )
}

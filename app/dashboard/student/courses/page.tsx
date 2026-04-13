import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import StudentCoursesClient from './StudentCoursesClient'

export default async function StudentCoursesPage() {
  const session = await requireAuth(['student'])

  // Student's enrollments
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('course_id')
    .eq('student_id', session.userId)

  const enrolledCourseIds = new Set(enrollments?.map(e => e.course_id) || [])

  // All published courses + any courses the student is already enrolled in
  let query = supabaseAdmin
    .from('courses')
    .select('*, users(name)')
    .order('created_at', { ascending: false })

  if (enrolledCourseIds.size > 0) {
    query = query.or(`is_published.eq.true,id.in.(${[...enrolledCourseIds].join(',')})`)
  } else {
    query = query.eq('is_published', true)
  }

  const { data: courses } = await query

  return <StudentCoursesClient courses={courses || []} enrolledCourseIds={[...enrolledCourseIds]} />
}

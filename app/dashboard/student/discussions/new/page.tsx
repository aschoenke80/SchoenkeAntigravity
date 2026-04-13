import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import NewDiscussionClient from './NewDiscussionClient'

export default async function NewDiscussionPage() {
  const session = await requireAuth(['student', 'instructor'])

  let courses: { id: string; title: string }[] = []

  if (session.role === 'instructor') {
    const { data } = await supabaseAdmin
      .from('courses')
      .select('id, title')
      .eq('instructor_id', session.userId)
    courses = data || []
  } else {
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('courses(id, title)')
      .eq('student_id', session.userId)
    courses = (enrollments?.map(e => e.courses).filter(Boolean) as unknown as { id: string; title: string }[]) || []
  }

  return <NewDiscussionClient courses={courses} />
}

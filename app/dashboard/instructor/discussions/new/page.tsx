import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import NewDiscussionClient from '@/app/dashboard/student/discussions/new/NewDiscussionClient'

export default async function InstructorNewDiscussionPage() {
  const session = await requireAuth(['instructor'])

  const { data } = await supabaseAdmin
    .from('courses')
    .select('id, title')
    .eq('instructor_id', session.userId)

  const courses = data || []

  return <NewDiscussionClient courses={courses} backHref="/dashboard/instructor/discussions" />
}

import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  await requireAuth(['admin'])

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('id, title')
    .order('title', { ascending: true })

  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('student_id, courses(title)')

  const enrollmentsMap: Record<string, string[]> = {}
  enrollments?.forEach((e: any) => {
    if (!enrollmentsMap[e.student_id]) enrollmentsMap[e.student_id] = []
    if (e.courses?.title) enrollmentsMap[e.student_id].push(e.courses.title)
  })

  return <AdminUsersClient users={users || []} courses={courses || []} enrollmentsMap={enrollmentsMap} />
}

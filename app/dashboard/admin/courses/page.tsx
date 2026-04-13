import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import AdminCoursesClient from './AdminCoursesClient'

export default async function AdminCoursesPage() {
  await requireAuth(['admin'])

  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('*, users(name, email), enrollments(count)')
    .order('created_at', { ascending: false })

  const { data: instructors } = await supabaseAdmin
    .from('users')
    .select('id, name, email')
    .eq('role', 'instructor')
    .order('name')

  const { data: students } = await supabaseAdmin
    .from('users')
    .select('id, name, email, student_id_number')
    .eq('role', 'student')
    .order('name')

  return (
    <AdminCoursesClient
      courses={courses || []}
      instructors={instructors || []}
      students={students || []}
    />
  )
}

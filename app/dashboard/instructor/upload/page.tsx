import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import UploadPageClient from './UploadPageClient'

export default async function UploadPage() {
  const session = await requireAuth(['instructor'])

  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('id, title')
    .eq('instructor_id', session.userId)
    .order('title')

  const { data: materials } = await supabaseAdmin
    .from('course_materials')
    .select('*, courses!inner(instructor_id)')
    .eq('courses.instructor_id', session.userId)
    .order('uploaded_at', { ascending: false })

  return <UploadPageClient courses={courses || []} materials={materials || []} />
}

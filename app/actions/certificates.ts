'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/session'
import { getStudentCourseProgress } from './progress'

export async function generateCertificate(courseId: string) {
  const session = await requireAuth(['student'])

  // Check if already has certificate
  const { data: existing } = await supabaseAdmin
    .from('certificates')
    .select('*')
    .eq('student_id', session.userId)
    .eq('course_id', courseId)
    .single()

  if (existing) return { certificate: existing }

  // Verify course completion
  const progress = await getStudentCourseProgress(session.userId, courseId)

  if (progress.total === 0) {
    return { error: 'This course has no lessons yet.' }
  }

  if (progress.percentage < 100) {
    return { error: `You must complete all lessons first. Progress: ${progress.percentage}%` }
  }

  // Generate certificate number
  const certNumber = `LMS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const { data, error } = await supabaseAdmin
    .from('certificates')
    .insert({
      student_id: session.userId,
      course_id: courseId,
      certificate_number: certNumber,
    })
    .select('*, courses(title, instructor_id, users(name))')
    .single()

  if (error) return { error: 'Failed to generate certificate.' }

  return { certificate: data }
}

export async function getCertificates() {
  const session = await requireAuth(['student'])

  const { data } = await supabaseAdmin
    .from('certificates')
    .select('*, courses(title), users(name)')
    .eq('student_id', session.userId)
    .order('issued_at', { ascending: false })

  return (data || []).map(cert => ({
    ...cert,
    course_title: (cert.courses as any)?.title || 'Unknown Course',
    student_name: (cert.users as any)?.name || 'Student',
  }))
}

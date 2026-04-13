'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/session'

export async function getNotifications() {
  const session = await requireAuth()

  const { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return data || []
}

export async function getUnreadCount() {
  const session = await requireAuth()

  const { count } = await supabaseAdmin
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.userId)
    .eq('is_read', false)

  return count || 0
}

export async function markNotificationRead(notificationId: string) {
  const session = await requireAuth()

  await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', session.userId)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function markAllNotificationsRead() {
  const session = await requireAuth()

  await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', session.userId)
    .eq('is_read', false)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function createNotificationForEnrolled(courseId: string, title: string, message: string, type: string = 'course', link?: string) {
  // Get all enrolled students
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('student_id')
    .eq('course_id', courseId)

  if (!enrollments?.length) return

  const notifications = enrollments.map(e => ({
    user_id: e.student_id,
    title,
    message,
    type,
    link,
  }))

  await supabaseAdmin.from('notifications').insert(notifications)
}

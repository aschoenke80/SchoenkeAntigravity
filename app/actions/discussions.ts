'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/session'
import { tryAwardBadge, awardXP } from './progress'

async function notifyEnrolledUsers(courseId: string, excludeUserId: string, title: string, message: string, link: string) {
  // Get all enrolled students
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('student_id')
    .eq('course_id', courseId)

  // Get the course instructor
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single()

  const userIds = new Set<string>()
  enrollments?.forEach(e => userIds.add(e.student_id))
  if (course?.instructor_id) userIds.add(course.instructor_id)
  userIds.delete(excludeUserId)

  if (userIds.size === 0) return

  const notifications = [...userIds].map(uid => ({
    user_id: uid,
    title,
    message,
    type: 'info' as const,
    link,
  }))

  await supabaseAdmin.from('notifications').insert(notifications)
}

export async function createDiscussion(courseId: string, formData: FormData) {
  const session = await requireAuth(['student', 'instructor', 'admin'])

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  if (!title?.trim() || !content?.trim()) {
    return { error: 'Title and content are required.' }
  }

  const { data: newDisc, error } = await supabaseAdmin
    .from('discussions')
    .insert({
      course_id: courseId,
      user_id: session.userId,
      title: title.trim(),
      content: content.trim(),
    })
    .select('id')
    .single()

  if (error || !newDisc) {
    console.error('Discussion insert error:', error)
    return { error: 'Failed to create discussion.' }
  }

  // Get poster's name for notification
  const { data: user } = await supabaseAdmin.from('users').select('name').eq('id', session.userId).single()
  const posterName = user?.name || 'Someone'

  // Notify enrolled users + instructor
  await notifyEnrolledUsers(
    courseId,
    session.userId,
    'New Discussion',
    `${posterName} started a discussion: "${title.trim()}"`,
    `/dashboard/student/discussions/${newDisc.id}`
  )

  // Award XP
  await awardXP(session.userId, 5, 'Posted a discussion', courseId)

  // Check discussion badge
  const { count } = await supabaseAdmin
    .from('discussions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.userId)

  if (count && count >= 10) {
    await tryAwardBadge(session.userId, 'post_10_discussions')
  }

  revalidatePath('/dashboard/student/discussions')
  revalidatePath('/dashboard/instructor/discussions')
  return { success: true }
}

export async function createReply(discussionId: string, courseId: string, formData: FormData) {
  const session = await requireAuth(['student', 'instructor', 'admin'])

  const content = formData.get('content') as string
  if (!content?.trim()) return { error: 'Reply content is required.' }

  const { error } = await supabaseAdmin
    .from('discussion_replies')
    .insert({
      discussion_id: discussionId,
      user_id: session.userId,
      content: content.trim(),
    })

  if (error) return { error: 'Failed to post reply.' }

  // Increment replies count
  const { data: disc } = await supabaseAdmin
    .from('discussions')
    .select('replies_count')
    .eq('id', discussionId)
    .single()

  await supabaseAdmin
    .from('discussions')
    .update({ replies_count: ((disc as any)?.replies_count || 0) + 1 })
    .eq('id', discussionId)

  // Notify discussion participants
  const { data: user } = await supabaseAdmin.from('users').select('name').eq('id', session.userId).single()
  const posterName = user?.name || 'Someone'
  const { data: discFull } = await supabaseAdmin.from('discussions').select('title').eq('id', discussionId).single()

  await notifyEnrolledUsers(
    courseId,
    session.userId,
    'New Reply',
    `${posterName} replied to "${discFull?.title || 'a discussion'}"`,
    `/dashboard/student/discussions/${discussionId}`
  )

  // Award XP
  await awardXP(session.userId, 3, 'Replied to a discussion', discussionId)

  // Check reply badge
  const { count } = await supabaseAdmin
    .from('discussion_replies')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.userId)

  if (count && count >= 10) {
    await tryAwardBadge(session.userId, 'reply_10_discussions')
  }

  revalidatePath('/dashboard/student/discussions')
  revalidatePath('/dashboard/instructor/discussions')
  return { success: true }
}

export async function toggleLike(discussionId: string | null, replyId: string | null, courseId: string) {
  const session = await requireAuth(['student', 'instructor', 'admin'])

  if (discussionId) {
    const { data: existing } = await supabaseAdmin
      .from('discussion_likes')
      .select('id')
      .eq('user_id', session.userId)
      .eq('discussion_id', discussionId)
      .single()

    if (existing) {
      await supabaseAdmin.from('discussion_likes').delete().eq('id', existing.id)
      // Decrement
      const { data: disc } = await supabaseAdmin.from('discussions').select('likes_count').eq('id', discussionId).single()
      if (disc) await supabaseAdmin.from('discussions').update({ likes_count: Math.max(0, (disc.likes_count || 0) - 1) }).eq('id', discussionId)
    } else {
      await supabaseAdmin.from('discussion_likes').insert({ user_id: session.userId, discussion_id: discussionId })
      const { data: disc } = await supabaseAdmin.from('discussions').select('likes_count').eq('id', discussionId).single()
      if (disc) await supabaseAdmin.from('discussions').update({ likes_count: (disc.likes_count || 0) + 1 }).eq('id', discussionId)
    }
  }

  if (replyId) {
    const { data: existing } = await supabaseAdmin
      .from('discussion_likes')
      .select('id')
      .eq('user_id', session.userId)
      .eq('reply_id', replyId)
      .single()

    if (existing) {
      await supabaseAdmin.from('discussion_likes').delete().eq('id', existing.id)
      const { data: reply } = await supabaseAdmin.from('discussion_replies').select('likes_count').eq('id', replyId).single()
      if (reply) await supabaseAdmin.from('discussion_replies').update({ likes_count: Math.max(0, (reply.likes_count || 0) - 1) }).eq('id', replyId)
    } else {
      await supabaseAdmin.from('discussion_likes').insert({ user_id: session.userId, reply_id: replyId })
      const { data: reply } = await supabaseAdmin.from('discussion_replies').select('likes_count').eq('id', replyId).single()
      if (reply) await supabaseAdmin.from('discussion_replies').update({ likes_count: (reply.likes_count || 0) + 1 }).eq('id', replyId)
    }
  }

  revalidatePath(`/dashboard/student/courses/${courseId}/discussions`)
  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/session'

export async function markLessonComplete(lessonId: string, courseId: string) {
  const session = await requireAuth(['student'])

  const { error } = await supabaseAdmin
    .from('lesson_progress')
    .upsert({
      student_id: session.userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'student_id,lesson_id' })

  if (error) return { error: 'Failed to mark lesson as complete.' }

  // Award XP for completing a lesson
  await awardXP(session.userId, 10, 'Completed a lesson', lessonId)

  // Check badge eligibility
  await checkLessonBadges(session.userId, courseId)

  revalidatePath(`/dashboard/student/courses/${courseId}`)
  return { success: true }
}

export async function markLessonIncomplete(lessonId: string, courseId: string) {
  const session = await requireAuth(['student'])

  await supabaseAdmin
    .from('lesson_progress')
    .update({ completed: false, completed_at: null })
    .eq('student_id', session.userId)
    .eq('lesson_id', lessonId)

  revalidatePath(`/dashboard/student/courses/${courseId}`)
  return { success: true }
}

export async function getStudentCourseProgress(studentId: string, courseId: string) {
  // Get all lessons for this course
  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('id')
    .eq('course_id', courseId)

  if (!modules?.length) return { completed: 0, total: 0, percentage: 0 }

  const moduleIds = modules.map(m => m.id)

  const { data: lessons } = await supabaseAdmin
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds)

  if (!lessons?.length) return { completed: 0, total: 0, percentage: 0 }

  const lessonIds = lessons.map(l => l.id)

  const { data: progress } = await supabaseAdmin
    .from('lesson_progress')
    .select('id')
    .eq('student_id', studentId)
    .eq('completed', true)
    .in('lesson_id', lessonIds)

  const completed = progress?.length || 0
  const total = lessons.length

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

// =====================================================
// XP & BADGES
// =====================================================
export async function awardXP(userId: string, amount: number, reason: string, referenceId?: string) {
  await supabaseAdmin
    .from('xp_log')
    .insert({ user_id: userId, amount, reason, reference_id: referenceId })

  // Update user's total XP
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('xp_total')
    .eq('id', userId)
    .single()

  await supabaseAdmin
    .from('users')
    .update({ xp_total: (userData?.xp_total || 0) + amount })
    .eq('id', userId)
}

async function checkLessonBadges(userId: string, courseId: string) {
  // Count completed lessons
  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('id')
    .eq('course_id', courseId)

  if (!modules?.length) return

  const moduleIds = modules.map(m => m.id)
  const { data: allLessons } = await supabaseAdmin
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds)

  // Count total completed lessons across all courses
  const { count: totalCompleted } = await supabaseAdmin
    .from('lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', userId)
    .eq('completed', true)

  // First Steps badge
  if (totalCompleted && totalCompleted >= 1) {
    await tryAwardBadge(userId, 'complete_first_lesson')
  }

  // Bookworm badge
  if (totalCompleted && totalCompleted >= 10) {
    await tryAwardBadge(userId, 'complete_10_lessons')
  }

  // Course completion badge
  if (allLessons?.length) {
    const lessonIds = allLessons.map(l => l.id)
    const { count: courseCompleted } = await supabaseAdmin
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('completed', true)
      .in('lesson_id', lessonIds)

    if (courseCompleted && courseCompleted >= allLessons.length) {
      await tryAwardBadge(userId, 'complete_course')
    }
  }
}

export async function tryAwardBadge(userId: string, criteria: string) {
  const { data: badge } = await supabaseAdmin
    .from('badges')
    .select('*')
    .eq('criteria', criteria)
    .single()

  if (!badge) return

  // Check if already earned
  const { data: existing } = await supabaseAdmin
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badge.id)
    .single()

  if (existing) return

  // Award badge
  await supabaseAdmin
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badge.id })

  // Award XP for badge
  if (badge.xp_reward > 0) {
    await awardXP(userId, badge.xp_reward, `Badge earned: ${badge.name}`, badge.id)
  }

  // Create notification
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Badge Earned! 🏆',
      message: `You earned the "${badge.name}" badge! ${badge.icon}`,
      type: 'badge',
      link: '/dashboard/student',
    })
}

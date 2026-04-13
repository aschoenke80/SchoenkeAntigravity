'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/session'
import type { ExamQuestion } from '@/lib/database.types'

export async function createExam(courseId: string, formData: FormData) {
  await requireAuth(['instructor'])

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const timeLimitStr = formData.get('time_limit_minutes') as string
  const time_limit_minutes = timeLimitStr ? parseInt(timeLimitStr) : null

  const { data, error } = await supabaseAdmin
    .from('exams')
    .insert({
      course_id: courseId,
      title,
      description,
      time_limit_minutes,
      questions: [],
    })
    .select()
    .single()

  if (error || !data) {
    return { message: 'Failed to create exam.' }
  }

  revalidatePath(`/dashboard/instructor/exams`)
  redirect(`/dashboard/instructor/exams/${data.id}`)
}

export async function updateExamQuestions(examId: string, questions: ExamQuestion[]) {
  await requireAuth(['instructor'])

  const { error } = await supabaseAdmin
    .from('exams')
    .update({ questions, updated_at: new Date().toISOString() })
    .eq('id', examId)

  if (error) {
    return { message: 'Failed to save questions.' }
  }

  revalidatePath(`/dashboard/instructor/exams/${examId}`)
  return { message: 'Questions saved successfully!' }
}

export async function publishExam(examId: string, publish: boolean) {
  await requireAuth(['instructor'])

  await supabaseAdmin
    .from('exams')
    .update({ is_published: publish, updated_at: new Date().toISOString() })
    .eq('id', examId)

  revalidatePath(`/dashboard/instructor/exams/${examId}`)
  revalidatePath('/dashboard/instructor/exams')
}

export async function deleteExam(examId: string) {
  await requireAuth(['instructor'])

  await supabaseAdmin.from('exams').delete().eq('id', examId)

  revalidatePath('/dashboard/instructor/exams')
  redirect('/dashboard/instructor/exams')
}

export async function submitExam(examId: string, answers: Record<string, string>) {
  const session = await requireAuth(['student'])

  // Get exam questions for grading
  const { data: exam } = await supabaseAdmin
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single()

  if (!exam) return { message: 'Exam not found.' }

  const questions = exam.questions as ExamQuestion[]
  let score = 0
  let totalPoints = 0

  questions.forEach((q) => {
    totalPoints += q.points
    const studentAnswer = (answers[q.id] || '').trim().toLowerCase()
    const correctAnswer = q.correct_answer.trim().toLowerCase()

    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      if (studentAnswer === correctAnswer) score += q.points
    } else if (q.type === 'identification') {
      if (studentAnswer === correctAnswer) score += q.points
    } else if (q.type === 'short_answer') {
      // Partial matching for short answers - if key words match
      const correctWords = correctAnswer.split(/\s+/)
      const studentWords = studentAnswer.split(/\s+/)
      const matchCount = correctWords.filter(w => studentWords.includes(w)).length
      const matchRatio = matchCount / correctWords.length
      if (matchRatio >= 0.6) score += q.points
      else if (matchRatio >= 0.3) score += Math.round(q.points * 0.5)
    }
  })

  const { error } = await supabaseAdmin
    .from('exam_submissions')
    .insert({
      exam_id: examId,
      student_id: session.userId,
      answers,
      score,
      total_points: totalPoints,
    })

  if (error) {
    if (error.code === '23505') {
      return { message: 'You have already submitted this exam.' }
    }
    return { message: 'Failed to submit exam.' }
  }

  revalidatePath('/dashboard/student/scores')
  revalidatePath('/dashboard/student/exams')
  revalidatePath('/dashboard/student')
  return { score, totalPoints, message: 'Exam submitted successfully!' }
}

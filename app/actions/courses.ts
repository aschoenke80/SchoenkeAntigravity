'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/session'
import { CourseSchema, CourseFormState } from '@/lib/validations'

export async function createCourse(state: CourseFormState, formData: FormData): Promise<CourseFormState> {
  const session = await requireAuth(['instructor'])

  const validated = CourseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert({
      title: validated.data.title,
      description: validated.data.description,
      instructor_id: session.userId,
      is_published: true,
    })
    .select()
    .single()

  if (error || !data) {
    return { message: 'Failed to create course.' }
  }

  revalidatePath('/dashboard/instructor/courses')
  redirect(`/dashboard/instructor/courses/${data.id}`)
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAuth(['instructor'])

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const is_published = formData.get('is_published') === 'true'

  await supabaseAdmin
    .from('courses')
    .update({ title, description, is_published, updated_at: new Date().toISOString() })
    .eq('id', courseId)

  revalidatePath(`/dashboard/instructor/courses/${courseId}`)
  revalidatePath('/dashboard/instructor/courses')
}

export async function deleteCourse(courseId: string) {
  await requireAuth(['instructor'])

  await supabaseAdmin.from('courses').delete().eq('id', courseId)

  revalidatePath('/dashboard/instructor/courses')
  redirect('/dashboard/instructor/courses')
}

export async function enrollInCourse(courseId: string) {
  const session = await requireAuth(['student'])

  const { error } = await supabaseAdmin
    .from('enrollments')
    .insert({ student_id: session.userId, course_id: courseId })

  if (error) {
    if (error.code === '23505') {
      return { message: 'Already enrolled in this course.' }
    }
    return { message: 'Failed to enroll.' }
  }

  revalidatePath('/dashboard/student/courses')
  revalidatePath('/dashboard/student')
}

export async function unenrollFromCourse(courseId: string) {
  const session = await requireAuth(['student'])

  await supabaseAdmin
    .from('enrollments')
    .delete()
    .eq('student_id', session.userId)
    .eq('course_id', courseId)

  revalidatePath('/dashboard/student/courses')
  revalidatePath('/dashboard/student')
}

export async function instructorEnrollStudent(prevState: any, formData: FormData) {
  const session = await requireAuth(['instructor'])

  const studentId = formData.get('student_id') as string
  const courseId = formData.get('course_id') as string

  if (!studentId || !courseId) {
    return { message: 'Missing required fields.' }
  }

  // Check if course belongs to instructor
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('instructor_id', session.userId)
    .single()

  if (!course) {
    return { message: 'Course not found or unauthorized.' }
  }

  const { error } = await supabaseAdmin
    .from('enrollments')
    .insert({ student_id: studentId, course_id: courseId })

  if (error) {
    if (error.code === '23505') {
      return { message: 'Student is already enrolled in this course.' }
    }
    return { message: 'Failed to enroll student.' }
  }

  revalidatePath('/dashboard/instructor/students')
  revalidatePath('/dashboard/instructor/courses')
  return { message: 'success' }
}

export async function instructorEnrollStudentByIdNumber(prevState: any, formData: FormData) {
  const session = await requireAuth(['instructor'])

  const studentIdNumber = (formData.get('student_id_number') as string)?.trim()
  const courseId = formData.get('course_id') as string

  if (!studentIdNumber || !courseId) {
    return { message: 'Student ID number and course are required.' }
  }

  // Look up student by ID number
  const { data: student } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .eq('student_id_number', studentIdNumber)
    .eq('role', 'student')
    .single()

  if (!student) {
    return { message: `No student found with ID number "${studentIdNumber}".` }
  }

  // Check if course belongs to instructor
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('instructor_id', session.userId)
    .single()

  if (!course) {
    return { message: 'Course not found or unauthorized.' }
  }

  const { error } = await supabaseAdmin
    .from('enrollments')
    .insert({ student_id: student.id, course_id: courseId })

  if (error) {
    if (error.code === '23505') {
      return { message: `${student.name} is already enrolled in this course.` }
    }
    return { message: 'Failed to enroll student.' }
  }

  revalidatePath('/dashboard/instructor/students')
  revalidatePath('/dashboard/instructor/courses')
  return { message: 'success', studentName: student.name }
}


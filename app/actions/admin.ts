'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function getUsers() {
  await requireAuth(['admin'])
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

export async function updateUserRole(userId: string, role: string) {
  await requireAuth(['admin'])
  await supabaseAdmin.from('users').update({ role }).eq('id', userId)
  revalidatePath('/dashboard/admin/users')
}

export async function deleteUser(userId: string) {
  await requireAuth(['admin'])
  await supabaseAdmin.from('users').delete().eq('id', userId)
  revalidatePath('/dashboard/admin/users')
}

export async function createUser(formData: FormData) {
  await requireAuth(['admin'])

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const student_id_number = (formData.get('student_id_number') as string) || null

  if (!name || !email || !password || !role) {
    return { message: 'All fields are required.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { error } = await supabaseAdmin
    .from('users')
    .insert({ name, email, password_hash: hashedPassword, role, student_id_number })

  if (error) {
    if (error.code === '23505') return { message: 'Email already exists.' }
    return { message: 'Failed to create user.' }
  }

  revalidatePath('/dashboard/admin/users')
  return { message: 'User created successfully!' }
}

export async function adminDeleteCourse(courseId: string) {
  await requireAuth(['admin'])
  await supabaseAdmin.from('courses').delete().eq('id', courseId)
  revalidatePath('/dashboard/admin/courses')
}

export async function adminCreateCourse(prevState: any, formData: FormData) {
  await requireAuth(['admin'])

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const instructorId = formData.get('instructor_id') as string

  if (!title || !instructorId) {
    return { message: 'Title and instructor are required.' }
  }

  const { error } = await supabaseAdmin
    .from('courses')
    .insert({
      title,
      description: description || '',
      instructor_id: instructorId,
      is_published: true,
    })

  if (error) {
    return { message: 'Failed to create course.' }
  }

  revalidatePath('/dashboard/admin/courses')
  return { message: 'success' }
}

export async function adminEnrollStudentToCourse(prevState: any, formData: FormData) {
  await requireAuth(['admin'])

  const studentId = formData.get('student_id') as string
  const courseId = formData.get('course_id') as string

  if (!studentId || !courseId) {
    return { message: 'Student and course are required.' }
  }

  const { error } = await supabaseAdmin
    .from('enrollments')
    .insert({ student_id: studentId, course_id: courseId })

  if (error) {
    if (error.code === '23505') return { message: 'Student is already enrolled in this course.' }
    return { message: 'Failed to enroll student.' }
  }

  revalidatePath('/dashboard/admin/courses')
  return { message: 'success' }
}

export async function adminEnrollStudent(prevState: any, formData: FormData) {
  await requireAuth(['admin'])

  const studentId = formData.get('student_id') as string
  const courseId = formData.get('course_id') as string

  if (!studentId || !courseId) {
    return { message: 'Missing required fields.' }
  }

  const { error } = await supabaseAdmin
    .from('enrollments')
    .insert({ student_id: studentId, course_id: courseId })

  if (error) {
    if (error.code === '23505') return { message: 'Student is already enrolled in this course.' }
    return { message: 'Failed to enroll student.' }
  }

  revalidatePath('/dashboard/admin/users')
  return { message: 'success' }
}

export async function adminEnrollStudentByIdNumber(prevState: any, formData: FormData) {
  await requireAuth(['admin'])

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

  const { error } = await supabaseAdmin
    .from('enrollments')
    .insert({ student_id: student.id, course_id: courseId })

  if (error) {
    if (error.code === '23505') return { message: `${student.name} is already enrolled in this course.` }
    return { message: 'Failed to enroll student.' }
  }

  revalidatePath('/dashboard/admin/users')
  return { message: 'success', studentName: student.name }
}


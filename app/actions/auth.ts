'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { createSession, deleteSession } from '@/lib/session'
import { LoginSchema, SignupSchema, LoginFormState, SignupFormState } from '@/lib/validations'

export async function login(state: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return { message: 'Invalid email or password.' }
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatch) {
    return { message: 'Invalid email or password.' }
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const dashboardMap: Record<string, string> = {
    admin: '/dashboard/admin',
    instructor: '/dashboard/instructor',
    student: '/dashboard/student',
  }

  redirect(dashboardMap[user.role] || '/dashboard/student')
}

export async function signup(state: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const validated = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    student_id_number: formData.get('student_id_number') || '',
    password: formData.get('password'),
    role: formData.get('role'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, password, role } = validated.data
  const student_id_number = validated.data.student_id_number || null

  // Check if user already exists
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return { message: 'An account with this email already exists.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({ name, email, password_hash: hashedPassword, role, student_id_number })
    .select()
    .single()

  if (error || !user) {
    console.error('Supabase signup error:', error)
    return { message: 'Failed to create account. Please try again.' }
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  const dashboardMap: Record<string, string> = {
    admin: '/dashboard/admin',
    instructor: '/dashboard/instructor',
    student: '/dashboard/student',
  }

  redirect(dashboardMap[role] || '/dashboard/student')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export type ResetPasswordState = {
  errors?: { email?: string[]; student_id_number?: string[]; password?: string[] }
  message?: string
  success?: boolean
}

export async function resetPassword(state: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const email = (formData.get('email') as string)?.trim()
  const studentId = (formData.get('student_id_number') as string)?.trim()
  const newPassword = formData.get('password') as string

  if (!email) return { errors: { email: ['Email is required.'] } }
  if (!studentId) return { errors: { student_id_number: ['Student/Staff ID is required.'] } }
  if (!newPassword || newPassword.length < 8) return { errors: { password: ['Password must be at least 8 characters.'] } }
  if (!/[a-zA-Z]/.test(newPassword)) return { errors: { password: ['Must contain at least one letter.'] } }
  if (!/[0-9]/.test(newPassword)) return { errors: { password: ['Must contain at least one number.'] } }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, student_id_number')
    .eq('email', email)
    .single()

  if (error || !user) {
    return { message: 'No account found with that email.' }
  }

  if (!user.student_id_number || user.student_id_number !== studentId) {
    return { message: 'Student/Staff ID does not match our records.' }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ password_hash: hashedPassword })
    .eq('id', user.id)

  if (updateError) {
    return { message: 'Failed to reset password. Please try again.' }
  }

  return { success: true, message: 'Password reset successfully! You can now log in.' }
}

import * as z from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
})

export const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').trim(),
  email: z.string().email('Please enter a valid email.').trim(),
  student_id_number: z.string().min(1, 'Student ID number is required.').trim().optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[a-zA-Z]/, 'Must contain at least one letter.')
    .regex(/[0-9]/, 'Must contain at least one number.')
    .trim(),
  role: z.enum(['instructor', 'student'] as const, {
    message: 'Please select a role.',
  }),
})

export const CourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters.').trim(),
})

export const ExamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').trim(),
  description: z.string().optional(),
  time_limit_minutes: z.number().min(1).max(300).optional(),
})

export type LoginFormState = {
  errors?: { email?: string[]; password?: string[] }
  message?: string
} | undefined

export type SignupFormState = {
  errors?: { name?: string[]; email?: string[]; password?: string[]; role?: string[]; student_id_number?: string[] }
  message?: string
} | undefined

export type CourseFormState = {
  errors?: { title?: string[]; description?: string[] }
  message?: string
} | undefined

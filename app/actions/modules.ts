'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/session'

// =====================================================
// MODULES
// =====================================================
export async function createModule(courseId: string, formData: FormData) {
  await requireAuth(['instructor', 'admin'])

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title?.trim()) return { error: 'Title is required.' }

  const { data: maxOrder } = await supabaseAdmin
    .from('modules')
    .select('sort_order')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabaseAdmin
    .from('modules')
    .insert({
      course_id: courseId,
      title: title.trim(),
      description: description?.trim() || null,
      sort_order: (maxOrder?.sort_order ?? -1) + 1,
    })

  if (error) return { error: 'Failed to create module.' }

  revalidatePath(`/dashboard/instructor/courses/${courseId}`)
  return { success: true }
}

export async function updateModule(moduleId: string, formData: FormData) {
  await requireAuth(['instructor', 'admin'])

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title?.trim()) return { error: 'Title is required.' }

  const { error } = await supabaseAdmin
    .from('modules')
    .update({ title: title.trim(), description: description?.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', moduleId)

  if (error) return { error: 'Failed to update module.' }

  return { success: true }
}

export async function deleteModule(moduleId: string, courseId: string) {
  await requireAuth(['instructor', 'admin'])

  await supabaseAdmin.from('modules').delete().eq('id', moduleId)
  revalidatePath(`/dashboard/instructor/courses/${courseId}`)
  return { success: true }
}

// =====================================================
// LESSONS
// =====================================================
export async function createLesson(moduleId: string, courseId: string, formData: FormData) {
  await requireAuth(['instructor', 'admin'])

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const content_type = (formData.get('content_type') as string) || 'text'
  const video_url = formData.get('video_url') as string
  const pdf_material_id = formData.get('pdf_material_id') as string
  const duration = formData.get('duration_minutes') as string

  if (!title?.trim()) return { error: 'Title is required.' }

  const { data: maxOrder } = await supabaseAdmin
    .from('lessons')
    .select('sort_order')
    .eq('module_id', moduleId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabaseAdmin
    .from('lessons')
    .insert({
      module_id: moduleId,
      title: title.trim(),
      content: content?.trim() || null,
      content_type,
      video_url: video_url?.trim() || null,
      pdf_material_id: pdf_material_id || null,
      duration_minutes: duration ? parseInt(duration) : null,
      sort_order: (maxOrder?.sort_order ?? -1) + 1,
    })

  if (error) return { error: 'Failed to create lesson.' }

  revalidatePath(`/dashboard/instructor/courses/${courseId}`)
  return { success: true }
}

export async function updateLesson(lessonId: string, formData: FormData) {
  await requireAuth(['instructor', 'admin'])

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const content_type = (formData.get('content_type') as string) || 'text'
  const video_url = formData.get('video_url') as string
  const pdf_material_id = formData.get('pdf_material_id') as string
  const duration = formData.get('duration_minutes') as string

  const { error } = await supabaseAdmin
    .from('lessons')
    .update({
      title: title?.trim(),
      content: content?.trim() || null,
      content_type,
      video_url: video_url?.trim() || null,
      pdf_material_id: pdf_material_id || null,
      duration_minutes: duration ? parseInt(duration) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lessonId)

  if (error) return { error: 'Failed to update lesson.' }

  return { success: true }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  await requireAuth(['instructor', 'admin'])

  await supabaseAdmin.from('lessons').delete().eq('id', lessonId)
  revalidatePath(`/dashboard/instructor/courses/${courseId}`)
  return { success: true }
}

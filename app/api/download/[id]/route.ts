import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Look up the material
  const { data: material, error } = await supabaseAdmin
    .from('course_materials')
    .select('file_name, file_url, course_id')
    .eq('id', id)
    .single()

  if (error || !material) {
    return NextResponse.json({ error: 'Material not found.' }, { status: 404 })
  }

  // Verify user has access: must be enrolled or be the instructor
  if (session.role === 'student') {
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('student_id', session.userId)
      .eq('course_id', material.course_id)
      .single()

    if (!enrollment) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }
  } else if (session.role === 'instructor') {
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', material.course_id)
      .eq('instructor_id', session.userId)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }
  }
  // admins can download anything

  // Read the file from disk
  const filePath = path.join(process.cwd(), 'uploads', material.file_url)

  try {
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${material.file_name}"`,
        'Content-Length': String(fileBuffer.length),
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'File not found on server. It may have been uploaded before downloads were enabled.' },
      { status: 404 }
    )
  }
}

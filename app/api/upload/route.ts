import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { extractText } from 'unpdf'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const courseId = formData.get('courseId') as string

    if (!file || !courseId) {
      return NextResponse.json({ error: 'File and courseId are required.' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed.' }, { status: 400 })
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from PDF using unpdf (server-safe wrapper around pdfjs)
    const pdfCopy = new Uint8Array(buffer)
    const { text: extractedText } = await extractText(pdfCopy, { mergePages: true })

    // Store the extracted text and file metadata in the database
    const fileName = `${Date.now()}-${file.name}`

    // Upload PDF to Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('course-materials')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      // Non-fatal: continue even if storage upload fails (text is still extracted)
    }

    const { data, error } = await supabaseAdmin
      .from('course_materials')
      .insert({
        course_id: courseId,
        file_name: file.name,
        file_url: fileName,
        extracted_text: extractedText,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save material.' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'PDF uploaded and text extracted successfully.',
      material: data,
      extractedText: (extractedText || '').slice(0, 500) + '...',
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Failed to process PDF: ' + (err as Error).message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Local keyword-based chat (no external API) ─────────

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 20 && /[a-zA-Z]{3,}/.test(s))
}

function extractKeywords(text: string): string[] {
  const stop = new Set([
    'this','that','these','those','with','from','into','about','which','where',
    'when','what','were','been','being','have','having','does','doing','will',
    'would','could','should','shall','also','than','then','them','they','their',
    'there','each','every','some','such','more','most','other','only','same',
    'very','just','because','since','while','after','before','between','through',
    'during','without','within','along','following','across','behind','beyond',
    'plus','except','like','used','using','many','often','however','therefore',
    'although','though','the','and','for','are','but','not','you','all','can',
    'her','was','one','our','out','had','has','its','let','how','may','who',
    'tell','know','please','about','explain','describe','mean','means','course',
  ])
  return text
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !stop.has(w))
}

function findRelevantSentences(question: string, sentences: string[], maxResults = 5): string[] {
  const keywords = extractKeywords(question)
  if (keywords.length === 0) return []

  const scored = sentences.map(sentence => {
    const lower = sentence.toLowerCase()
    let score = 0
    for (const kw of keywords) {
      if (lower.includes(kw)) score++
    }
    return { sentence, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.sentence)
}

function buildReply(question: string, relevantSentences: string[], courseTitle: string): string {
  if (relevantSentences.length === 0) {
    return `I couldn't find specific information about that in the **${courseTitle}** course materials. Try rephrasing your question or asking about a specific topic covered in the course.`
  }

  const intro = `Based on the **${courseTitle}** course materials:\n\n`
  const body = relevantSentences.map((s, i) => `${i + 1}. ${s}`).join('\n\n')
  const outro = `\n\n---\n*This answer was generated from your course materials. For more detail, review the uploaded PDFs.*`

  return intro + body + outro
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { courseId, message } = await request.json()

    if (!courseId || !message?.trim()) {
      return NextResponse.json({ error: 'Course ID and message are required.' }, { status: 400 })
    }

    // Get course materials
    const { data: materials } = await supabaseAdmin
      .from('course_materials')
      .select('extracted_text, file_name')
      .eq('course_id', courseId)

    const courseContext = materials?.map(m => m.extracted_text).filter(Boolean).join('\n\n') || ''

    if (!courseContext) {
      return NextResponse.json({
        reply: "I don't have any course materials to reference yet. Please ask your instructor to upload PDF materials first.",
      })
    }

    // Get course info
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single()

    const courseTitle = course?.title || 'this course'
    const sentences = splitIntoSentences(courseContext)
    const relevant = findRelevantSentences(message, sentences)
    const reply = buildReply(message, relevant, courseTitle)

    // Save messages to database
    await supabaseAdmin.from('chat_messages').insert([
      { course_id: courseId, user_id: session.userId, role: 'user', content: message },
      { course_id: courseId, user_id: session.userId, role: 'assistant', content: reply },
    ])

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to get AI response.' }, { status: 500 })
  }
}

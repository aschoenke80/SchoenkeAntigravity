import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { generateQuestions } from '@/lib/simple-ai'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'instructor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { text, questionCount = 10, questionTypes } = await request.json()

    if (!text || text.trim().length < 50) {
      return NextResponse.json({
        error: 'Insufficient text content. Please provide more material.',
      }, { status: 400 })
    }

    const result = generateQuestions(text, {
      count: questionCount,
      types: questionTypes,
    })

    if (result.questions.length === 0) {
      return NextResponse.json({
        error: 'Could not generate questions from the provided text. Try longer or more detailed material.',
      }, { status: 400 })
    }

    return NextResponse.json({ questions: result.questions })
  } catch (err) {
    console.error('Generation error:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 })
  }
}

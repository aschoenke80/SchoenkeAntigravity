import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

// ─── Local study material generator (no external API) ─────────

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 20 && /[a-zA-Z]{3,}/.test(s))
}

const STOP_WORDS = new Set([
  'this','that','these','those','with','from','into','about','which','where',
  'when','what','were','been','being','have','having','does','doing','will',
  'would','could','should','shall','also','than','then','them','they','their',
  'there','each','every','some','such','more','most','other','only','same',
  'very','just','because','since','while','after','before','between','through',
  'during','without','within','along','following','across','behind','beyond',
  'plus','except','like','used','using','many','often','however','therefore',
  'although','though','the','and','for','are','but','not','you','all','can',
  'her','was','one','our','out','had','has','its','let','how','may','who',
])

function getKeywords(sentence: string): string[] {
  return sentence
    .replace(/[^a-zA-Z\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateFlashcards(sentences: string[], count: number) {
  const ranked = sentences
    .map(s => ({ s, keywords: getKeywords(s) }))
    .filter(x => x.keywords.length >= 2)
    .sort((a, b) => b.keywords.length - a.keywords.length)

  const picked = shuffle(ranked.slice(0, Math.min(count * 3, ranked.length))).slice(0, count)

  return picked.map(({ s, keywords }) => {
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]
    return {
      front: `What is meant by "${keyword}" in the context of: ${s.slice(0, 100)}...?`,
      back: s,
    }
  })
}

function generateQuiz(sentences: string[], allKeywords: string[], count: number) {
  const ranked = sentences
    .map(s => ({ s, keywords: getKeywords(s) }))
    .filter(x => x.keywords.length >= 2)
    .sort((a, b) => b.keywords.length - a.keywords.length)

  const picked = shuffle(ranked.slice(0, Math.min(count * 3, ranked.length))).slice(0, count)

  return picked.map(({ s, keywords }, i) => {
    const useTF = Math.random() < 0.3
    if (useTF) {
      const isTrue = Math.random() < 0.5
      let statement = s
      if (!isTrue && keywords.length > 0) {
        const kw = keywords[Math.floor(Math.random() * keywords.length)]
        const replacement = allKeywords.filter(w => w.toLowerCase() !== kw.toLowerCase())[
          Math.floor(Math.random() * allKeywords.length)
        ] || 'something else'
        statement = s.replace(new RegExp(kw, 'i'), replacement)
      }
      return {
        id: `pq${i + 1}`,
        question: `True or False: ${statement}`,
        type: 'true_false' as const,
        options: ['True', 'False'],
        correct_answer: isTrue ? 'True' : 'False',
        points: 1,
      }
    }

    // Multiple choice
    const keyword = keywords[0]
    const distractors = shuffle(
      allKeywords.filter(w => w.toLowerCase() !== keyword.toLowerCase())
    ).slice(0, 3)

    while (distractors.length < 3) distractors.push(`Option ${distractors.length + 1}`)

    const options = shuffle([keyword, ...distractors])
    return {
      id: `pq${i + 1}`,
      question: s.replace(new RegExp(`\\b${keyword}\\b`, 'i'), '________'),
      type: 'multiple_choice' as const,
      options,
      correct_answer: keyword,
      points: 2,
    }
  })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { courseId, type, count = 10, difficulty = 'medium' } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 })
    }

    // Get course materials
    const { data: materials } = await supabaseAdmin
      .from('course_materials')
      .select('extracted_text')
      .eq('course_id', courseId)

    const courseContext = materials?.map(m => m.extracted_text).filter(Boolean).join('\n\n') || ''

    if (!courseContext) {
      return NextResponse.json({ error: 'No course materials available.' }, { status: 400 })
    }

    const sentences = splitIntoSentences(courseContext)
    const allKeywords = Array.from(new Set(sentences.flatMap(s => getKeywords(s))))

    if (type === 'flashcards') {
      const cards = generateFlashcards(sentences, count)

      const { data: saved } = await supabaseAdmin
        .from('flashcard_sets')
        .insert({
          course_id: courseId,
          user_id: session.userId,
          title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Flashcards (${count})`,
          difficulty,
          cards,
        })
        .select()
        .single()

      return NextResponse.json({ flashcards: cards, savedId: saved?.id })
    }

    if (type === 'quiz') {
      const questions = generateQuiz(sentences, allKeywords, count)
      const totalPoints = questions.reduce((acc, q) => acc + q.points, 0)

      const { data: saved } = await supabaseAdmin
        .from('practice_quizzes')
        .insert({
          course_id: courseId,
          user_id: session.userId,
          title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Practice Quiz (${count}q)`,
          difficulty,
          questions,
          total_points: totalPoints,
        })
        .select()
        .single()

      return NextResponse.json({ questions, savedId: saved?.id })
    }

    return NextResponse.json({ error: 'Invalid type. Use "flashcards" or "quiz".' }, { status: 400 })
  } catch (err) {
    console.error('Generate study material error:', err)
    return NextResponse.json({ error: 'Failed to generate study materials.' }, { status: 500 })
  }
}

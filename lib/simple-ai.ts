import type { ExamQuestion, QuestionType } from './database.types'

// ─── Options ─────────────────────────────────────────────

export interface GenerateOptions {
  count?: number
  types?: QuestionType[]
}

// ─── Helpers ─────────────────────────────────────────────

const STOP_WORDS = new Set([
  'this', 'that', 'these', 'those', 'with', 'from', 'into', 'about',
  'which', 'where', 'when', 'what', 'were', 'been', 'being', 'have',
  'having', 'does', 'doing', 'will', 'would', 'could', 'should',
  'shall', 'also', 'than', 'then', 'them', 'they', 'their', 'there',
  'each', 'every', 'some', 'such', 'more', 'most', 'other', 'only',
  'same', 'very', 'just', 'because', 'since', 'while', 'after',
  'before', 'between', 'through', 'during', 'without', 'within',
  'along', 'following', 'across', 'behind', 'beyond', 'plus',
  'except', 'like', 'used', 'using', 'many', 'often', 'however',
  'therefore', 'although', 'though', 'the', 'and', 'for', 'are',
  'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our',
  'out', 'had', 'has', 'its', 'let', 'how', 'may', 'who',
])

/** Split text into clean sentences (≥20 chars, contains letters). */
function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 20 && /[a-zA-Z]{3,}/.test(s))
}

/** Extract important words from a sentence (≥4 chars, not stop words). */
function getKeywords(sentence: string): string[] {
  return sentence
    .replace(/[^a-zA-Z\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()))
}

/** Get random unique words from the full text, excluding a specific word. */
function getRandomWords(text: string, exclude: string, count: number): string[] {
  const pool = Array.from(
    new Set(
      text
        .replace(/[^a-zA-Z\s-]/g, '')
        .split(/\s+/)
        .filter(w => w.length >= 4 && w.toLowerCase() !== exclude.toLowerCase()),
    ),
  )
  return shuffleArray(pool).slice(0, count)
}

/** Fisher–Yates shuffle (non-mutating). */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Clean a sentence of stray symbols. */
function clean(s: string): string {
  return s.replace(/[^\w\s.,;:'"!?()-]/g, '').replace(/\s{2,}/g, ' ').trim()
}

/** Rank sentences: more keywords and longer = more important. */
function rankSentences(sentences: string[]): string[] {
  return [...sentences].sort((a, b) => {
    const ka = getKeywords(a).length
    const kb = getKeywords(b).length
    if (kb !== ka) return kb - ka
    return b.length - a.length
  })
}

// ─── Question Generators ─────────────────────────────────
// Each returns an ExamQuestion or null if it can't produce one.

function makeMultipleChoice(sentence: string, fullText: string, id: string): ExamQuestion | null {
  const keywords = getKeywords(sentence)
  if (keywords.length === 0) return null

  const answer = pick(keywords)
  const blanked = sentence.replace(new RegExp(`\\b${answer}\\b`, 'i'), '______')
  if (blanked === sentence) return null

  let distractors = getRandomWords(fullText, answer, 3)
  const fallback = ['component', 'function', 'module', 'process', 'system', 'method', 'object', 'value']
  while (distractors.length < 3) {
    const w = fallback.shift()
    if (!w) break
    if (w.toLowerCase() !== answer.toLowerCase() && !distractors.includes(w)) distractors.push(w)
  }

  const options = shuffleArray([answer, ...distractors.slice(0, 3)])

  return {
    id,
    type: 'multiple_choice',
    question: clean(blanked),
    options,
    correct_answer: answer,
    points: 1,
  }
}

function makeTrueFalse(sentence: string, fullText: string, id: string): ExamQuestion | null {
  const keywords = getKeywords(sentence)
  const shouldFalsify = Math.random() > 0.5 && keywords.length >= 2

  if (shouldFalsify) {
    const target = pick(keywords)
    const replacements = getRandomWords(fullText, target, 1)
    if (replacements.length > 0) {
      const falsified = sentence.replace(new RegExp(`\\b${target}\\b`, 'i'), replacements[0])
      if (falsified !== sentence) {
        return {
          id,
          type: 'true_false',
          question: clean(falsified),
          options: ['True', 'False'],
          correct_answer: 'False',
          points: 1,
        }
      }
    }
  }

  return {
    id,
    type: 'true_false',
    question: clean(sentence),
    options: ['True', 'False'],
    correct_answer: 'True',
    points: 1,
  }
}

function makeIdentification(sentence: string, _fullText: string, id: string): ExamQuestion | null {
  const keywords = getKeywords(sentence)
  if (keywords.length === 0) return null

  const answer = pick(keywords)
  const blanked = sentence.replace(new RegExp(`\\b${answer}\\b`, 'i'), '_____')
  if (blanked === sentence) return null

  return {
    id,
    type: 'identification',
    question: clean(blanked),
    correct_answer: answer,
    points: 1,
  }
}

function makeShortAnswer(sentence: string, _fullText: string, id: string): ExamQuestion | null {
  const keywords = getKeywords(sentence)
  if (keywords.length === 0) return null

  const stripped = clean(sentence).replace(/\.$/, '')

  const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^(.+?)\s+is\s+(.+)$/i, (m) => `What is ${m[1]}?`],
    [/^(.+?)\s+are\s+(.+)$/i, (m) => `What are ${m[1]}?`],
    [/^(.+?)\s+was\s+(.+)$/i, (m) => `What was ${m[1]}?`],
    [/^(.+?)\s+supports?\s+(.+)$/i, (m) => `What does ${m[1]} support?`],
    [/^(.+?)\s+provides?\s+(.+)$/i, (m) => `What does ${m[1]} provide?`],
    [/^(.+?)\s+allows?\s+(.+)$/i, (m) => `What does ${m[1]} allow?`],
    [/^(.+?)\s+enables?\s+(.+)$/i, (m) => `What does ${m[1]} enable?`],
    [/^(.+?)\s+uses?\s+(.+)$/i, (m) => `What does ${m[1]} use?`],
    [/^(.+?)\s+has\s+(.+)$/i, (m) => `What does ${m[1]} have?`],
    [/^(.+?)\s+includes?\s+(.+)$/i, (m) => `What does ${m[1]} include?`],
    [/^(.+?)\s+can\s+(.+)$/i, (m) => `What can ${m[1]} do?`],
    [/^(.+?)\s+creates?\s+(.+)$/i, (m) => `What does ${m[1]} create?`],
    [/^(.+?)\s+requires?\s+(.+)$/i, (m) => `What does ${m[1]} require?`],
  ]

  for (const [regex, transform] of patterns) {
    const match = stripped.match(regex)
    if (match) {
      return {
        id,
        type: 'short_answer',
        question: transform(match),
        correct_answer: clean(sentence),
        points: 2,
      }
    }
  }

  return {
    id,
    type: 'short_answer',
    question: `Explain the following: "${stripped.slice(0, 100)}${stripped.length > 100 ? '…' : ''}"`,
    correct_answer: clean(sentence),
    points: 2,
  }
}

// ─── Generator map ───────────────────────────────────────

const GENERATORS: Record<QuestionType, (s: string, t: string, id: string) => ExamQuestion | null> = {
  multiple_choice: makeMultipleChoice,
  true_false: makeTrueFalse,
  identification: makeIdentification,
  short_answer: makeShortAnswer,
}

// ─── Main Export ─────────────────────────────────────────

export function generateQuestions(
  text: string,
  options?: GenerateOptions,
): { questions: ExamQuestion[] } {
  const count = options?.count ?? 10
  const types = options?.types?.length
    ? options.types
    : (['multiple_choice', 'true_false', 'identification', 'short_answer'] as QuestionType[])

  const sentences = rankSentences(splitIntoSentences(text))
  if (sentences.length === 0) return { questions: [] }

  const questions: ExamQuestion[] = []
  const usedSentences = new Set<number>()
  let counter = 0
  let attempts = 0
  const maxAttempts = count * 5

  while (questions.length < count && attempts < maxAttempts) {
    attempts++

    // Cycle through requested types
    const type = types[questions.length % types.length]
    const gen = GENERATORS[type]
    if (!gen) continue

    // Prefer unused sentences, fall back to reused
    let idx = sentences.findIndex((_, i) => !usedSentences.has(i))
    if (idx === -1) idx = Math.floor(Math.random() * sentences.length)

    counter++
    const id = `q${counter}`
    const result = gen(sentences[idx], text, id)

    if (result) {
      questions.push(result)
      usedSentences.add(idx)
    }
  }

  return { questions: shuffleArray(questions) }
}

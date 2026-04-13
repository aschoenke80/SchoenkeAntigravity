'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { BookOpen, FileText, Video, CheckCircle2, Circle, MessageSquare, Bot, Sparkles, Award } from 'lucide-react'
import ProgressBar from '@/app/components/ProgressBar'
import ChatWidget from '@/app/components/ChatWidget'
import { markLessonComplete, markLessonIncomplete } from '@/app/actions/progress'

interface Lesson {
  id: string
  title: string
  content?: string
  content_type: string
  video_url?: string
  sort_order: number
  duration_minutes?: number
}

interface Module {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

interface Exam {
  id: string
  title: string
  questions: unknown[]
  time_limit_minutes?: number
}

interface Material {
  id: string
  file_name: string
  uploaded_at: string
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

interface CourseViewProps {
  course: { id: string; title: string; description: string; instructor_name: string }
  modules: Module[]
  materials: Material[]
  exams: Exam[]
  completedExamIds: string[]
  completedLessonIds: string[]
  progress: { completed: number; total: number; percentage: number }
  chatHistory: ChatMsg[]
  hasEnrolled: boolean
}

export default function StudentCourseView({
  course, modules, materials, exams, completedExamIds,
  completedLessonIds, progress, chatHistory, hasEnrolled,
}: CourseViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'materials' | 'exams' | 'chat' | 'study'>('overview')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set(completedLessonIds))
  const [isPending, startTransition] = useTransition()
  const [studyType, setStudyType] = useState<'flashcards' | 'quiz'>('flashcards')
  const [difficulty, setDifficulty] = useState('medium')
  const [count, setCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [flashcards, setFlashcards] = useState<{ front: string; back: string }[]>([])
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [showQuizResults, setShowQuizResults] = useState(false)

  const toggleLesson = (lessonId: string) => {
    const isCompleted = completedSet.has(lessonId)
    startTransition(async () => {
      if (isCompleted) {
        await markLessonIncomplete(lessonId, course.id)
        setCompletedSet(prev => { const n = new Set(prev); n.delete(lessonId); return n })
      } else {
        await markLessonComplete(lessonId, course.id)
        setCompletedSet(prev => new Set(prev).add(lessonId))
      }
    })
  }

  const generateStudyMaterial = async () => {
    setGenerating(true)
    setFlashcards([])
    setQuizQuestions([])
    setShowQuizResults(false)
    try {
      const res = await fetch('/api/generate-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, type: studyType, count, difficulty }),
      })
      const data = await res.json()
      if (studyType === 'flashcards' && data.flashcards) {
        setFlashcards(data.flashcards)
      } else if (studyType === 'quiz' && data.questions) {
        setQuizQuestions(data.questions)
        setQuizAnswers({})
      }
    } catch { /* ignore */ }
    setGenerating(false)
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <BookOpen size={15} /> },
    { key: 'lessons', label: 'Lessons', icon: <FileText size={15} /> },
    { key: 'exams', label: 'Exams', icon: <Award size={15} /> },
    { key: 'chat', label: 'AI Assistant', icon: <Bot size={15} /> },
    { key: 'study', label: 'Study Tools', icon: <Sparkles size={15} /> },
    { key: 'materials', label: 'Materials', icon: <FileText size={15} /> },
  ] as const

  const currentProgress = progress.total > 0
    ? Math.round((completedSet.size / progress.total) * 100)
    : 0

  return (
    <div>
      {/* Progress Bar */}
      {hasEnrolled && progress.total > 0 && (
        <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--color-surface-400)' }}>Course Progress</span>
            <span style={{ fontWeight: 600 }}>{completedSet.size}/{progress.total} lessons</span>
          </div>
          <ProgressBar percentage={currentProgress} />
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(15,23,42,0.6)',
        padding: '4px', borderRadius: '12px', flexWrap: 'wrap',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: activeTab === tab.key ? 600 : 400,
              background: activeTab === tab.key ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary-400)' : 'var(--color-surface-400)',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>About This Course</h2>
            <p style={{ color: 'var(--color-surface-300)', lineHeight: 1.7, marginBottom: '12px' }}>{course.description}</p>
            <p style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>Instructor: {course.instructor_name}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div className="stat-card">
              <p style={{ fontSize: '12px', color: 'var(--color-surface-400)' }}>Modules</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>{modules.length}</p>
            </div>
            <div className="stat-card">
              <p style={{ fontSize: '12px', color: 'var(--color-surface-400)' }}>Lessons</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{progress.total}</p>
            </div>
            <div className="stat-card">
              <p style={{ fontSize: '12px', color: 'var(--color-surface-400)' }}>Exams</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{exams.length}</p>
            </div>
            <div className="stat-card">
              <p style={{ fontSize: '12px', color: 'var(--color-surface-400)' }}>Materials</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>{materials.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedLesson ? '300px 1fr' : '1fr', gap: '20px' }}>
          <div>
            {modules.length > 0 ? modules.map((mod, idx) => (
              <div key={mod.id} style={{ marginBottom: '12px' }}>
                <div style={{
                  padding: '12px 16px', background: 'rgba(30,41,59,0.5)',
                  borderRadius: '10px 10px 0 0', borderBottom: '1px solid rgba(148,163,184,0.08)',
                  fontSize: '13px', fontWeight: 600, color: 'var(--color-surface-300)',
                }}>
                  Module {idx + 1}: {mod.title}
                </div>
                <div style={{
                  border: '1px solid rgba(148,163,184,0.08)', borderTop: 'none',
                  borderRadius: '0 0 10px 10px', overflow: 'hidden',
                }}>
                  {mod.lessons.map(lesson => {
                    const isComplete = completedSet.has(lesson.id)
                    const isSelected = selectedLesson?.id === lesson.id
                    return (
                      <div
                        key={lesson.id}
                        style={{
                          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                          cursor: 'pointer', borderBottom: '1px solid rgba(148,163,184,0.04)',
                          background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                          transition: 'background 0.2s',
                        }}
                        onClick={() => setSelectedLesson(lesson)}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLesson(lesson.id) }}
                          disabled={isPending}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                        >
                          {isComplete
                            ? <CheckCircle2 size={18} style={{ color: 'var(--color-accent-400)' }} />
                            : <Circle size={18} style={{ color: 'var(--color-surface-600)' }} />}
                        </button>
                        {lesson.content_type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                        <span style={{
                          fontSize: '13px', flex: 1,
                          textDecoration: isComplete ? 'line-through' : 'none',
                          color: isComplete ? 'var(--color-surface-500)' : 'inherit',
                        }}>
                          {lesson.title}
                        </span>
                        {lesson.duration_minutes && (
                          <span style={{ fontSize: '11px', color: 'var(--color-surface-600)' }}>{lesson.duration_minutes}m</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )) : (
              <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-surface-500)' }}>
                No modules available yet.
              </div>
            )}
          </div>

          {/* Lesson Content */}
          {selectedLesson && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>{selectedLesson.title}</h3>
              {selectedLesson.content_type === 'video' && selectedLesson.video_url && (
                <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
                  <iframe
                    src={selectedLesson.video_url}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {selectedLesson.content && (
                <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--color-surface-300)', whiteSpace: 'pre-wrap' }}>
                  {selectedLesson.content}
                </div>
              )}
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => toggleLesson(selectedLesson.id)}
                  disabled={isPending}
                  className={completedSet.has(selectedLesson.id) ? 'btn-secondary' : 'btn-accent'}
                >
                  {completedSet.has(selectedLesson.id) ? 'Mark as Incomplete' : '✓ Mark as Complete'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Available Exams</h2>
          {exams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exams.map(exam => {
                const completed = completedExamIds.includes(exam.id)
                return (
                  <div key={exam.id} style={{
                    padding: '16px', borderRadius: '10px', background: 'rgba(15,23,42,0.4)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid rgba(148,163,184,0.06)',
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '4px' }}>{exam.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                        {(exam.questions as unknown[]).length} questions
                        {exam.time_limit_minutes && ` · ${exam.time_limit_minutes} min`}
                      </p>
                    </div>
                    {completed ? (
                      <span className="badge badge-accent">Completed ✓</span>
                    ) : (
                      <Link href={`/dashboard/student/exams/${exam.id}`} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                        Take Exam →
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--color-surface-500)' }}>No exams available yet.</p>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div style={{ height: '600px' }}>
          <ChatWidget courseId={course.id} courseTitle={course.title} initialMessages={chatHistory} />
        </div>
      )}

      {/* Study Tools Tab */}
      {activeTab === 'study' && (
        <div>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>AI Study Tools</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label className="label">Type</label>
                <select value={studyType} onChange={e => setStudyType(e.target.value as any)} className="input-field" style={{ minWidth: '150px' }}>
                  <option value="flashcards">📇 Flashcards</option>
                  <option value="quiz">❓ Practice Quiz</option>
                </select>
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input-field" style={{ minWidth: '120px' }}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="label">Count</label>
                <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value) || 5)} min={1} max={30} className="input-field" style={{ width: '80px' }} />
              </div>
              <button onClick={generateStudyMaterial} disabled={generating} className="btn-primary" style={{ height: '44px' }}>
                {generating ? 'Generating...' : '✨ Generate'}
              </button>
            </div>
          </div>

          {/* Flashcards */}
          {flashcards.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Flashcards ({flashcards.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {flashcards.map((card, i) => (
                  <div
                    key={i}
                    onClick={() => setFlippedCards(prev => {
                      const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n
                    })}
                    className="glass-card"
                    style={{
                      padding: '24px', minHeight: '140px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center', transition: 'all 0.3s',
                      background: flippedCards.has(i) ? 'rgba(16,185,129,0.08)' : 'rgba(30,41,59,0.5)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--color-surface-500)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        {flippedCards.has(i) ? 'Answer' : 'Question'} · Click to flip
                      </div>
                      <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                        {flippedCards.has(i) ? card.back : card.front}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz */}
          {quizQuestions.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Practice Quiz ({quizQuestions.length} questions)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {quizQuestions.map((q, i) => (
                  <div key={q.id || i} className="glass-card" style={{ padding: '20px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>{i + 1}. {q.question}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options?.map((opt: string) => {
                        const isSelected = quizAnswers[q.id] === opt
                        const isCorrect = showQuizResults && opt === q.correct_answer
                        const isWrong = showQuizResults && isSelected && opt !== q.correct_answer
                        return (
                          <label key={opt} style={{
                            padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.5)' : isWrong ? 'rgba(239,68,68,0.5)' : isSelected ? 'rgba(99,102,241,0.5)' : 'rgba(148,163,184,0.1)'}`,
                            background: isCorrect ? 'rgba(16,185,129,0.08)' : isWrong ? 'rgba(239,68,68,0.08)' : isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
                          }}>
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={isSelected}
                              onChange={() => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              disabled={showQuizResults}
                              style={{ accentColor: 'var(--color-primary-500)' }}
                            />
                            {opt}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {!showQuizResults ? (
                  <button onClick={() => setShowQuizResults(true)} className="btn-primary" style={{ width: 'fit-content' }}>
                    Check Answers
                  </button>
                ) : (
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                      {quizQuestions.filter(q => quizAnswers[q.id] === q.correct_answer).length}/{quizQuestions.length} correct
                    </p>
                    <button onClick={() => { setShowQuizResults(false); setQuizAnswers({}) }} className="btn-secondary">
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Course Materials</h2>
          {materials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {materials.map(mat => (
                <div key={mat.id} style={{
                  padding: '12px 16px', borderRadius: '8px',
                  background: 'rgba(15,23,42,0.4)', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '14px' }}>📄 {mat.file_name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                      {new Date(mat.uploaded_at).toLocaleDateString()}
                    </span>
                    <a
                      href={`/api/download/${mat.id}`}
                      download
                      style={{
                        fontSize: '12px', padding: '4px 10px', borderRadius: '6px',
                        background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-400)',
                        textDecoration: 'none', fontWeight: 500,
                      }}
                    >
                      ⬇ Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-surface-500)' }}>No materials available yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

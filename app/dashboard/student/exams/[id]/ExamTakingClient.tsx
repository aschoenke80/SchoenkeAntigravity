'use client'

import { useState, useEffect, useCallback } from 'react'
import { submitExam } from '@/app/actions/exams'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  question: string
  type: string
  options?: string[]
  points: number
}

interface ExamTakingClientProps {
  examId: string
  examTitle: string
  courseTitle: string
  questions: Question[]
  timeLimitMinutes?: number
}

export default function ExamTakingClient({
  examId,
  examTitle,
  courseTitle,
  questions,
  timeLimitMinutes,
}: ExamTakingClientProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; totalPoints: number } | null>(null)
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : null)

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)

    const res = await submitExam(examId, answers)
    if (res && 'score' in res) {
      setResult({ score: res.score as number, totalPoints: res.totalPoints as number })
    }
    setSubmitting(false)
  }, [submitting, examId, answers])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, handleSubmit])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const answered = Object.keys(answers).filter(k => answers[k]?.trim()).length
  const totalPoints = questions.reduce((acc, q) => acc + q.points, 0)

  if (result) {
    const pct = result.totalPoints > 0 ? Math.round((result.score / result.totalPoints) * 100) : 0
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '40px' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          <p style={{ fontSize: '64px', marginBottom: '16px' }}>{pct >= 70 ? '🎉' : pct >= 50 ? '😊' : '😔'}</p>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Exam Submitted!</h2>
          <p style={{
            fontSize: '48px', fontWeight: 800, marginBottom: '8px',
            background: `linear-gradient(135deg, ${pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'}, #6366f1)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            {result.score}/{result.totalPoints}
          </p>
          <p style={{ fontSize: '20px', color: 'var(--color-surface-400)', marginBottom: '24px' }}>
            {pct}% {pct >= 70 ? '- Great job!' : pct >= 50 ? '- Good effort!' : '- Keep studying!'}
          </p>
          <button onClick={() => router.push('/dashboard/student/scores')} className="btn-primary">
            View All Scores →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, padding: '16px 0',
        background: 'var(--color-surface-950)',
        borderBottom: '1px solid rgba(148,163,184,0.08)', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700 }}>{examTitle}</h1>
            <p style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>
              {courseTitle} · {answered}/{questions.length} answered · {totalPoints} points
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {timeLeft !== null && (
              <div style={{
                padding: '8px 16px', borderRadius: '10px',
                background: timeLeft < 60 ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                color: timeLeft < 60 ? 'var(--color-danger-500)' : 'var(--color-primary-400)',
                fontWeight: 700, fontSize: '16px', fontFamily: 'monospace'
              }}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, idx) => (
          <div key={q.id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-400)' }}>
                Question {idx + 1}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                {q.points} point{q.points !== 1 ? 's' : ''}
              </span>
            </div>

            <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px', lineHeight: 1.6 }}>
              {q.question}
            </p>

            {q.type === 'multiple_choice' && q.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, oIdx) => (
                  <label key={oIdx} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                    background: answers[q.id] === opt ? 'rgba(99,102,241,0.12)' : 'rgba(15,23,42,0.4)',
                    border: `1px solid ${answers[q.id] === opt ? 'rgba(99,102,241,0.3)' : 'rgba(148,163,184,0.06)'}`,
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                      style={{ accentColor: 'var(--color-primary-500)' }}
                    />
                    <span style={{ fontSize: '14px' }}>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'true_false' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {['True', 'False'].map((opt) => (
                  <label key={opt} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    background: answers[q.id] === opt ? 'rgba(99,102,241,0.12)' : 'rgba(15,23,42,0.4)',
                    border: `1px solid ${answers[q.id] === opt ? 'rgba(99,102,241,0.3)' : 'rgba(148,163,184,0.06)'}`,
                    transition: 'all 0.2s', fontWeight: answers[q.id] === opt ? 600 : 400
                  }}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                      style={{ accentColor: 'var(--color-primary-500)' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {(q.type === 'identification' || q.type === 'short_answer') && (
              <div>
                {q.type === 'short_answer' ? (
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Type your answer..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                ) : (
                  <input
                    className="input-field"
                    placeholder="Type your answer..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit button at bottom */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button onClick={handleSubmit} className="btn-primary" disabled={submitting}
          style={{ padding: '14px 40px', fontSize: '16px' }}>
          {submitting ? 'Submitting...' : '📤 Submit Exam'}
        </button>
      </div>
    </div>
  )
}

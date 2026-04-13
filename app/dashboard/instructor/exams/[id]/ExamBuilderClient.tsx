'use client'

import { useState } from 'react'
import { updateExamQuestions, publishExam, deleteExam } from '@/app/actions/exams'
import type { ExamQuestion, QuestionType } from '@/lib/database.types'
import { generateQuestions } from '@/lib/simple-ai'

interface Material {
  id: string
  file_name: string
  extracted_text: string
}

interface Submission {
  id: string
  score: number
  total_points: number
  submitted_at: string
  users: { name: string; email: string }
}

interface ExamBuilderClientProps {
  exam: {
    id: string
    title: string
    is_published: boolean
    questions: ExamQuestion[]
    time_limit_minutes?: number
  }
  materials: Material[]
  submissions: Submission[]
}

const questionTypeLabels: Record<QuestionType, string> = {
  multiple_choice: '🔘 Multiple Choice',
  true_false: '✅ True/False',
  identification: '✏️ Identification',
  short_answer: '📝 Short Answer',
}

export default function ExamBuilderClient({ exam, materials, submissions }: ExamBuilderClientProps) {
  const [questions, setQuestions] = useState<ExamQuestion[]>(exam.questions || [])
  const [activeTab, setActiveTab] = useState<'builder' | 'ai' | 'submissions'>('builder')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'multiple_choice', 'true_false', 'identification', 'short_answer'
  ])

  const handleGenerateAI = () => {
    if (!selectedMaterial) {
      setMessage('❌ No material selected')
      return
    }

    const material = materials.find(m => m.id === selectedMaterial)
    if (!material?.extracted_text) {
      setMessage('❌ No text content in selected material')
      return
    }

    setGenerating(true)
    setMessage('')

    try {
      const result = generateQuestions(material.extracted_text, {
        count: questionCount,
        types: selectedTypes,
      })

      if (result.questions.length > 0) {
        setQuestions(prev => [...prev, ...result.questions])
        setMessage(`✅ Generated ${result.questions.length} questions!`)
        setActiveTab('builder')
      } else {
        setMessage('❌ Could not generate questions. Try providing more detailed material.')
      }
    } catch {
      setMessage('❌ Failed to generate questions')
    }
    setGenerating(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await updateExamQuestions(exam.id, questions)
    setMessage(result.message.startsWith('Failed') ? '❌ ' + result.message : '✅ ' + result.message)
    setSaving(false)
  }

  const handlePublish = async (publish: boolean) => {
    await publishExam(exam.id, publish)
  }

  const handleDelete = async () => {
    if (confirm('Delete this exam? This cannot be undone.')) {
      await deleteExam(exam.id)
    }
  }

  const addQuestion = () => {
    const newQ: ExamQuestion = {
      id: `q${Date.now()}`,
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
    }
    setQuestions([...questions, newQ])
  }

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const updateQuestion = (idx: number, field: string, value: unknown) => {
    const updated = [...questions]
    ;(updated[idx] as unknown as Record<string, unknown>)[field] = value
    if (field === 'type') {
      if (value === 'true_false') {
        updated[idx].options = ['True', 'False']
      } else if (value === 'multiple_choice') {
        updated[idx].options = ['', '', '', '']
      } else {
        updated[idx].options = undefined
      }
    }
    setQuestions(updated)
  }

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions]
    if (updated[qIdx].options) {
      updated[qIdx].options![oIdx] = value
    }
    setQuestions(updated)
  }

  const tabs = [
    { key: 'builder', label: '📝 Question Builder' },
    { key: 'ai', label: '🤖 AI Generate' },
    { key: 'submissions', label: `📊 Submissions (${submissions.length})` },
  ] as const

  return (
    <div>
      {/* Actions bar */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap'
      }}>
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Questions'}
        </button>
        <button
          onClick={() => handlePublish(!exam.is_published)}
          className={exam.is_published ? 'btn-secondary' : 'btn-accent'}
        >
          {exam.is_published ? '📤 Unpublish' : '🚀 Publish'}
        </button>
        <button onClick={handleDelete} className="btn-danger">🗑 Delete</button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
          background: message.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${message.startsWith('✅') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: message.startsWith('✅') ? 'var(--color-accent-400)' : 'var(--color-danger-500)',
          fontSize: '13px'
        }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(15,23,42,0.6)',
        padding: '4px', borderRadius: '12px', width: 'fit-content',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: activeTab === tab.key ? 600 : 400,
              background: activeTab === tab.key ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary-400)' : 'var(--color-surface-400)',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Builder Tab */}
      {activeTab === 'builder' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px', color: 'var(--color-surface-400)' }}>
              {questions.length} question{questions.length !== 1 ? 's' : ''} ·{' '}
              {questions.reduce((acc, q) => acc + q.points, 0)} total points
            </span>
            <button onClick={addQuestion} className="btn-secondary" style={{ padding: '8px 16px' }}>
              + Add Question
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, idx) => (
              <div key={q.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-400)' }}>
                    Question {idx + 1}
                  </span>
                  <button
                    onClick={() => removeQuestion(idx)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--color-danger-500)',
                      cursor: 'pointer', fontSize: '14px'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 80px', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label className="label">Type</label>
                    <select
                      className="input-field"
                      value={q.type}
                      onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                    >
                      {Object.entries(questionTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Points</label>
                    <input
                      type="number" min="1" max="10"
                      className="input-field"
                      value={q.points}
                      onChange={(e) => updateQuestion(idx, 'points', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label">Question</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                    placeholder="Enter your question..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Options for MC/TF */}
                {q.options && (
                  <div style={{ marginBottom: '16px' }}>
                    <label className="label">Options</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'rgba(99,102,241,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-400)',
                            flexShrink: 0
                          }}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <input
                            className="input-field"
                            value={opt}
                            onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            disabled={q.type === 'true_false'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Correct Answer</label>
                  {q.type === 'true_false' ? (
                    <select
                      className="input-field"
                      value={q.correct_answer}
                      onChange={(e) => updateQuestion(idx, 'correct_answer', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : q.type === 'multiple_choice' ? (
                    <select
                      className="input-field"
                      value={q.correct_answer}
                      onChange={(e) => updateQuestion(idx, 'correct_answer', e.target.value)}
                    >
                      <option value="">Select correct option...</option>
                      {q.options?.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>{opt || `Option ${String.fromCharCode(65 + oIdx)}`}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input-field"
                      value={q.correct_answer}
                      onChange={(e) => updateQuestion(idx, 'correct_answer', e.target.value)}
                      placeholder="Enter the correct answer"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {questions.length === 0 && (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>📝</p>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No questions yet</h3>
              <p style={{ color: 'var(--color-surface-400)', marginBottom: '24px' }}>
                Add questions manually or use AI to generate them
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={addQuestion} className="btn-secondary">+ Add Manually</button>
                <button onClick={() => setActiveTab('ai')} className="btn-primary">🤖 AI Generate</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Generate Tab */}
      {activeTab === 'ai' && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
            🤖 AI Exam Generator
          </h3>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '24px' }}>
            Select a course material and let AI generate exam questions automatically
          </p>

          {materials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label className="label">Source Material</label>
                <select
                  className="input-field"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                >
                  <option value="">Choose a material...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>📄 {m.file_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Number of Questions</label>
                <input
                  type="number" min="1" max="30"
                  className="input-field" style={{ width: '120px' }}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                />
              </div>

              <div>
                <label className="label">Question Types</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {(Object.entries(questionTypeLabels) as [QuestionType, string][]).map(([key, label]) => (
                    <label key={key} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', borderRadius: '8px',
                      background: selectedTypes.includes(key) ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.6)',
                      border: `1px solid ${selectedTypes.includes(key) ? 'rgba(99,102,241,0.3)' : 'rgba(148,163,184,0.1)'}`,
                      cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(key)}
                        onChange={() => {
                          setSelectedTypes(prev =>
                            prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
                          )
                        }}
                        style={{ accentColor: 'var(--color-primary-500)' }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateAI}
                className="btn-primary"
                disabled={generating || !selectedMaterial}
                style={{ width: '240px', padding: '12px' }}
              >
                {generating ? '🔄 Generating...' : '🤖 Generate Questions'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-surface-500)' }}>
              <p>No materials uploaded for this course. Upload PDFs first to use AI generation.</p>
            </div>
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Student Submissions</h3>
          {submissions.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => {
                    const pct = sub.total_points > 0 ? Math.round((sub.score / sub.total_points) * 100) : 0
                    return (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 500 }}>{sub.users?.name}</td>
                        <td>{sub.users?.email}</td>
                        <td>{sub.score}/{sub.total_points}</td>
                        <td>
                          <span className={`badge ${pct >= 70 ? 'badge-accent' : pct >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                            {pct}%
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-surface-500)' }}>
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-surface-500)' }}>
              No submissions yet
            </p>
          )}
        </div>
      )}
    </div>
  )
}

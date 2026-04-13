'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createDiscussion } from '@/app/actions/discussions'
import Link from 'next/link'

interface Course {
  id: string
  title: string
}

export default function NewDiscussionClient({ courses, backHref = '/dashboard/student/discussions' }: { courses: Course[]; backHref?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const courseId = formData.get('course_id') as string
    if (!courseId) {
      setError('Please select a course.')
      setPending(false)
      return
    }
    const result = await createDiscussion(courseId, formData)
    if (result.error) {
      setError(result.error)
      setPending(false)
    } else {
      router.push(backHref)
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px' }}>
      <Link href={backHref}
        style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '16px', display: 'inline-block' }}>
        ← Back to Discussions
      </Link>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Start a Discussion</h1>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div>
          <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Course</label>
          <select name="course_id" required className="input-field" style={{ width: '100%' }}>
            <option value="">Select a course...</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Title</label>
          <input type="text" name="title" required className="input-field" style={{ width: '100%' }} placeholder="What's your question or topic?" />
        </div>

        <div>
          <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Content</label>
          <textarea
            name="content"
            required
            className="input-field"
            rows={6}
            placeholder="Describe your question or start a conversation..."
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={pending} style={{ width: '100%', marginTop: '4px' }}>
          {pending ? 'Posting...' : 'Post Discussion'}
        </button>
      </form>
    </div>
  )
}

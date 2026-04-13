'use client'

import { useActionState } from 'react'
import { createCourse } from '@/app/actions/courses'

export default function NewCoursePage() {
  const [state, action, pending] = useActionState(createCourse, undefined)

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Create New Course</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '32px' }}>
        Fill in the details to create a new course
      </p>

      {state?.message && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          color: 'var(--color-danger-500)', fontSize: '13px'
        }}>
          {state.message}
        </div>
      )}

      <form action={action} className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label htmlFor="title" className="label">Course Title</label>
            <input
              id="title" name="title" type="text"
              placeholder="e.g., Introduction to Computer Science"
              className="input-field" required
            />
            {state?.errors?.title && <p className="error-text">{state.errors.title[0]}</p>}
          </div>

          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description" name="description"
              placeholder="Describe what students will learn in this course..."
              className="input-field"
              rows={5}
              style={{ resize: 'vertical' }}
              required
            />
            {state?.errors?.description && <p className="error-text">{state.errors.description[0]}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={pending}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            {pending ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  )
}

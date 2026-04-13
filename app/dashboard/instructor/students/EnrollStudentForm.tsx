'use client'

import { useActionState, useEffect } from 'react'
import { instructorEnrollStudent } from '@/app/actions/courses'

interface Course {
  id: string
  title: string
}

interface EnrollFormProps {
  studentId: string
  courses: Course[]
}

export default function EnrollStudentForm({ studentId, courses }: EnrollFormProps) {
  const [state, action, pending] = useActionState(instructorEnrollStudent, undefined)

  useEffect(() => {
    if (state?.message === 'success') {
      alert('Student successfully enrolled!')
    } else if (state?.message) {
      alert(state.message) // Just alert error for simplicity
    }
  }, [state])

  if (!courses || courses.length === 0) {
    return <span style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>No courses</span>
  }

  return (
    <form action={action} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input type="hidden" name="student_id" value={studentId} />
      <select 
        name="course_id" 
        style={{
          padding: '6px 12px', borderRadius: '6px', fontSize: '13px',
          background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)',
          color: 'var(--color-surface-200)', minWidth: '150px'
        }}
        required
      >
        <option value="">Enroll in...</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>
      <button 
        type="submit" 
        disabled={pending}
        style={{
          padding: '6px 12px', borderRadius: '6px', fontSize: '13px',
          background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-400)',
          border: '1px solid rgba(99,102,241,0.3)', cursor: pending ? 'not-allowed' : 'pointer'
        }}
      >
        {pending ? '...' : '+ Add'}
      </button>
    </form>
  )
}

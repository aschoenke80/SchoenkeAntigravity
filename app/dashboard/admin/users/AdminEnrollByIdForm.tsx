'use client'

import { useActionState, useEffect } from 'react'
import { adminEnrollStudentByIdNumber } from '@/app/actions/admin'

interface Course {
  id: string
  title: string
}

interface AdminEnrollByIdFormProps {
  courses: Course[]
}

export default function AdminEnrollByIdForm({ courses }: AdminEnrollByIdFormProps) {
  const [state, action, pending] = useActionState(adminEnrollStudentByIdNumber, undefined)

  useEffect(() => {
    if (state?.message === 'success') {
      alert(`${state.studentName || 'Student'} successfully enrolled!`)
    } else if (state?.message) {
      alert(state.message)
    }
  }, [state])

  if (!courses || courses.length === 0) {
    return <p style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>No courses available.</p>
  }

  return (
    <form action={action} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div>
        <label className="label">Student ID Number</label>
        <input
          name="student_id_number"
          type="text"
          placeholder="e.g. 22200002344"
          className="input-field"
          required
          style={{ minWidth: '200px' }}
        />
      </div>
      <div>
        <label className="label">Course</label>
        <select name="course_id" className="input-field" required style={{ minWidth: '200px' }}>
          <option value="">Select course...</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={pending} style={{ height: '44px' }}>
        {pending ? 'Enrolling...' : 'Enroll Student'}
      </button>
    </form>
  )
}

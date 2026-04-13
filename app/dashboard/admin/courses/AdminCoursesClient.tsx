'use client'

import { useTransition, useState, useActionState } from 'react'
import { adminDeleteCourse, adminCreateCourse, adminEnrollStudentToCourse } from '@/app/actions/admin'

interface Course {
  id: string
  title: string
  description: string
  is_published: boolean
  created_at: string
  users: { name: string; email: string }
  enrollments: { count: number }[]
}

interface Instructor {
  id: string
  name: string
  email: string
}

interface Student {
  id: string
  name: string
  email: string
  student_id_number?: string | null
}

interface Props {
  courses: Course[]
  instructors: Instructor[]
  students: Student[]
}

export default function AdminCoursesClient({ courses, instructors, students }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [enrollCourseId, setEnrollCourseId] = useState<string | null>(null)

  const [createState, createAction, createPending] = useActionState(adminCreateCourse, undefined)
  const [enrollState, enrollAction, enrollPending] = useActionState(adminEnrollStudentToCourse, undefined)

  const handleDelete = (courseId: string, title: string) => {
    if (!confirm(`Delete course "${title}"? This will remove all related materials, exams, and enrollments.`)) return
    startTransition(async () => {
      await adminDeleteCourse(courseId)
      setMessage('✅ Course deleted')
      setTimeout(() => setMessage(''), 2000)
    })
  }

  const showMsg = message || (
    createState?.message === 'success' ? '✅ Course created!' :
    createState?.message ? '❌ ' + createState.message :
    enrollState?.message === 'success' ? '✅ Student enrolled!' :
    enrollState?.message ? '❌ ' + enrollState.message : ''
  )

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>All Courses</h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
            Manage all courses on the platform
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          {showCreate ? 'Cancel' : '+ Create Course'}
        </button>
      </div>

      {showMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
          background: showMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${showMsg.startsWith('✅') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: showMsg.startsWith('✅') ? 'var(--color-accent-400)' : 'var(--color-danger-500)',
          fontSize: '13px'
        }}>
          {showMsg}
        </div>
      )}

      {/* Create Course Form */}
      {showCreate && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Create New Course</h3>
          <form action={createAction} style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px', alignItems: 'flex-end'
          }}>
            <div>
              <label className="label">Course Title</label>
              <input name="title" className="input-field" placeholder="e.g. Introduction to IT" required />
            </div>
            <div>
              <label className="label">Description</label>
              <input name="description" className="input-field" placeholder="Brief course description" />
            </div>
            <div>
              <label className="label">Assign Instructor</label>
              <select name="instructor_id" className="input-field" required>
                <option value="">Select instructor...</option>
                {instructors.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={createPending}>
              {createPending ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      {/* Courses Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div>
                      <p style={{ fontWeight: 500 }}>{course.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                        {course.description?.slice(0, 50)}...
                      </p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 500 }}>{course.users?.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>{course.users?.email}</p>
                    </div>
                  </td>
                  <td>{course.enrollments?.[0]?.count || 0}</td>
                  <td>
                    <span className={`badge ${course.is_published ? 'badge-accent' : 'badge-warning'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-surface-500)', fontSize: '13px' }}>
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setEnrollCourseId(enrollCourseId === course.id ? null : course.id)}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--color-primary-400)', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 500
                        }}
                      >
                        Enroll
                      </button>
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        disabled={isPending}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--color-danger-500)', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 500
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    {enrollCourseId === course.id && (
                      <form action={enrollAction} style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                        <input type="hidden" name="course_id" value={course.id} />
                        <select name="student_id" className="input-field" style={{ padding: '4px 8px', fontSize: '12px', maxWidth: '160px' }} required>
                          <option value="">Select student...</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name}{s.student_id_number ? ` (${s.student_id_number})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={enrollPending}
                          style={{
                            padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                            background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-400)',
                            border: '1px solid rgba(99,102,241,0.3)', cursor: enrollPending ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {enrollPending ? '...' : '+ Enroll'}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-surface-500)', padding: '40px' }}>
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

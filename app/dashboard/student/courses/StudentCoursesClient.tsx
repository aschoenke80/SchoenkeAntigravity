'use client'

import { enrollInCourse, unenrollFromCourse } from '@/app/actions/courses'
import { useState, useTransition } from 'react'

interface Course {
  id: string
  title: string
  description: string
  users: { name: string }
  created_at: string
}

export default function StudentCoursesClient({
  courses,
  enrolledCourseIds,
}: {
  courses: Course[]
  enrolledCourseIds: string[]
}) {
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set(enrolledCourseIds))
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const handleEnroll = (courseId: string) => {
    startTransition(async () => {
      const result = await enrollInCourse(courseId)
      if (result?.message) {
        setMessage(result.message)
      } else {
        setEnrolled(prev => new Set([...prev, courseId]))
        setMessage('✅ Enrolled successfully!')
      }
      setTimeout(() => setMessage(''), 3000)
    })
  }

  const handleUnenroll = (courseId: string) => {
    startTransition(async () => {
      await unenrollFromCourse(courseId)
      setEnrolled(prev => {
        const next = new Set(prev)
        next.delete(courseId)
        return next
      })
      setMessage('Course dropped.')
      setTimeout(() => setMessage(''), 3000)
    })
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Browse Courses</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '32px' }}>
        Discover and enroll in available courses
      </p>

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

      {courses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {courses.map((course) => {
            const isEnrolled = enrolled.has(course.id)
            return (
              <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{course.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', lineHeight: 1.6, marginBottom: '12px' }}>
                  {course.description?.slice(0, 150)}...
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-surface-500)', marginBottom: '16px' }}>
                  👨‍🏫 {course.users?.name || 'Unknown Instructor'}
                </p>
                {isEnrolled ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge badge-accent">Enrolled ✓</span>
                    <button
                      onClick={() => handleUnenroll(course.id)}
                      disabled={isPending}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--color-surface-500)', cursor: 'pointer',
                        fontSize: '12px', textDecoration: 'underline'
                      }}
                    >
                      Drop
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={isPending}
                    className="btn-primary"
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                  >
                    {isPending ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📚</p>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No courses available</h3>
          <p style={{ color: 'var(--color-surface-400)' }}>Check back later for new courses</p>
        </div>
      )}
    </div>
  )
}

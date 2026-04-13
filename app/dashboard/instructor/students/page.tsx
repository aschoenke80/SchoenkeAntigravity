import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import EnrollStudentForm from './EnrollStudentForm'
import EnrollByIdForm from './EnrollByIdForm'

interface EnrollmentData {
  course_id: string
  courses: {
    title: string
  }[] | { title: string } | null
}

export default async function InstructorStudentsPage() {
  const session = await requireAuth(['instructor'])

  // Get all students
  const { data: students } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('name')

  // Get instructor's courses
  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('instructor_id', session.userId)
    .order('title')

  // Get enrollments
  let enrollmentsMap: Record<string, string[]> = {}
  if (courses && courses.length > 0) {
    const courseIds = courses.map(c => c.id)
    const { data: enrolls } = await supabaseAdmin
      .from('enrollments')
      .select('student_id, course_id, courses(title)')
      .in('course_id', courseIds)

    enrolls?.forEach((e: any) => {
      if (!enrollmentsMap[e.student_id]) {
        enrollmentsMap[e.student_id] = []
      }
      if (e.courses?.title) {
        enrollmentsMap[e.student_id].push(e.courses.title)
      }
    })
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Manage Students</h1>
      <p style={{ color: 'var(--color-surface-400)', marginBottom: '32px' }}>
        View all students and enroll them into your courses
      </p>

      {/* Enroll by Student ID Number */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Enroll Student by ID Number</h2>
        <EnrollByIdForm courses={courses || []} />
      </div>

      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        {students && students.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.1)', color: 'var(--color-surface-400)', fontSize: '13px' }}>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>ID Number</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Enrolled In</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const enrolledCourses = enrollmentsMap[student.id] || []
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.05)', fontSize: '14px' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{student.name}</td>
                    <td style={{ padding: '16px', color: 'var(--color-surface-300)', fontFamily: 'monospace', fontSize: '13px' }}>{student.student_id_number || '—'}</td>
                    <td style={{ padding: '16px', color: 'var(--color-surface-300)' }}>{student.email}</td>
                    <td style={{ padding: '16px' }}>
                      {enrolledCourses.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {enrolledCourses.map((cTitle, idx) => (
                            <span key={idx} style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                              background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-300)'
                            }}>
                              {cTitle}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-surface-500)', fontSize: '13px' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <EnrollStudentForm studentId={student.id} courses={courses || []} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-surface-500)' }}>
            No students found in the system.
          </div>
        )}
      </div>
    </div>
  )
}

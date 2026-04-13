'use client'

import { useState, useTransition } from 'react'
import { updateUserRole, deleteUser, createUser } from '@/app/actions/admin'
import AdminEnrollStudentForm from './AdminEnrollStudentForm'
import AdminEnrollByIdForm from './AdminEnrollByIdForm'

interface User {
  id: string
  name: string
  email: string
  student_id_number?: string | null
  role: string
  created_at: string
}

interface Course {
  id: string
  title: string
}

interface AdminUsersClientProps {
  users: User[]
  courses: Course[]
  enrollmentsMap: Record<string, string[]>
}

export default function AdminUsersClient({ users, courses, enrollmentsMap }: AdminUsersClientProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      await updateUserRole(userId, newRole)
      setMessage('✅ Role updated')
      setTimeout(() => setMessage(''), 2000)
    })
  }

  const handleDelete = (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteUser(userId)
      setMessage('✅ User deleted')
      setTimeout(() => setMessage(''), 2000)
    })
  }

  const handleCreate = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createUser(formData)
      if (result?.message) {
        setMessage(result.message.includes('success') ? '✅ ' + result.message : '❌ ' + result.message)
        if (result.message.includes('success')) setShowCreate(false)
      }
      setTimeout(() => setMessage(''), 3000)
    })
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>User Management</h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
            {users.length} users registered
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          {showCreate ? 'Cancel' : '+ Add User'}
        </button>
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

      {/* Create User Form */}
      {showCreate && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Create New User</h3>
          <form action={handleCreate} style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px', alignItems: 'flex-end'
          }}>
            <div>
              <label className="label">Name</label>
              <input name="name" className="input-field" placeholder="Full name" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input-field" placeholder="email@example.com" required />
            </div>
            <div>
              <label className="label">ID Number</label>
              <input name="student_id_number" className="input-field" placeholder="e.g. 22200002344" />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input-field" placeholder="Min 8 chars" required />
            </div>
            <div>
              <label className="label">Role</label>
              <select name="role" className="input-field" required>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      {/* Enroll by Student ID Number */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Enroll Student by ID Number</h3>
        <AdminEnrollByIdForm courses={courses} />
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID Number</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Enrolled In</th>
                <th>Enrollments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const enrolledCourses = enrollmentsMap[user.id] || []
                return (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-surface-300)' }}>{user.student_id_number || '—'}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={isPending}
                        style={{
                          background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)',
                          borderRadius: '6px', padding: '4px 8px', color: 'var(--color-surface-200)',
                          fontSize: '13px', cursor: 'pointer'
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--color-surface-500)', fontSize: '13px' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ maxWidth: '150px' }}>
                      {user.role === 'student' ? (
                        enrolledCourses.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {enrolledCourses.map((cTitle, idx) => (
                              <span key={idx} style={{
                                padding: '2px 6px', borderRadius: '4px', fontSize: '11px',
                                background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-300)',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                              }}>
                                {cTitle}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-surface-500)', fontSize: '12px' }}>None</span>
                        )
                      ) : null}
                    </td>
                    <td>
                      {user.role === 'student' && (
                        <AdminEnrollStudentForm studentId={user.id} courses={courses} />
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={isPending}
                        style={{
                          background: 'none', border: 'none',
                          color: 'var(--color-danger-500)', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 500
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

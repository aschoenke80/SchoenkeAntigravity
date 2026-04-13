'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Material {
  id: string
  course_id: string
  file_name: string
  extracted_text: string
}

interface Course {
  id: string
  title: string
}

interface UploadPageClientProps {
  courses: Course[]
  materials: Material[]
}

export default function UploadPageClient({ courses, materials }: UploadPageClientProps) {
  const [selectedCourse, setSelectedCourse] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCourse) {
      setMessage('❌ Please select a course')
      return
    }
    setUploading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    formData.append('courseId', selectedCourse)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setMessage('✅ ' + data.message)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage('❌ ' + data.error)
      }
    } catch {
      setMessage('❌ Upload failed')
    }
    setUploading(false)
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Upload PDF Materials</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '32px' }}>
        Upload PDF files to extract text and generate AI-powered exams
      </p>

      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="label">Select Course</label>
            <select
              className="input-field"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
            >
              <option value="">Choose a course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">PDF File</label>
            <input type="file" name="file" accept=".pdf" className="input-field" required />
          </div>
          <button type="submit" className="btn-primary" disabled={uploading}
            style={{ width: '200px', padding: '12px' }}>
            {uploading ? '📤 Uploading...' : '📤 Upload & Extract'}
          </button>
        </form>
        {message && (
          <p style={{
            marginTop: '16px', fontSize: '14px',
            color: message.startsWith('✅') ? 'var(--color-accent-400)' : 'var(--color-danger-500)'
          }}>
            {message}
          </p>
        )}
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Uploaded Materials</h2>
      {materials.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {materials.map((mat) => {
            const course = courses.find(c => c.id === mat.course_id)
            return (
              <div key={mat.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>📄 {mat.file_name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                      Course: {course?.title || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`/api/download/${mat.id}`}
                      download
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                    >
                      ⬇ Download
                    </a>
                    <Link
                      href={`/dashboard/instructor/courses/${mat.course_id}`}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      View Course
                    </Link>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', lineHeight: 1.6, marginTop: '8px' }}>
                  {mat.extracted_text?.slice(0, 200) || 'No text extracted'}...
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-surface-500)' }}>
          No materials uploaded yet. Upload your first PDF above!
        </div>
      )}
    </div>
  )
}

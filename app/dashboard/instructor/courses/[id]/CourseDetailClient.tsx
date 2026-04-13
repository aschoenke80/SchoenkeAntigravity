'use client'

import { useState } from 'react'
import { updateCourse, deleteCourse } from '@/app/actions/courses'
import { createExam } from '@/app/actions/exams'
import Link from 'next/link'
import ModuleLessonManager from '@/app/components/ModuleLessonManager'

interface Material {
  id: string
  file_name: string
  extracted_text: string
  uploaded_at: string
}

interface Exam {
  id: string
  title: string
  is_published: boolean
  questions: unknown[]
  created_at: string
}

interface ModuleData {
  id: string
  title: string
  description?: string
  sort_order: number
  lessons: { id: string; title: string; content_type: string; sort_order: number; duration_minutes?: number }[]
}

interface CourseDetailClientProps {
  course: { id: string; title: string; description: string; is_published: boolean }
  materials: Material[]
  exams: Exam[]
  modules?: ModuleData[]
}

export default function CourseDetailClient({ course, materials, exams, modules = [] }: CourseDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'modules' | 'materials' | 'exams'>('details')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setUploadMsg('')

    const formData = new FormData(e.currentTarget)
    formData.append('courseId', course.id)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setUploadMsg('✅ ' + data.message)
        window.location.reload()
      } else {
        setUploadMsg('❌ ' + data.error)
      }
    } catch {
      setUploadMsg('❌ Upload failed')
    }

    setUploading(false)
  }

  const handleCreateExam = async (formData: FormData) => {
    formData.append('courseId', course.id)
    await createExam(course.id, formData)
  }

  const tabs = [
    { key: 'details', label: '📋 Details' },
    { key: 'modules', label: '📚 Modules' },
    { key: 'materials', label: '📄 Materials' },
    { key: 'exams', label: '📝 Exams' },
  ] as const

  return (
    <div>
      {/* Tab Navigation */}
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

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <form action={async (formData) => { await updateCourse(course.id, formData) }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label className="label">Course Title</label>
                <input name="title" defaultValue={course.title} className="input-field" required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" defaultValue={course.description} className="input-field" rows={5} style={{ resize: 'vertical' }} required />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" name="is_published" value="true" defaultChecked={course.is_published}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-500)' }} />
                  <span style={{ fontSize: '14px' }}>Publish this course</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary">Save Changes</button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={async () => {
                    if (confirm('Delete this course? This cannot be undone.')) {
                      await deleteCourse(course.id)
                    }
                  }}
                >
                  Delete Course
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <ModuleLessonManager courseId={course.id} modules={modules} materials={materials.map(m => ({ id: m.id, file_name: m.file_name }))} />
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Upload PDF Material</h3>
            <form onSubmit={handleUpload} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="label">PDF File</label>
                <input type="file" name="file" accept=".pdf" className="input-field" required />
              </div>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : '📤 Upload PDF'}
              </button>
            </form>
            {uploadMsg && (
              <p style={{ marginTop: '12px', fontSize: '13px', color: uploadMsg.startsWith('✅') ? 'var(--color-accent-400)' : 'var(--color-danger-500)' }}>
                {uploadMsg}
              </p>
            )}
          </div>

          {materials.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {materials.map((mat) => (
                <div key={mat.id} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: 600 }}>📄 {mat.file_name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                        {new Date(mat.uploaded_at).toLocaleDateString()}
                      </span>
                      <a
                        href={`/api/download/${mat.id}`}
                        download
                        style={{
                          fontSize: '12px', padding: '4px 10px', borderRadius: '6px',
                          background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-400)',
                          textDecoration: 'none', fontWeight: 500,
                        }}
                      >
                        ⬇ Download
                      </a>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-surface-400)', lineHeight: 1.6 }}>
                    {mat.extracted_text?.slice(0, 200)}...
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-surface-500)' }}>
              No materials uploaded yet
            </div>
          )}
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Create New Exam</h3>
            <form action={handleCreateExam} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="label">Exam Title</label>
                <input name="title" placeholder="e.g., Midterm Exam" className="input-field" required />
              </div>
              <div style={{ width: '200px' }}>
                <label className="label">Description</label>
                <input name="description" placeholder="Brief description" className="input-field" />
              </div>
              <div style={{ width: '140px' }}>
                <label className="label">Time Limit (min)</label>
                <input name="time_limit_minutes" type="number" placeholder="60" className="input-field" />
              </div>
              <button type="submit" className="btn-primary">+ Create Exam</button>
            </form>
          </div>

          {exams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/dashboard/instructor/exams/${exam.id}`}
                  className="glass-card"
                  style={{
                    padding: '20px', textDecoration: 'none', color: 'inherit',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>{exam.title}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--color-surface-500)' }}>
                      {(exam.questions as unknown[]).length} questions
                    </span>
                  </div>
                  <span className={`badge ${exam.is_published ? 'badge-accent' : 'badge-warning'}`}>
                    {exam.is_published ? 'Published' : 'Draft'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-surface-500)' }}>
              No exams created yet
            </div>
          )}
        </div>
      )}
    </div>
  )
}

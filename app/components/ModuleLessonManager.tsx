'use client'

import { useState, useTransition } from 'react'
import { createModule, deleteModule, createLesson, deleteLesson } from '@/app/actions/modules'
import { ChevronDown, ChevronRight, Plus, Trash2, FileText, Video, BookOpen } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  content_type: string
  sort_order: number
  duration_minutes?: number
}

interface Module {
  id: string
  title: string
  description?: string
  sort_order: number
  lessons: Lesson[]
}

interface Material {
  id: string
  file_name: string
}

interface ModuleLessonManagerProps {
  courseId: string
  modules: Module[]
  materials: Material[]
}

export default function ModuleLessonManager({ courseId, modules, materials }: ModuleLessonManagerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showAddModule, setShowAddModule] = useState(false)
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const contentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={14} style={{ color: 'var(--color-accent-400)' }} />
      case 'pdf': return <FileText size={14} style={{ color: 'var(--color-warning-500)' }} />
      default: return <BookOpen size={14} style={{ color: 'var(--color-primary-400)' }} />
    }
  }

  const handleCreateModule = (formData: FormData) => {
    startTransition(async () => {
      await createModule(courseId, formData)
      setShowAddModule(false)
    })
  }

  const handleCreateLesson = (moduleId: string, formData: FormData) => {
    startTransition(async () => {
      await createLesson(moduleId, courseId, formData)
      setAddingLessonTo(null)
    })
  }

  const handleDeleteModule = (moduleId: string) => {
    if (!confirm('Delete this module and all its lessons?')) return
    startTransition(async () => {
      await deleteModule(moduleId, courseId)
    })
  }

  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return
    startTransition(async () => {
      await deleteLesson(lessonId, courseId)
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Course Modules</h3>
        <button onClick={() => setShowAddModule(true)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>
          <Plus size={14} /> Add Module
        </button>
      </div>

      {/* Add Module Form */}
      {showAddModule && (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <form action={handleCreateModule} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="label">Module Title</label>
              <input name="title" className="input-field" placeholder="e.g. Introduction" required />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="label">Description (optional)</label>
              <input name="description" className="input-field" placeholder="Module description" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn-primary" disabled={isPending} style={{ padding: '10px 16px', fontSize: '13px' }}>
                {isPending ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowAddModule(false)} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '13px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modules List */}
      {modules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-surface-500)', fontSize: '14px' }}>
          No modules yet. Add your first module to structure the course.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {modules.map((mod, idx) => (
            <div key={mod.id} style={{
              border: '1px solid rgba(148,163,184,0.08)', borderRadius: '12px',
              background: 'rgba(15,23,42,0.3)', overflow: 'hidden',
            }}>
              {/* Module Header */}
              <div
                onClick={() => toggle(mod.id)}
                style={{
                  padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  borderBottom: expanded[mod.id] ? '1px solid rgba(148,163,184,0.06)' : 'none',
                }}
              >
                {expanded[mod.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span style={{ fontSize: '13px', color: 'var(--color-surface-500)', fontWeight: 600 }}>
                  Module {idx + 1}
                </span>
                <span style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>{mod.title}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>
                  {mod.lessons?.length || 0} lessons
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id) }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-danger-500)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Lessons */}
              {expanded[mod.id] && (
                <div style={{ padding: '8px 16px 12px' }}>
                  {mod.lessons?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                      {mod.lessons.map((lesson, lIdx) => (
                        <div key={lesson.id} style={{
                          padding: '10px 12px', borderRadius: '8px',
                          background: 'rgba(30,41,59,0.4)',
                          display: 'flex', alignItems: 'center', gap: '10px',
                          fontSize: '13px',
                        }}>
                          {contentTypeIcon(lesson.content_type)}
                          <span style={{ flex: 1 }}>
                            <strong>{lIdx + 1}.</strong> {lesson.title}
                          </span>
                          {lesson.duration_minutes && (
                            <span style={{ fontSize: '11px', color: 'var(--color-surface-500)' }}>
                              {lesson.duration_minutes}min
                            </span>
                          )}
                          <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {lesson.content_type}
                          </span>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-danger-500)', cursor: 'pointer', padding: '2px' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--color-surface-500)', padding: '8px 0' }}>
                      No lessons in this module yet.
                    </p>
                  )}

                  {/* Add Lesson */}
                  {addingLessonTo === mod.id ? (
                    <form action={(fd) => handleCreateLesson(mod.id, fd)} style={{
                      padding: '12px', borderRadius: '8px', background: 'rgba(30,41,59,0.4)',
                      display: 'flex', flexDirection: 'column', gap: '10px',
                    }}>
                      <input name="title" className="input-field" placeholder="Lesson title" required style={{ fontSize: '13px' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <select name="content_type" className="input-field" style={{ fontSize: '13px' }}>
                          <option value="text">📖 Text Content</option>
                          <option value="pdf">📄 PDF Material</option>
                          <option value="video">🎬 Video</option>
                        </select>
                        <input name="duration_minutes" type="number" className="input-field" placeholder="Duration (min)" style={{ fontSize: '13px' }} />
                      </div>
                      <textarea name="content" className="input-field" placeholder="Lesson content (for text lessons)" rows={3} style={{ fontSize: '13px', resize: 'vertical' }} />
                      <input name="video_url" className="input-field" placeholder="Video URL (for video lessons)" style={{ fontSize: '13px' }} />
                      <select name="pdf_material_id" className="input-field" style={{ fontSize: '13px' }}>
                        <option value="">Link to PDF material (optional)</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.file_name}</option>
                        ))}
                      </select>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="btn-accent" disabled={isPending} style={{ padding: '6px 12px', fontSize: '12px' }}>
                          {isPending ? 'Adding...' : 'Add Lesson'}
                        </button>
                        <button type="button" onClick={() => setAddingLessonTo(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setAddingLessonTo(mod.id)}
                      style={{
                        background: 'none', border: '1px dashed rgba(148,163,184,0.2)',
                        borderRadius: '8px', padding: '8px', width: '100%',
                        color: 'var(--color-surface-500)', cursor: 'pointer', fontSize: '13px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}
                    >
                      <Plus size={14} /> Add Lesson
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

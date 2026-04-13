'use client'

import { useState, useTransition } from 'react'
import { createReply, toggleLike } from '@/app/actions/discussions'
import { Heart, MessageSquare, Send } from 'lucide-react'

interface Reply {
  id: string
  content: string
  created_at: string
  user_name: string
  user_role: string
  like_count: number
  is_liked: boolean
}

interface DiscussionThreadProps {
  discussion: {
    id: string
    title: string
    content: string
    created_at: string
    user_name: string
    user_role: string
    course_title: string
    course_id: string
    is_pinned: boolean
  }
  replies: Reply[]
  currentUserId: string
}

export default function DiscussionThreadClient({ discussion, replies: initialReplies, currentUserId }: DiscussionThreadProps) {
  const [replies, setReplies] = useState(initialReplies)
  const [replyContent, setReplyContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const roleBadge = (role: string) => {
    const isInstructor = role === 'instructor'
    return (
      <span style={{
        fontSize: '10px',
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: '4px',
        background: isInstructor ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)',
        color: isInstructor ? '#818cf8' : '#22c55e',
        textTransform: 'capitalize',
      }}>
        {role}
      </span>
    )
  }

  function handleReply() {
    if (!replyContent.trim()) return
    const formData = new FormData()
    formData.set('discussion_id', discussion.id)
    formData.set('content', replyContent)

    startTransition(async () => {
      const result = await createReply(discussion.id, discussion.course_id, formData)
      if (!result.error) {
        setReplies(prev => [...prev, {
          id: crypto.randomUUID(),
          content: replyContent,
          created_at: new Date().toISOString(),
          user_name: 'You',
          user_role: '',
          like_count: 0,
          is_liked: false,
        }])
        setReplyContent('')
      }
    })
  }

  function handleLike(replyId: string) {
    startTransition(async () => {
      await toggleLike(null, replyId, discussion.course_id)
      setReplies(prev => prev.map(r =>
        r.id === replyId
          ? { ...r, is_liked: !r.is_liked, like_count: r.is_liked ? r.like_count - 1 : r.like_count + 1 }
          : r
      ))
    })
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Discussion post */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          {discussion.is_pinned && <span style={{ fontSize: '14px' }}>📌</span>}
          <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
            {discussion.course_title}
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>{discussion.title}</h1>
        <p style={{ color: 'var(--color-surface-300)', lineHeight: 1.7, marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
          {discussion.content}
        </p>
        <div style={{ fontSize: '12px', color: 'var(--color-surface-500)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            by {discussion.user_name} {roleBadge(discussion.user_role)}
          </span>
          <span>{new Date(discussion.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Replies */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={18} />
        {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {replies.map((reply) => (
          <div key={reply.id} className="glass-card" style={{ padding: '16px' }}>
            <p style={{ color: 'var(--color-surface-300)', lineHeight: 1.6, marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
              {reply.content}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-surface-500)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {reply.user_name} {reply.user_role && roleBadge(reply.user_role)}
                </span>
                <span>{new Date(reply.created_at).toLocaleString()}</span>
              </div>
              <button
                onClick={() => handleLike(reply.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '12px',
                  color: reply.is_liked ? '#ef4444' : 'var(--color-surface-500)',
                  transition: 'color 0.2s',
                }}
              >
                <Heart size={14} fill={reply.is_liked ? '#ef4444' : 'none'} />
                {reply.like_count}
              </button>
            </div>
          </div>
        ))}
        {replies.length === 0 && (
          <p style={{ textAlign: 'center', padding: '32px', color: 'var(--color-surface-500)', fontSize: '14px' }}>
            No replies yet — be the first to respond!
          </p>
        )}
      </div>

      {/* Reply form */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write a reply..."
          className="input-field"
          rows={3}
          style={{ resize: 'vertical', marginBottom: '12px' }}
        />
        <button
          onClick={handleReply}
          disabled={isPending || !replyContent.trim()}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Send size={14} />
          {isPending ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </div>
  )
}

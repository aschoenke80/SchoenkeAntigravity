'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWidgetProps {
  courseId: string
  courseTitle: string
  initialMessages?: Message[]
}

export default function ChatWidget({ courseId, courseTitle, initialMessages = [] }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          message: userMessage,
          history: messages.slice(-6),
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Failed to get response.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'rgba(15,23,42,0.4)', borderRadius: '16px',
      border: '1px solid rgba(148,163,184,0.1)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(148,163,184,0.1)',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(99,102,241,0.05)',
      }}>
        <Bot size={20} style={{ color: 'var(--color-primary-400)' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>AI Study Assistant</div>
          <div style={{ fontSize: '12px', color: 'var(--color-surface-500)' }}>{courseTitle}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        minHeight: '300px', maxHeight: '500px',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-surface-500)' }}>
            <Bot size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>Ask me anything about this course!</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <span>&quot;Explain the key concepts&quot;</span>
              <span>&quot;Summarize this lesson&quot;</span>
              <span>&quot;Help me understand...&quot;</span>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: '10px',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
            }}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: '12px',
              fontSize: '14px', lineHeight: 1.6,
              background: msg.role === 'user' ? 'rgba(99,102,241,0.12)' : 'rgba(30,41,59,0.6)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(16,185,129,0.2)',
            }}>
              <Bot size={14} />
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(30,41,59,0.6)' }}>
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-primary-400)' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid rgba(148,163,184,0.1)',
        display: 'flex', gap: '8px',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask a question about this course..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)',
            color: 'var(--color-surface-100)', fontSize: '14px', outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 14px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))',
            color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

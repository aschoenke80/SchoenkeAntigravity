'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { markNotificationRead, markAllNotificationsRead } from '@/app/actions/notifications'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  link?: string
  is_read: boolean
  created_at: string
}

interface NotificationBellProps {
  initialNotifications: Notification[]
  initialUnreadCount: number
}

export default function NotificationBell({ initialNotifications, initialUnreadCount }: NotificationBellProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleReadAll = async () => {
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const typeIcons: Record<string, string> = {
    info: 'ℹ️', success: '✅', warning: '⚠️', exam: '📝', course: '📚', badge: '🏆',
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: 'rgba(30,41,59,0.6)',
          border: '1px solid rgba(148,163,184,0.15)', borderRadius: '10px',
          padding: '8px', cursor: 'pointer', color: 'var(--color-surface-300)',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: 'var(--color-danger-500)', color: 'white',
            borderRadius: '10px', fontSize: '10px', fontWeight: 700,
            padding: '1px 5px', minWidth: '16px', textAlign: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: '8px',
          width: '360px', maxHeight: '480px', overflowY: 'auto',
          background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(148,163,184,0.15)',
          borderRadius: '12px', zIndex: 50, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid rgba(148,163,184,0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button onClick={handleReadAll} title="Mark all as read" style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-primary-400)', fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <CheckCheck size={14} /> Read all
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-surface-500)',
              }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-surface-500)', fontSize: '14px' }}>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.is_read) handleRead(n.id)
                  if (n.link) window.location.href = n.link
                }}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.05)',
                  cursor: n.link ? 'pointer' : 'default',
                  background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.04)',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{typeIcons[n.type] || 'ℹ️'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: n.is_read ? 400 : 600, marginBottom: '2px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-surface-500)', lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-surface-600)', marginTop: '4px' }}>
                      {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!n.is_read && (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: 'var(--color-primary-500)', flexShrink: 0, marginTop: '4px',
                    }} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

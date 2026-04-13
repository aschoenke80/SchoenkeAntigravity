'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NeoProLogo from './NeoProLogo'
import { logout } from '@/app/actions/auth'
import type { UserRole } from '@/lib/database.types'
import {
  LayoutDashboard, BookOpen, FileText, Users, LogOut,
  GraduationCap, ClipboardList, BarChart3, Settings, Upload,
  MessageSquare, Award, Trophy
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  role: UserRole
  userName: string
}

const navItems: Record<UserRole, { label: string; href: string; icon: React.ReactNode }[]> = {
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Courses', href: '/dashboard/admin/courses', icon: <BookOpen size={18} /> },
    { label: 'Analytics', href: '/dashboard/admin/analytics', icon: <BarChart3 size={18} /> },
  ],
  instructor: [
    { label: 'Dashboard', href: '/dashboard/instructor', icon: <LayoutDashboard size={18} /> },
    { label: 'My Courses', href: '/dashboard/instructor/courses', icon: <BookOpen size={18} /> },
    { label: 'Students', href: '/dashboard/instructor/students', icon: <Users size={18} /> },
    { label: 'Upload PDFs', href: '/dashboard/instructor/upload', icon: <Upload size={18} /> },
    { label: 'Exams', href: '/dashboard/instructor/exams', icon: <ClipboardList size={18} /> },
    { label: 'Discussions', href: '/dashboard/instructor/discussions', icon: <MessageSquare size={18} /> },
    { label: 'Analytics', href: '/dashboard/instructor/analytics', icon: <BarChart3 size={18} /> },
  ],
  student: [
    { label: 'Dashboard', href: '/dashboard/student', icon: <LayoutDashboard size={18} /> },
    { label: 'Courses', href: '/dashboard/student/courses', icon: <GraduationCap size={18} /> },
    { label: 'My Exams', href: '/dashboard/student/exams', icon: <FileText size={18} /> },
    { label: 'Scores', href: '/dashboard/student/scores', icon: <BarChart3 size={18} /> },
    { label: 'Discussions', href: '/dashboard/student/discussions', icon: <MessageSquare size={18} /> },
    { label: 'Certificates', href: '/dashboard/student/certificates', icon: <Award size={18} /> },
    { label: 'Leaderboard', href: '/dashboard/student/leaderboard', icon: <Trophy size={18} /> },
  ],
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  instructor: 'Instructor',
  student: 'Student',
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = navItems[role] || []

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 1001,
          background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(148,163,184,0.15)',
          borderRadius: '10px', padding: '10px', color: 'var(--color-surface-200)',
          cursor: 'pointer', display: 'none',
        }}
        className="mobile-menu-btn"
      >
        <Settings size={20} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 999, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside
        className={mobileOpen ? 'sidebar-open' : ''}
        style={{
          width: '260px', minHeight: '100vh', background: 'rgba(15,23,42,0.95)',
          borderRight: '1px solid rgba(148,163,184,0.08)',
          padding: '24px 16px', display: 'flex', flexDirection: 'column',
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 1000,
          backdropFilter: 'blur(20px)', transition: 'transform 0.3s',
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '0 8px', marginBottom: '32px'
        }}>
          <NeoProLogo size={36} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>NeoPro</div>
            <div style={{ fontSize: '11px', color: 'var(--color-surface-500)' }}>{roleLabels[role]}</div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px', fontSize: '14px',
                  fontWeight: isActive ? 600 : 400, transition: 'all 0.2s',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: isActive ? 'var(--color-primary-400)' : 'var(--color-surface-400)',
                  textDecoration: 'none',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div style={{
          borderTop: '1px solid rgba(148,163,184,0.08)',
          paddingTop: '16px', marginTop: '16px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px', marginBottom: '8px'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '13px', color: 'white', flexShrink: 0
            }}>
              {userName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-surface-500)' }}>
                {roleLabels[role]}
              </div>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
              padding: '10px 12px', borderRadius: '10px', fontSize: '14px',
              background: 'transparent', border: 'none',
              color: 'var(--color-surface-400)', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .mobile-overlay { display: block !important; }
          aside {
            transform: translateX(-100%);
          }
          aside.sidebar-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  )
}

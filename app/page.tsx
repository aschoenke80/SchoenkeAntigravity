'use client'

import Link from 'next/link'
import NeoProLogo from './components/NeoProLogo'


export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid rgba(148,163,184,0.08)',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NeoProLogo size={36} />
          <span style={{ fontSize: '20px', fontWeight: 700 }}>NeoPro</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" className="btn-secondary">Log In</Link>
          <Link href="/signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
        textAlign: 'center', position: 'relative', zIndex: 1
      }}>
        <div className="animate-fade-in" style={{ maxWidth: '720px', zIndex: 1 }}>
          <div className="badge badge-primary" style={{ marginBottom: '24px' }}>
            ✦ AI-Powered Learning Platform
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800,
            lineHeight: 1.1, marginBottom: '24px'
          }}>
            The Future of{' '}
            <span className="glow-text">Learning</span>{' '}
            is Here
          </h1>
          <p style={{
            fontSize: '18px', color: 'var(--color-surface-400)',
            maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7
          }}>
            Create courses, upload materials, and let AI generate exams instantly.
            A complete learning management system for educators and students.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              Start Teaching →
            </Link>
            <Link href="/signup" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              Join as Student
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="animate-slide-up" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px', maxWidth: '900px', width: '100%',
          marginTop: '80px', zIndex: 1
        }}>
          {[
            { icon: '📚', title: 'Course Management', desc: 'Create and manage courses with ease' },
            { icon: '🤖', title: 'AI Exam Generation', desc: 'Generate exams from PDF materials instantly' },
            { icon: '📊', title: 'Score Tracking', desc: 'Real-time grading and performance analytics' },
          ].map((feature) => (
            <div key={feature.title} className="glass-card" style={{ padding: '28px', textAlign: 'left' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-surface-400)', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{
        textAlign: 'center', padding: '24px',
        borderTop: '1px solid rgba(148,163,184,0.08)',
        color: 'var(--color-surface-500)', fontSize: '13px',
        position: 'relative', zIndex: 1
      }}>
        © 2026 NeoPro. Built with Next.js & Supabase.
      </footer>
    </div>
  )
}

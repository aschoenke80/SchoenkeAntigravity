'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import NeoProLogo from '@/app/components/NeoProLogo'


export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden'
    }}>

      <div className="glass-card animate-fade-in" style={{
        width: '100%', maxWidth: '420px', padding: '40px', zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ margin: '0 auto 16px', width: '48px' }}>
            <NeoProLogo size={48} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Create an account</h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
            Join NeoPro to start learning or teaching
          </p>
        </div>

        {state?.message && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--color-danger-500)', fontSize: '13px', marginBottom: '20px'
          }}>
            {state.message}
          </div>
        )}

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="name" className="label">Full Name</label>
            <input id="name" name="name" type="text" placeholder="John Doe" className="input-field" required />
            {state?.errors?.name && <p className="error-text">{state.errors.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">Email Address</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" className="input-field" required />
            {state?.errors?.email && <p className="error-text">{state.errors.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="student_id_number" className="label">Student/Staff ID Number</label>
            <input id="student_id_number" name="student_id_number" type="text" placeholder="e.g. 22200002344" className="input-field" />
            {state?.errors?.student_id_number && <p className="error-text">{state.errors.student_id_number[0]}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" placeholder="Min 8 characters" className="input-field" required />
            {state?.errors?.password && (
              <div className="error-text">
                {state.errors.password.map((err: string) => <p key={err}>{err}</p>)}
              </div>
            )}
          </div>

          <div>
            <label className="label">I am a</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '12px', borderRadius: '10px',
                background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)',
                cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
              }}>
                <input type="radio" name="role" value="student" defaultChecked
                  style={{ accentColor: 'var(--color-primary-500)' }} />
                🎓 Student
              </label>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '12px', borderRadius: '10px',
                background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.15)',
                cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
              }}>
                <input type="radio" name="role" value="instructor"
                  style={{ accentColor: 'var(--color-primary-500)' }} />
                👨‍🏫 Instructor
              </label>
            </div>
            {state?.errors?.role && <p className="error-text">{state.errors.role[0]}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={pending}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            {pending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '14px', color: 'var(--color-surface-400)'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary-400)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

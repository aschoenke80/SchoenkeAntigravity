'use client'

import { useActionState } from 'react'
import { resetPassword, type ResetPasswordState } from '@/app/actions/auth'
import Link from 'next/link'
import NeoProLogo from '@/app/components/NeoProLogo'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(resetPassword, {} as ResetPasswordState)

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
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Reset Password</h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
            Verify your identity with your Student/Staff ID
          </p>
        </div>

        {state?.message && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px',
            background: state.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${state.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: state.success ? '#22c55e' : 'var(--color-danger-500)',
            fontSize: '13px', marginBottom: '20px'
          }}>
            {state.message}
          </div>
        )}

        {state?.success ? (
          <Link href="/login" className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Go to Login
          </Link>
        ) : (
          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" className="input-field" required />
              {state?.errors?.email && <p className="error-text">{state.errors.email[0]}</p>}
            </div>

            <div>
              <label htmlFor="student_id_number" className="label">Student/Staff ID Number</label>
              <input id="student_id_number" name="student_id_number" type="text" placeholder="e.g. 22200002344" className="input-field" required />
              {state?.errors?.student_id_number && <p className="error-text">{state.errors.student_id_number[0]}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">New Password</label>
              <input id="password" name="password" type="password" placeholder="Min 8 characters" className="input-field" required />
              {state?.errors?.password && (
                <div className="error-text">
                  {state.errors.password.map((err: string) => <p key={err}>{err}</p>)}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={pending}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
              {pending ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '14px', color: 'var(--color-surface-400)'
        }}>
          Remember your password?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary-400)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

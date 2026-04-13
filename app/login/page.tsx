'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import NeoProLogo from '@/app/components/NeoProLogo'


export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

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
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ color: 'var(--color-surface-400)', fontSize: '14px' }}>
            Sign in to your NeoPro account
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
            <label htmlFor="email" className="label">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="input-field"
              required
            />
            {state?.errors?.email && <p className="error-text">{state.errors.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="input-field"
              required
            />
            {state?.errors?.password && <p className="error-text">{state.errors.password[0]}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={pending}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            {pending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/forgot-password" style={{ color: 'var(--color-surface-400)', fontSize: '13px' }}>
            Forgot your password?
          </Link>
        </div>

        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '14px', color: 'var(--color-surface-400)'
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--color-primary-400)', fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

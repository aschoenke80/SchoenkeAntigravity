import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{ padding: '48px', maxWidth: '440px' }}>
        <p style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Access Denied</h1>
        <p style={{ color: 'var(--color-surface-400)', marginBottom: '24px', lineHeight: 1.6 }}>
          You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Link href="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  )
}

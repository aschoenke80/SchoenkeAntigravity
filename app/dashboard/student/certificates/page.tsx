import { requireAuth } from '@/lib/session'
import { getCertificates } from '@/app/actions/certificates'
import Link from 'next/link'

export default async function CertificatesPage() {
  const session = await requireAuth(['student'])
  const certificates = await getCertificates()

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>My Certificates</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '24px' }}>
        Complete all lessons in a course to earn a certificate
      </p>

      {certificates.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {certificates.map((cert) => (
            <div key={cert.id} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              {/* Decorative gradient border */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, #6366f1, #10b981, #f59e0b)',
              }} />

              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '48px' }}>🏆</span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>
                Certificate of Completion
              </h3>
              <p style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', color: 'var(--color-primary-400)', marginBottom: '12px' }}>
                {cert.course_title}
              </p>
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '16px' }}>
                <p>Issued to <strong>{cert.student_name}</strong></p>
                <p>on {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-surface-500)', fontFamily: 'monospace' }}>
                ID: {cert.certificate_number}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</p>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No certificates yet</h2>
          <p style={{ color: 'var(--color-surface-500)', marginBottom: '16px' }}>
            Complete all lessons in a course to earn your certificate
          </p>
          <Link href="/dashboard/student/courses" className="btn-primary">
            View Courses
          </Link>
        </div>
      )}
    </div>
  )
}

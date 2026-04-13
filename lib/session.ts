import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { encrypt, decrypt, type SessionPayload } from '@/lib/auth'
import type { UserRole } from '@/lib/database.types'

export type { SessionPayload }
export { decrypt }

export async function createSession(user: { id: string; email: string; name: string; role: UserRole }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt,
  })
  const cookieStore = await cookies()

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  return decrypt(session)
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect('/unauthorized')
  }
  return session
}

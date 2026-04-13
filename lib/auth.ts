import { SignJWT, jwtVerify } from 'jose'
import type { UserRole } from '@/lib/database.types'

const secretKey = process.env.SESSION_SECRET || 'fallback-dev-secret-change-in-production'
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: UserRole
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

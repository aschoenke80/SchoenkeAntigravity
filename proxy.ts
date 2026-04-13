import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/signup', '/', '/forgot-password']

export async function proxy(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname
    const isProtected = protectedRoutes.some((route) => path.startsWith(route))
    const isPublicAuth = publicRoutes.includes(path)

    const session = request.cookies.get('session')?.value
    const payload = await decrypt(session)

    // Redirect to login if accessing protected route without session
    if (isProtected && !payload) {
      return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    // Redirect to dashboard if accessing login/signup with valid session
    if (isPublicAuth && payload) {
      const dashboardMap: Record<string, string> = {
        admin: '/dashboard/admin',
        instructor: '/dashboard/instructor',
        student: '/dashboard/student',
      }
      return NextResponse.redirect(
        new URL(dashboardMap[payload.role] || '/dashboard/student', request.nextUrl)
      )
    }

    // Role-based route protection
    if (payload) {
      if (path.startsWith('/dashboard/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.nextUrl))
      }
      if (path.startsWith('/dashboard/instructor') && payload.role !== 'instructor') {
        return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.nextUrl))
      }
      if (path.startsWith('/dashboard/student') && payload.role !== 'student') {
        return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.nextUrl))
      }
    }

    return NextResponse.next()
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Sidebar from '@/app/components/Sidebar'
import NotificationBell from '@/app/components/NotificationBell'
import { getNotifications, getUnreadCount } from '@/app/actions/notifications'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadCount(),
  ])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role={session.role} userName={session.name} />
      <main style={{
        flex: 1, marginLeft: '260px', padding: '32px',
        minHeight: '100vh', maxWidth: '100%', position: 'relative',
      }}>
        {/* Top bar with notifications */}
        <div style={{
          position: 'absolute', top: '16px', right: '32px', zIndex: 50,
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <NotificationBell
            initialNotifications={notifications as any}
            initialUnreadCount={unreadCount}
          />
        </div>
        <style>{`
          @media (max-width: 768px) {
            main { margin-left: 0 !important; padding: 16px !important; padding-top: 60px !important; }
          }
        `}</style>
        {children}
      </main>
    </div>
  )
}

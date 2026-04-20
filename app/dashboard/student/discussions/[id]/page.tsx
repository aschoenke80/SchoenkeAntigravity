import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import DiscussionThreadClient from './DiscussionThreadClient'

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(['student', 'instructor'])
  const { id } = await params

  const { data: discussion } = await supabaseAdmin
    .from('discussions')
    .select('*, users(name, role), courses(title)')
    .eq('id', id)
    .single()

  if (!discussion) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>💬</p>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Discussion not found</h2>
      </div>
    )
  }

  const { data: replies } = await supabaseAdmin
    .from('discussion_replies')
    .select('*, users(name, role)')
    .eq('discussion_id', id)
    .order('created_at', { ascending: true })

  // Get likes for these replies by current user
  const replyIds = replies?.map(r => r.id) || []
  let userLikes: string[] = []
  if (replyIds.length > 0) {
    const { data: likes } = await supabaseAdmin
      .from('discussion_likes')
      .select('reply_id')
      .eq('user_id', session.userId)
      .in('reply_id', replyIds)

    userLikes = likes?.map(l => l.reply_id) || []
  }

  const formattedReplies = (replies || []).map(r => ({
    id: r.id,
    content: r.content,
    created_at: r.created_at,
    user_name: (r.users as any)?.name || 'Unknown',
    user_role: (r.users as any)?.role || 'student',
    like_count: r.likes_count || 0,
    is_liked: userLikes.includes(r.id),
  }))

  return (
    <div>
      <Link href="/dashboard/student/discussions"
        style={{ fontSize: '13px', color: 'var(--color-surface-400)', marginBottom: '16px', display: 'inline-block' }}>
        ← Back to Discussions
      </Link>

      <DiscussionThreadClient
        discussion={{
          id: discussion.id,
          title: discussion.title,
          content: discussion.content,
          created_at: discussion.created_at,
          user_name: (discussion.users as any)?.name || 'Unknown',
          user_role: (discussion.users as any)?.role || 'student',
          course_title: (discussion.courses as any)?.title || '',
          course_id: discussion.course_id,
          is_pinned: discussion.is_pinned,
        }}
        replies={formattedReplies}
        currentUserId={session.userId}
        canEdit={discussion.user_id === session.userId}
        backHref="/dashboard/student/discussions"
      />
    </div>
  )
}

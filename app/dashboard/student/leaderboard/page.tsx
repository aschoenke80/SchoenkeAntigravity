import { requireAuth } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { Trophy, Medal, Star, Zap } from 'lucide-react'

export default async function LeaderboardPage() {
  const session = await requireAuth(['student'])

  // Get top students by XP
  const { data: topStudents } = await supabaseAdmin
    .from('users')
    .select('id, name, xp_total')
    .eq('role', 'student')
    .order('xp_total', { ascending: false })
    .limit(25)

  // Get current user's badges
  const { data: userBadges } = await supabaseAdmin
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', session.userId)
    .order('earned_at', { ascending: false })

  // Get all available badges
  const { data: allBadges } = await supabaseAdmin
    .from('badges')
    .select('*')
    .order('name', { ascending: true })

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || [])

  // Find current user rank
  const myRank = topStudents?.findIndex(s => s.id === session.userId) ?? -1
  const myXp = topStudents?.find(s => s.id === session.userId)?.xp_total || 0

  const podiumColors = ['#f59e0b', '#94a3b8', '#cd7f32'] // gold, silver, bronze

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Leaderboard</h1>
      <p style={{ color: 'var(--color-surface-400)', fontSize: '14px', marginBottom: '24px' }}>
        Earn XP by completing lessons, posting in discussions, and more
      </p>

      {/* Your stats */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Zap size={24} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-surface-400)' }}>Your XP</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{myXp}</div>
          </div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(148,163,184,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={24} color="#6366f1" />
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-surface-400)' }}>Your Rank</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>
              {myRank >= 0 ? `#${myRank + 1}` : 'Unranked'}
            </div>
          </div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(148,163,184,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Star size={24} color="#10b981" />
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-surface-400)' }}>Badges Earned</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
              {userBadges?.length || 0}/{allBadges?.length || 0}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Leaderboard table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} /> Top Students
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {topStudents?.map((student, index) => {
              const isMe = student.id === session.userId
              return (
                <div
                  key={student.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '8px',
                    background: isMe ? 'rgba(99,102,241,0.1)' : index < 3 ? 'rgba(15,23,42,0.3)' : 'transparent',
                    border: isMe ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '13px', flexShrink: 0,
                    background: index < 3 ? podiumColors[index] : 'rgba(148,163,184,0.1)',
                    color: index < 3 ? '#000' : 'var(--color-surface-400)',
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: isMe ? 600 : 400 }}>
                    {student.name}{isMe ? ' (You)' : ''}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>
                    {student.xp_total} XP
                  </span>
                </div>
              )
            })}
            {(!topStudents || topStudents.length === 0) && (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-surface-500)' }}>
                No students yet
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Medal size={18} /> Badges
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {allBadges?.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  style={{
                    padding: '16px', borderRadius: '12px', textAlign: 'center',
                    background: earned ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.3)',
                    border: earned ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(148,163,184,0.06)',
                    opacity: earned ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
                    {badge.icon || '🏅'}
                  </span>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    {badge.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-surface-500)' }}>
                    {badge.description}
                  </p>
                  {earned && (
                    <span style={{ fontSize: '10px', color: '#10b981', marginTop: '8px', display: 'block' }}>
                      ✓ Earned
                    </span>
                  )}
                </div>
              )
            })}
            {(!allBadges || allBadges.length === 0) && (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-surface-500)', gridColumn: '1 / -1' }}>
                No badges available yet
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

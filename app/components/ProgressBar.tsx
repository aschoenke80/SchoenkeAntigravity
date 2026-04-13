'use client'

interface ProgressBarProps {
  percentage: number
  height?: number
  showLabel?: boolean
  color?: string
}

export default function ProgressBar({ percentage, height = 8, showLabel = true, color }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, percentage))
  const barColor = color || (pct >= 100 ? '#10b981' : pct >= 50 ? '#6366f1' : '#f59e0b')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      <div style={{
        flex: 1, height: `${height}px`, borderRadius: `${height}px`,
        background: 'rgba(148,163,184,0.1)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: `${height}px`,
          background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
          transition: 'width 0.5s ease-out',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: '13px', fontWeight: 600, color: barColor, minWidth: '40px', textAlign: 'right' }}>
          {pct}%
        </span>
      )}
    </div>
  )
}
